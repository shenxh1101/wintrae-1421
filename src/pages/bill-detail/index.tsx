import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import { formatDate, formatMoney } from '@/utils';
import classnames from 'classnames';

const BillDetailPage: React.FC = () => {
  const router = useRouter();
  const { incomeRecords, orders } = useAppContext();
  const [record, setRecord] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const recordId = router.params.id;
    console.log('[BillDetail] 账单ID:', recordId);
    const found = incomeRecords.find((r) => r.id === recordId);
    setRecord(found);
    if (found && found.type === 'income') {
      setOrder(orders.find((o) => o.id === found.orderId));
    }
  }, [router.params.id, incomeRecords, orders]);

  const handleViewOrder = () => {
    if (record?.orderId && record.type === 'income') {
      Taro.navigateTo({ url: `/pages/order-detail/index?id=${record.orderId}` });
    }
  };

  if (!record) {
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
  const isWithdraw = record.type === 'withdraw';

  const getStatusText = () => {
    if (isWithdraw) {
      return isPending ? '处理中' : '已到账';
    }
    return isPending ? '待结算' : '已到账';
  };

  const getAmountLabel = () => {
    if (isWithdraw) {
      return isPending ? '提现金额' : '已提现金额';
    }
    return isPending ? '待收款金额' : '已收款金额';
  };

  return (
    <View className={styles.page}>
      <View className={classnames(styles.amountHeader, { [styles.withdrawHeader]: isWithdraw })}>
        <Text className={styles.label}>
          {getAmountLabel()}
        </Text>
        <View className={styles.amount}>
          <Text className={styles.unit}>{isWithdraw ? '-' : '+'}¥</Text>
          {record.amount.toFixed(2)}
        </View>
        <Text className={styles.status}>
          {getStatusText()}
        </Text>
      </View>

      {!isWithdraw && order && (
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
      )}

      {isWithdraw && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>💸</Text>提现信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.label}>提现方式</Text>
            <Text className={styles.value}>
              {record.withdrawMethod === 'wechat' ? '💬 微信钱包' : '💰 支付宝'}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>收款账户</Text>
            <Text className={styles.value}>
              {record.withdrawAccount || '默认账户'}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>提现说明</Text>
            <Text className={styles.value}>T+1到账，免手续费</Text>
          </View>
        </View>
      )}

      {!isWithdraw && order && (
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
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>ℹ️</Text>交易信息
        </Text>
        <View className={styles.infoRow}>
          <Text className={styles.label}>交易单号</Text>
          <Text className={styles.value}>{record.id}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>交易类型</Text>
          <Text className={styles.value}>
            {isWithdraw ? '提现' : '寄养收款'}
          </Text>
        </View>
        {!isWithdraw && order && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>订单编号</Text>
            <Text className={styles.value}>{order.orderNo}</Text>
          </View>
        )}
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
            {getStatusText()}
            {isPending && !isWithdraw && '（入住完成后到账'}
          </Text>
        </View>
        {isPending && !isWithdraw && order && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>预计到账</Text>
            <Text className={styles.value}>
              {formatDate(order.checkOutDate)} 24:00 前
            </Text>
          </View>
        )}
        {isPending && isWithdraw && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>预计到账</Text>
            <Text className={styles.value}>
              {formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000))} 24:00 前
            </Text>
          </View>
        )}
      </View>

      {!isWithdraw && order && (
        <Button
          className={classnames(styles.actionBtn, { [styles.outline]: !isPending })}
          onClick={handleViewOrder}
        >
          查看订单详情
        </Button>
      )}

      {isWithdraw && (
        <Button
          className={classnames(styles.actionBtn, styles.outline)}
          onClick={() => Taro.showToast({ title: '如有问题请联系客服', icon: 'none' })}
        >
          联系客服
        </Button>
      )}
    </View>
  );
};

export default BillDetailPage;
