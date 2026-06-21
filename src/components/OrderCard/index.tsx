import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import type { Order } from '@/types';
import { formatDate, getPetTypeText, getOrderStatusText, formatMoney } from '@/utils';
import classnames from 'classnames';

interface OrderCardProps {
  order: Order;
  showActions?: boolean;
  onAccept?: (order: Order) => void;
  onReject?: (order: Order) => void;
  onClick?: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, showActions = false, onAccept, onReject, onClick }) => {
  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAccept?.(order);
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReject?.(order);
  };

  const handleClick = () => {
    onClick?.(order);
  };

  const canAccept = order.status === 'pending';
  const canReject = order.status === 'pending';

  return (
    <View className={styles.orderCard} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.petInfo}>
          <Image className={styles.avatar} src={order.petAvatar} mode="aspectFill" />
          <View className={styles.info}>
            <View className={styles.nameRow}>
              <Text className={styles.name}>{order.petName}</Text>
              <Tag text={getPetTypeText(order.petType)} type={order.petType} />
            </View>
            <Text className={styles.meta}>{order.ownerName} · {order.orderNo}</Text>
          </View>
        </View>
        <Text className={classnames(styles.status, styles[order.status])}>
          {getOrderStatusText(order.status)}
        </Text>
      </View>

      <View className={styles.content}>
        <View className={styles.dateRow}>
          <Text className={styles.date}>{formatDate(order.checkInDate)}</Text>
          <Text className={styles.arrow}>→</Text>
          <Text className={styles.date}>{formatDate(order.checkOutDate)}</Text>
          <Text className={styles.days}>{order.days}晚</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>每日价格</Text>
          <Text className={styles.value}>{formatMoney(order.price)}/天</Text>
        </View>
        {order.remark && (
          <View className={styles.row}>
            <Text className={styles.label}>备注</Text>
            <Text className={styles.value} style={{ maxWidth: '60%' }}>{order.remark}</Text>
          </View>
        )}
      </View>

      <View className={styles.footer}>
        <Text className={styles.price}>
          {formatMoney(order.totalAmount)}
          <Text className={styles.unit}> 合计</Text>
        </Text>
        {showActions && (
          <View className={styles.actions}>
            {canReject && (
              <Button className={classnames(styles.btn, styles.outline)} onClick={handleReject}>
                拒绝
              </Button>
            )}
            {canAccept && (
              <Button className={classnames(styles.btn, styles.primary)} onClick={handleAccept}>
                接单
              </Button>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default OrderCard;
