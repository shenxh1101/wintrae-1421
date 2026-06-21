import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import type { Pet } from '@/types';
import { getPetTypeText } from '@/utils';

interface PetCardProps {
  pet: Pet;
  onClick?: (pet: Pet) => void;
  showArrow?: boolean;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onClick, showArrow = true }) => {
  const handleClick = () => {
    onClick?.(pet);
  };

  const genderText = pet.gender === 'male' ? '♂' : '♀';
  const genderColor = pet.gender === 'male' ? '#2196f3' : '#e91e63';

  return (
    <View className={styles.petCard} onClick={handleClick}>
      <Image className={styles.avatar} src={pet.avatar} mode="aspectFill" />
      <View className={styles.info}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{pet.name}</Text>
          <Tag text={getPetTypeText(pet.type)} type={pet.type} />
          {pet.isRegular && <Tag text="常客" type="success" />}
        </View>
        <View className={styles.meta}>
          <Text className={styles.item}>
            <Text style={{ color: genderColor }}>{genderText}</Text>
            {pet.breed}
          </Text>
          <Text className={styles.item}>{pet.age}岁</Text>
          <Text className={styles.item}>{pet.weight}kg</Text>
        </View>
        <View className={styles.tags}>
          {pet.personalityTags.slice(0, 3).map((tag, idx) => (
            <Tag key={idx} text={tag} type="outline" />
          ))}
        </View>
        <Text className={styles.owner}>主人：{pet.ownerName} · {pet.ownerPhone}</Text>
      </View>
      {showArrow && <Text className={styles.arrow}>›</Text>}
    </View>
  );
};

export default PetCard;
