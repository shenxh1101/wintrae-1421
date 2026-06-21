import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  label: string;
  value: string | number;
  subText?: string;
  valueColor?: 'default' | 'primary' | 'success' | 'warning';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subText, valueColor = 'default' }) => {
  return (
    <View className={styles.statCard}>
      <Text className={styles.label}>{label}</Text>
      <Text className={classnames(styles.value, styles[valueColor])}>
        {value}
      </Text>
      {subText && <Text className={styles.subText}>{subText}</Text>}
    </View>
  );
};

export default StatCard;
