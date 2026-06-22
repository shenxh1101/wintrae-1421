import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import { getPetTypeText } from '@/utils';

const RegularPetsPage: React.FC = () => {
  const { pets, orders, updatePetRemark } = useAppContext();
  const [regularPets, setRegularPets] = useState(pets.filter((p) => p.isRegular));

  useEffect(() => {
    setRegularPets(pets.filter((p) => p.isRegular));
    console.log('[RegularPets] 常客数量:', pets.filter((p) => p.isRegular).length);
  }, [pets]);

  const getPetOrderCount = (petId: string) => {
    return orders.filter((o) => o.petId === petId && o.status !== 'cancelled').length;
  };

  const getTotalAmount = (petId: string) => {
    return orders
      .filter((o) => o.petId === petId && o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  };

  const handleEditRemark = (petId: string, currentRemark: string) => {
    Taro.showModal({
      title: '编辑寄养备注',
      editable: true,
      placeholderText: '请输入寄养备注',
      content: currentRemark || '',
      success: (res) => {
        if (res.confirm && res.content !== undefined) {
          console.log('[RegularPets] 更新备注:', petId, res.content);
          updatePetRemark(petId, res.content);
          Taro.showToast({ title: '备注已更新', icon: 'success' });
        }
      }
    });
  };

  const handlePetClick = (petId: string) => {
    Taro.navigateTo({ url: `/pages/pet-detail/index?id=${petId}` });
  };

  const totalAmount = useMemo(() => {
    return regularPets.reduce((sum, pet) => sum + getTotalAmount(pet.id), 0);
  }, [regularPets, orders]);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>常客管理</Text>
        <Text className={styles.desc}>管理您的常客宝贝，添加特殊照顾备注</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.value}>{regularPets.length}</Text>
          <Text className={styles.label}>常客数量</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.value}>¥{totalAmount.toFixed(0)}</Text>
          <Text className={styles.label}>累计收入</Text>
        </View>
      </View>

      {regularPets.length > 0 ? (
        <View className={styles.petList}>
          {regularPets.map((pet) => (
            <View key={pet.id} className={styles.petCard}>
              <View className={styles.petHeader} onClick={() => handlePetClick(pet.id)}>
                <Image className={styles.avatar} src={pet.avatar} mode="aspectFill" />
                <View className={styles.info}>
                  <Text className={styles.name}>
                    {pet.name}
                    <Text className={styles.regularBadge}>⭐ 常客</Text>
                  </Text>
                  <Text className={styles.meta}>
                    {getPetTypeText(pet.type)} · {pet.breed} · {pet.age}岁
                  </Text>
                  <Text className={styles.owner}>
                    主人：{pet.ownerName} · {pet.ownerPhone}
                  </Text>
                </View>
                <View className={styles.stats}>
                  <Text className={styles.count}>{getPetOrderCount(pet.id)}</Text>
                  <Text className={styles.label}>寄养次数</Text>
                </View>
              </View>
              <View className={styles.remarkSection}>
                <Text className={styles.remarkLabel}>寄养备注</Text>
                {pet.remark ? (
                  <View className={styles.remarkBox}>
                    <Text className={styles.content}>{pet.remark}</Text>
                  </View>
                ) : null}
                <Button
                  className={styles.editBtn}
                  onClick={() => handleEditRemark(pet.id, pet.remark || '')}
                >
                  {pet.remark ? '✏️ 编辑备注' : '+ 添加备注'}
                </Button>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.empty}>
          <Text className={styles.icon}>⭐</Text>
          <Text className={styles.text}>暂无常客宝贝</Text>
          <Text style={{ fontSize: '22rpx', color: '#9c8c7e' }}>
            寄养3次以上的宠物会自动标记为常客
          </Text>
        </View>
      )}
    </View>
  );
};

export default RegularPetsPage;
