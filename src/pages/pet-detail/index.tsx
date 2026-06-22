import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import { getPetTypeText, formatDate, formatMoney } from '@/utils';
import classnames from 'classnames';
import dayjs from 'dayjs';

const PetDetailPage: React.FC = () => {
  const router = useRouter();
  const { pets, orders } = useAppContext();
  const [pet, setPet] = useState(pets.find((p) => p.id === router.params.id));

  useEffect(() => {
    const petId = router.params.id;
    console.log('[PetDetail] 宠物ID:', petId);
    const foundPet = pets.find((p) => p.id === petId);
    setPet(foundPet);
  }, [router.params.id, pets]);

  const petOrders = orders.filter((o) => o.petId === pet?.id && o.status !== 'cancelled');

  const getVaccineStatus = (vaccine: { date: string; nextDate?: string }) => {
    if (!vaccine.nextDate) return 'valid';
    const nextDate = dayjs(vaccine.nextDate);
    const now = dayjs();
    if (nextDate.isBefore(now)) return 'expired';
    if (nextDate.diff(now, 'day') <= 30) return 'expiring';
    return 'valid';
  };

  const statusTextMap: Record<string, string> = {
    valid: '在有效期内',
    expiring: '即将到期',
    expired: '已过期'
  };

  const handleCall = (phone: string) => {
    console.log('[PetDetail] 拨打电话:', phone);
    const realPhone = phone.replace(/\*/g, '0');
    Taro.makePhoneCall({ phoneNumber: realPhone }).catch(() => {
      Taro.showToast({ title: '拨号失败', icon: 'none' });
    });
  };

  const handleAddRemark = () => {
    if (!pet) return;
    Taro.showModal({
      title: '添加寄养备注',
      editable: true,
      placeholderText: '请输入寄养备注',
      success: (res) => {
        if (res.confirm && res.content) {
          console.log('[PetDetail] 添加备注:', res.content);
          Taro.showToast({ title: '备注已添加', icon: 'success' });
        }
      }
    });
  };

  if (!pet) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text className={styles.icon}>🐾</Text>
          <Text className={styles.text}>宠物不存在</Text>
        </View>
      </View>
    );
  }

  const genderText = pet.gender === 'male' ? '♂ 公' : '♀ 母';

  return (
    <View className={styles.page}>
      <View className={styles.petHeader}>
        <Image className={styles.avatar} src={pet.avatar} mode="aspectFill" />
        <Text className={styles.name}>{pet.name}</Text>
        <Text className={styles.meta}>
          {getPetTypeText(pet.type)} · {pet.breed} · {genderText}
        </Text>
        <View className={styles.tags}>
          {pet.isRegular && <Text className={styles.tag}>⭐ 常客宝贝</Text>}
          {pet.personalityTags.slice(0, 3).map((tag, idx) => (
            <Text key={idx} className={styles.tag}>{tag}</Text>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📋</Text>基本信息
        </Text>
        <View className={styles.basicInfo}>
          <View className={styles.infoItem}>
            <Text className={styles.label}>品种</Text>
            <Text className={styles.value}>{pet.breed}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.label}>年龄</Text>
            <Text className={styles.value}>{pet.age}岁</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.label}>体重</Text>
            <Text className={styles.value}>{pet.weight}kg</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.label}>性别</Text>
            <Text className={styles.value}>{genderText}</Text>
          </View>
          <View className={styles.infoItem} style={{ flex: '1 1 100%' }}>
            <Text className={styles.label}>主人</Text>
            <Text className={styles.value}>{pet.ownerName} · {pet.ownerPhone}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>💉</Text>疫苗情况
        </Text>
        {pet.vaccines.length > 0 ? (
          <View className={styles.vaccineList}>
            {pet.vaccines.map((vaccine, idx) => {
              const status = getVaccineStatus(vaccine);
              return (
                <View key={idx} className={styles.vaccineItem}>
                  <View className={styles.info}>
                    <Text className={styles.name}>{vaccine.name}</Text>
                    <Text className={styles.date}>接种日期：{formatDate(vaccine.date)}</Text>
                  </View>
                  <View className={styles.status}>
                    <Text className={classnames(styles.statusTag, styles[status])}>
                      {statusTextMap[status]}
                    </Text>
                    {vaccine.nextDate && (
                      <Text className={styles.nextDate}>下次：{formatDate(vaccine.nextDate)}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={{ fontSize: '24rpx', color: '#9c8c7e', textAlign: 'center', padding: '40rpx 0' }}>
            暂无疫苗记录
          </Text>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🍽️</Text>饮食习惯
        </Text>
        <View className={styles.dietBox}>
          <Text className={styles.content}>{pet.dietHabit}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🏷️</Text>性格标签
        </Text>
        <View className={styles.personalityTags}>
          {pet.personalityTags.map((tag, idx) => (
            <Text key={idx} className={styles.tag}>{tag}</Text>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📞</Text>紧急联系人
        </Text>
        <View className={styles.contactCard}>
          <View className={styles.avatar}>
            {pet.emergencyContact.name.charAt(0)}
          </View>
          <View className={styles.info}>
            <Text className={styles.name}>{pet.emergencyContact.name}</Text>
            <Text className={styles.relation}>{pet.emergencyContact.relation}</Text>
            <Text className={styles.phone}>{pet.emergencyContact.phone}</Text>
          </View>
          <Button
            className={styles.callBtn}
            onClick={() => handleCall(pet.emergencyContact.phone)}
          >
            📞
          </Button>
        </View>
      </View>

      {pet.remark && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>📝</Text>寄养备注
          </Text>
          <View className={styles.remarkBox}>
            <Text className={styles.label}>重要提醒</Text>
            <Text className={styles.content}>{pet.remark}</Text>
          </View>
        </View>
      )}

      {!pet.remark && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>📝</Text>寄养备注
          </Text>
          <Button className={styles.addRemarkBtn} onClick={handleAddRemark}>
            + 添加寄养备注
          </Button>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📅</Text>寄养历史
        </Text>
        {petOrders.length > 0 ? (
          <View className={styles.historyList}>
            {petOrders.slice(0, 5).map((order) => (
              <View key={order.id} className={styles.historyItem}>
                <View>
                  <Text className={styles.date}>
                    {formatDate(order.checkInDate)} - {formatDate(order.checkOutDate)}
                  </Text>
                  <Text className={styles.days}>{order.days}晚</Text>
                </View>
                <Text className={styles.amount}>{formatMoney(order.totalAmount)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: '24rpx', color: '#9c8c7e', textAlign: 'center', padding: '40rpx 0' }}>
            暂无寄养记录
          </Text>
        )}
      </View>
    </View>
  );
};

export default PetDetailPage;
