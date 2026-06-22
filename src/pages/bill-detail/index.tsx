import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import { formatDate, formatMoney } from '@/utils';

const BillDetailPage: React.FC = () => {
  const router = useRouter();
  const { incomeRecords, orders } = useAppContext();
  const [record, setRecord] = useState(incomeRecords.find((r) => r.id === router.params.id));
  const [order, setOrder] = useState(orders.find((o) => o.id === record?.orderId));

  useEffect(() => {
    const recordId = router.params.id;
    console.log('[BillDetail] 账单ID:', recordId);
    const found = incomeRecords.find((r) => r.id === recordId);
    setRecord(found);
    if (found) {
      setOrder(orders.find((o) => o.id === found.orderId));
    }
  }, [router.params.id, incomeRecords, orders]);

  const handleViewOrder = () => {
    if (record?.orderId) {
      Taro.navigateTo({ url: `/pages/order-detail/index?id=${record.orderId}` });
    }
  };

  if (!record || !order) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text className={styles.icon}>💰</Text>
          <Text className={styles.text}>账单不存在</Text>
        </View>
      </View>
    );
  }

  const isPending = record.status === 'pending';

  return (
    <View className={styles.page}>
      <View className={styles.amountHeader}>
        <Text className={styles.label}>
          {isPending ? '待收款金额' : '已收款金额'}
        </Text>
        <View className={styles.amount}>
          <Text className={styles.unit}>¥</Text>
          {record.amount.toFixed(2)}
        </View>
        <Text className={styles.status}>
          {isPending ? '待结算' : '已到账'}
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📋</Text>关联订单
        </Text>
        <View className={styles.petInfo} onClick={handleViewOrder}>
          <Image className={styles.avatar} src={order.petAvatar} mode="aspectFill" />
          <View className={styles.info}>
            <Text className={styles.name}>
              {order.petName} · 寄养{order.days}晚
            </Text>
            <Text className={styles.dates}>
              {order.orderNo} · {formatDate(order.checkInDate)} - {formatDate(order.checkOutDate)}
            </Text>
          </View>
          <Text className={styles.amount}>{formatMoney(order.totalAmount)}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📊</Text>费用明细
        </Text>
        <View className={styles.breakdown}>
          <View className={styles.row}>
            <Text className={styles.label}>寄养费用</Text>
            <Text className={styles.value}>{formatMoney(order.price)} × {order.days}晚</Text>
          </View>
          <View className={styles.row}>
            <Text className={styles.label}>定金</Text>
            <Text className={styles.value}>{formatMoney(order.deposit)}</Text>
          </View>
          <View className={styles.row}>
            <Text className={styles.label}>服务费</Text>
            <Text className={styles.value}>¥0.00</Text>
          </View>
          <View className={styles.row}>
            <Text className={styles.label}>优惠</Text>
            <Text className={styles.value}>¥0.00</Text>
          </View>
          <View className={classnames(styles.row, styles.total)}>
            <Text className={styles.label}>合计</Text>
            <Text className={styles.value}>{formatMoney(order.totalAmount)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>ℹ️</Text>交易信息
        </Text>
        <View className={styles.infoRow}>
          <Text className={styles.label}>交易单号</Text>
          <Text className={styles.value}>{record.id}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>订单编号</Text>
          <Text className={styles.value}>{order.orderNo}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>交易时间</Text>
          <Text className={styles.value}>{record.createTime}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>交易状态</Text>
          <Text
            className={styles.value}
            style={{ color: isPending ? '#ff9800' : '#4caf50' }}
          >
            {isPending ? '待结算（入住完成后到账）' : '已到账'}
          </Text>
        </View>
        {isPending && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>预计到账</Text>
            <Text className={styles.value}>
              {formatDate(order.checkOutDate)} 24:00 前
            </Text>
          </View>
        )}
      </View>

      <Button
        className={classnames(styles.actionBtn, { [styles.outline]: !isPending })}
        onClick={handleViewOrder}
      >
        查看订单详情
      </Button>
    </View>
  );
};

export default BillDetailPage;
