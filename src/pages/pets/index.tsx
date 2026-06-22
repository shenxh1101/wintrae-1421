import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import PetCard from '@/components/PetCard';
import { useAppContext } from '@/store';
import type { Pet } from '@/types';
import classnames from 'classnames';

const categoryOptions = [
  { key: 'all', label: '全部' },
  { key: 'dog', label: '狗狗' },
  { key: 'cat', label: '猫咪' }
];

const PetsPage: React.FC = () => {
  const { pets } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 200);
  }, []);

  const filteredPets = pets.filter((pet) => {
    if (activeCategory !== 'all' && pet.type !== activeCategory) return false;
    if (searchText && !pet.name.includes(searchText) && !pet.ownerName.includes(searchText)) return false;
    return true;
  });

  const regularPets = filteredPets.filter((pet) => pet.isRegular);
  const otherPets = filteredPets.filter((pet) => !pet.isRegular);

  const handlePetClick = (pet: Pet) => {
    console.log('[Pets] 查看宠物详情:', pet.name);
    Taro.navigateTo({ url: `/pages/pet-detail/index?id=${pet.id}` });
  };

  const handleSearch = (e: any) => {
    setSearchText(e.detail.value);
  };

  const handleAddPet = () => {
    console.log('[Pets] 新增宠物档案');
    Taro.navigateTo({ url: '/pages/pet-add/index' });
  };

  const dogCount = pets.filter((p) => p.type === 'dog').length;
  const catCount = pets.filter((p) => p.type === 'cat').length;

  return (
    <View className={styles.page}>
      <View className={styles.searchBar}>
        <View className={styles.searchInput}>
          <Text className={styles.icon}>🔍</Text>
          <Input
            className={styles.placeholder}
            placeholder="搜索宠物名称或主人"
            value={searchText}
            onInput={handleSearch}
          />
        </View>
        <Button className={styles.addBtn} onClick={handleAddPet}>
          + 新增
        </Button>
      </View>

      <View className={styles.categoryTabs}>
        {categoryOptions.map((tab) => (
          <Button
            key={tab.key}
            className={classnames(styles.tabItem, { [styles.active]: activeCategory === tab.key })}
            onClick={() => setActiveCategory(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </View>

      <View className={styles.statsBar}>
        <View className={styles.statItem}>
          <Text className={styles.value}>{pets.length}</Text>
          <Text className={styles.label}>宠物总数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.value}>{dogCount}</Text>
          <Text className={styles.label}>狗狗</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.value}>{catCount}</Text>
          <Text className={styles.label}>猫咪</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.value}>{regularPets.length}</Text>
          <Text className={styles.label}>常客</Text>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 420rpx)' }}>
        {!loading && filteredPets.length > 0 ? (
          <>
            {regularPets.length > 0 && (
              <>
                <View className={styles.sectionTitle}>
                  <Text>常客宝贝</Text>
                  <Text className={styles.count}>{regularPets.length}只</Text>
                </View>
                <View className={styles.petList}>
                  {regularPets.map((pet) => (
                    <PetCard key={pet.id} pet={pet} onClick={handlePetClick} />
                  ))}
                </View>
              </>
            )}
            {otherPets.length > 0 && (
              <>
                <View className={styles.sectionTitle}>
                  <Text>其他宝贝</Text>
                  <Text className={styles.count}>{otherPets.length}只</Text>
                </View>
                <View className={styles.petList}>
                  {otherPets.map((pet) => (
                    <PetCard key={pet.id} pet={pet} onClick={handlePetClick} />
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <View className={styles.empty}>
            <Text className={styles.icon}>🐾</Text>
            <Text className={styles.text}>
              {loading ? '加载中...' : '暂无宠物档案'}
            </Text>
            {!loading && (
              <Button className={styles.emptyAddBtn} onClick={handleAddPet}>
                + 新增第一个宠物
              </Button>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PetsPage;
