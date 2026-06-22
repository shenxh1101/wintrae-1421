import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import { getPetTypeText, getOrderStatusText, formatDate, formatMoney } from '@/utils';
import classnames from 'classnames';
import type { OrderStatus } from '@/types';
import dayjs from 'dayjs';

const statusConfig: Record<string, { title: string; desc: string }> = {
  pending: { title: '等待接单', desc: '请及时处理，超时订单将自动取消' },
  accepted: { title: '已接单', desc: '等待宠物入住，请做好准备' },
  ongoing: { title: '宠物入住中', desc: '请按时完成照护记录' },
  completed: { title: '订单已完成', desc: '感谢您的服务，期待下次合作' },
  cancelled: { title: '订单已取消', desc: '订单已取消，如有疑问请联系客服' }
};

const itemIcons: Record<string, string> = {
  '狗粮': '🥣', '猫粮': '🥣', '牵引绳': '🦮', '食盆': '🍽️', '水盆': '💧',
  '玩具': '🎾', '猫砂': '🧻', '猫砂盆': '🚽', '猫爬架': '🏰', '梳子': '🪮',
  '衣服': '👕', '自动喂食器': '🤖', '航空箱': '📦'
};

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { orders, pets, updateOrderStatus, updateOrder } = useAppContext();
  const [order, setOrder] = useState(orders.find((o) => o.id === router.params.id));
  const [pet, setPet] = useState(pets.find((p) => p.id === order?.petId));

  useEffect(() => {
    const orderId = router.params.id;
    console.log('[OrderDetail] 订单ID:', orderId);
    const foundOrder = orders.find((o) => o.id === orderId);
    setOrder(foundOrder);
    if (foundOrder) {
      setPet(pets.find((p) => p.id === foundOrder.petId));
    }
  }, [router.params.id, orders, pets]);

  const statusInfo = useMemo(() => {
    if (!order) return { title: '', desc: '' };
    return statusConfig[order.status] || { title: order.status, desc: '' };
  }, [order]);

  const handleAccept = () => {
    if (!order) return;
    Taro.showModal({
      title: '确认接单',
      content: `确定要接收${order.petName}的寄养订单吗？`,
      success: (res) => {
        if (res.confirm) {
          console.log('[OrderDetail] 接单:', order.orderNo);
          updateOrderStatus(order.id, 'accepted');
          setOrder((prev) => (prev ? { ...prev, status: 'accepted' as OrderStatus } : null));
          Taro.showToast({ title: '接单成功', icon: 'success' });
        }
      }
    });
  };

  const handleReject = () => {
    if (!order) return;
    Taro.showModal({
      title: '拒绝订单',
      content: `确定要拒绝${order.petName}的寄养订单吗？`,
      success: (res) => {
        if (res.confirm) {
          console.log('[OrderDetail] 拒绝订单:', order.orderNo);
          updateOrderStatus(order.id, 'cancelled');
          setOrder((prev) => (prev ? { ...prev, status: 'cancelled' as OrderStatus } : null));
          Taro.showToast({ title: '已拒绝', icon: 'none' });
          setTimeout(() => Taro.navigateBack(), 1000);
        }
      }
    });
  };

  const handleReschedule = () => {
    if (!order) return;
    const dates: string[] = [];
    for (let i = 0; i < 30; i++) {
      dates.push(dayjs().add(i, 'day').format('YYYY-MM-DD'));
    }
    Taro.showActionSheet({
      itemList: dates.slice(0, 10).map((d) => `改期至 ${d}`),
      success: (res) => {
        const newCheckIn = dates[res.tapIndex];
        const newCheckOut = dayjs(newCheckIn).add(order.days, 'day').format('YYYY-MM-DD');
        Taro.showModal({
          title: '确认改期',
          content: `将入住时间从 ${order.checkInDate} 改至 ${newCheckIn}，离店时间 ${newCheckOut}？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              console.log('[OrderDetail] 改期:', order.orderNo, newCheckIn);
              updateOrder(order.id, { checkInDate: newCheckIn, checkOutDate: newCheckOut });
              setOrder((prev) => (prev ? { ...prev, checkInDate: newCheckIn, checkOutDate: newCheckOut } : null));
              Taro.showToast({ title: '改期成功', icon: 'success' });
            }
          }
        });
      }
    });
  };

  const handleCancel = () => {
    if (!order) return;
    Taro.showModal({
      title: '取消订单',
      content: `确定要取消${order.petName}的寄养订单吗？`,
      success: (res) => {
        if (res.confirm) {
          console.log('[OrderDetail] 取消订单:', order.orderNo);
          updateOrderStatus(order.id, 'cancelled');
          setOrder((prev) => (prev ? { ...prev, status: 'cancelled' as OrderStatus } : null));
          Taro.showToast({ title: '已取消', icon: 'none' });
        }
      }
    });
  };

  const handleViewPet = () => {
    if (!pet) return;
    console.log('[OrderDetail] 查看宠物详情:', pet.id);
    Taro.navigateTo({ url: `/pages/pet-detail/index?id=${pet.id}` });
  };

  if (!order) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text className={styles.icon}>📋</Text>
          <Text className={styles.text}>订单不存在</Text>
        </View>
      </View>
    );
  }

  const showActions = order.status === 'pending' || order.status === 'accepted';

  return (
    <View className={styles.page}>
      <View className={styles.statusHeader}>
        <View className={styles.statusBadge}>{getOrderStatusText(order.status)}</View>
        <Text className={styles.statusTitle}>{statusInfo.title}</Text>
        <Text className={styles.statusDesc}>{statusInfo.desc}</Text>
        <View className={styles.price}>
          <Text className={styles.amount}>{formatMoney(order.totalAmount)}</Text>
          <Text className={styles.label}>订单总额</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🐾</Text>宠物资料
        </Text>
        <View className={styles.petInfo} onClick={handleViewPet}>
          <Image className={styles.avatar} src={order.petAvatar} mode="aspectFill" />
          <View className={styles.info}>
            <View className={styles.nameRow}>
              <Text className={styles.name}>{order.petName}</Text>
              <Text className={classnames(styles.tag, styles[order.petType])}>
                {getPetTypeText(order.petType)}
              </Text>
              {pet?.isRegular && <Text className={classnames(styles.tag, styles.regular)}>常客</Text>}
            </View>
            {pet && (
              <>
                <Text className={styles.meta}>{pet.breed} · {pet.age}岁 · {pet.weight}kg</Text>
                <Text className={styles.meta}>主人：{order.ownerName} · {order.ownerPhone}</Text>
              </>
            )}
          </View>
          <Text style={{ color: '#9c8c7e', fontSize: '32rpx' }}>›</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📅</Text>入住时间
        </Text>
        <View className={styles.dateCard}>
          <View className={styles.dateItem}>
            <Text className={styles.dateLabel}>入住</Text>
            <Text className={styles.dateValue}>{order.checkInDate.slice(5)}</Text>
          </View>
          <Text className={styles.arrow}>→</Text>
          <View className={styles.dateItem}>
            <Text className={styles.dateLabel}>离店</Text>
            <Text className={styles.dateValue}>{order.checkOutDate.slice(5)}</Text>
          </View>
          <View className={styles.days}>
            <Text className={styles.num}>{order.days}</Text>
            <Text className={styles.text}>晚</Text>
          </View>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>每日价格</Text>
          <Text className={styles.value}>{formatMoney(order.price)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>定金</Text>
          <Text className={styles.value}>{formatMoney(order.deposit)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>订单编号</Text>
          <Text className={styles.value}>{order.orderNo}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>下单时间</Text>
          <Text className={styles.value}>{order.createTime}</Text>
        </View>
        {order.remark && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>备注</Text>
            <Text className={styles.value}>{order.remark}</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📦</Text>交接物品
        </Text>
        {order.handoverItems && order.handoverItems.length > 0 ? (
          <View className={styles.itemList}>
            {order.handoverItems.map((item, idx) => (
              <View key={idx} className={styles.item}>
                <Text className={styles.icon}>{itemIcons[item] || '📦'}</Text>
                {item}
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: '24rpx', color: '#9c8c7e' }}>暂无交接物品</Text>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>📜</Text>改期与取消规则
        </Text>
        <View className={styles.ruleBox} style={{ marginBottom: '$spacing-md' }}>
          <Text className={styles.ruleTitle}>改期规则</Text>
          <Text className={styles.ruleContent}>
            {order.rescheduleRule || '可免费改期一次，需提前24小时告知'}
          </Text>
        </View>
        <View className={styles.ruleBox}>
          <Text className={styles.ruleTitle}>取消规则</Text>
          <Text className={styles.ruleContent}>
            {order.cancelRule || '入住前24小时取消全额退款，24小时内取消不退定金'}
          </Text>
        </View>
      </View>

      {showActions && (
        <View className={styles.footer}>
          {order.status === 'pending' ? (
            <>
              <Button className={classnames(styles.btn, styles.outline)} onClick={handleReject}>
                拒绝订单
              </Button>
              <Button className={classnames(styles.btn, styles.primary)} onClick={handleAccept}>
                确认接单
              </Button>
            </>
          ) : order.status === 'accepted' ? (
            <>
              <Button className={classnames(styles.btn, styles.outline)} onClick={handleCancel}>
                取消订单
              </Button>
              <Button className={classnames(styles.btn, styles.primary)} onClick={handleReschedule}>
                发起改期
              </Button>
            </>
          ) : null}
        </View>
      )}
    </View>
  );
};

export default OrderDetailPage;
