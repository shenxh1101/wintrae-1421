import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import { useAppContext } from '@/store';
import type { Order, OrderStatus } from '@/types';
import classnames from 'classnames';

const filterOptions = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待接单' },
  { key: 'accepted', label: '已接单' },
  { key: 'ongoing', label: '入住中' },
  { key: 'completed', label: '已完成' }
];

const HallPage: React.FC = () => {
  const { orders, sitterSetting, updateOrderStatus, setOrders } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  useEffect(() => {
    loadData();
  }, []);

  useDidShow(() => {
    console.log('[Hall] 页面显示，刷新数据');
  });

  const onRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 300);
  }, [setLoading]);

  useEffect(() => {
    Taro.onPullDownRefresh(() => {
      onRefresh();
    });
  }, [onRefresh]);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const handleAccept = (order: Order) => {
    Taro.showModal({
      title: '确认接单',
      content: `确定要接收${order.petName}的寄养订单吗？`,
      success: (res) => {
        if (res.confirm) {
          updateOrderStatus(order.id, 'accepted');
          Taro.showToast({ title: '接单成功', icon: 'success' });
          console.log('[Hall] 接单成功:', order.orderNo);
        }
      }
    });
  };

  const handleReject = (order: Order) => {
    Taro.showModal({
      title: '拒绝订单',
      content: `确定要拒绝${order.petName}的寄养订单吗？`,
      success: (res) => {
        if (res.confirm) {
          setOrders((prev) => prev.filter((o) => o.id !== order.id));
          Taro.showToast({ title: '已拒绝', icon: 'none' });
          console.log('[Hall] 拒绝订单:', order.orderNo);
        }
      }
    });
  };

  const handleOrderClick = (order: Order) => {
    console.log('[Hall] 查看订单详情:', order.orderNo);
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` });
  };

  const handleSetting = () => {
    console.log('[Hall] 进入服务设置');
    Taro.navigateTo({ url: '/pages/sitter-setting/index' });
  };

  const stats = {
    checkIn: orders.filter((o) => o.status === 'ongoing').length,
    checkOut: 2,
    pending: orders.filter((o) => o.status === 'pending').length,
    monthIncome: '2,340',
    capacity: `${sitterSetting.currentOccupancy}/${sitterSetting.dailyCapacity}`,
    dogPrice: sitterSetting.dogPrice,
    catPrice: sitterSetting.catPrice
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.greeting}>
          <View className={styles.text}>
            <Text className={styles.hello}>早上好，寄养管家</Text>
            <Text className={styles.title}>
              今天有 {stats.pending} 个新订单
            </Text>
            <View className={styles.priceRow}>
              <Text className={styles.priceItem}>
                🐕 狗狗 ¥{stats.dogPrice}/天
              </Text>
              <Text className={styles.priceItem}>
                🐱 猫咪 ¥{stats.catPrice}/天
              </Text>
              <Text className={styles.priceItem}>
                🏠 容量 {stats.capacity}
              </Text>
            </View>
          </View>
          <Button className={styles.settingBtn} onClick={handleSetting}>
            ⚙
          </Button>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.value}>{stats.checkIn}</Text>
          <Text className={styles.label}>今日入住</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.value}>{stats.checkOut}</Text>
          <Text className={styles.label}>今日离店</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.value} style={{ color: '#ff7a45' }}>{stats.pending}</Text>
          <Text className={styles.label}>待接单</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.value} style={{ color: '#4caf50' }}>¥{stats.monthIncome}</Text>
          <Text className={styles.label}>本月收入</Text>
        </View>
      </View>

      <ScrollView className={styles.filterTabs} scrollX>
        {filterOptions.map((tab) => (
          <Button
            key={tab.key}
            className={classnames(styles.tabItem, { [styles.active]: activeFilter === tab.key })}
            onClick={() => setActiveFilter(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </ScrollView>

      <View className={styles.orderList}>
        {!loading && filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              showActions={order.status === 'pending'}
              onAccept={handleAccept}
              onReject={handleReject}
              onClick={handleOrderClick}
            />
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.icon}>📋</Text>
            <Text className={styles.text}>{loading ? '加载中...' : '暂无订单'}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default HallPage;
