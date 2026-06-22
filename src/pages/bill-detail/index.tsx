import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import { formatDate, formatMoney } from '@/utils';
import classnames from 'classnames';

const BillDetailPage: React.FC = () => {
  const router = useRouter();
  const { incomeRecords, orders } = useAppContext();
  const [record, setRecord] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);

  useDidShow(() => {
    const recordId = router.params.id;
    console.log('[BillDetail] 账单ID:', recordId);
    const found = incomeRecords.find((r) => r.id === recordId);
    setRecord(found);
    if (found && found.type === 'income') {
      setOrder(orders.find((o) => o.id === found.orderId));
    }
  });

  const handleViewOrder = () => {
    if (record?.orderId && record.type === 'income') {
      Taro.navigateTo({ url: `/pages/order-detail/index?id=${record.orderId}` });
    }
  };

  if (!record) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text className={styles.emptyIcon}>💰</Text>
          <Text className={styles.emptyTitle}>暂无账单信息</Text>
          <Text className={styles.emptyDesc}>返回列表选择一条账单</Text>
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

  const incomeTimeline = useMemo(() => {
    if (isWithdraw) return [];
    const items = [
      {
        title: '订单创建',
        time: order?.createTime || record.createTime,
        status: 'done',
        desc: order?.orderNo || '宠物主人提交寄养订单'
      },
      {
        title: '确认接单',
        time: order?.acceptTime || '接单时间',
        status: 'done',
        desc: '您已确认接受该寄养订单'
      },
      {
        title: '宠物入住',
        time: order?.checkInDate || '入住时间',
        status: 'done',
        desc: `${order?.petName || '宠物'}已顺利入住`
      }
    ];
    if (!isPending) {
      items.push({
        title: '寄养完成',
        time: order?.checkOutDate || '完成时间',
        status: 'done',
        desc: '寄养周期已完成'
      });
      items.push({
        title: '款项到账',
        time: record.createTime,
        status: 'done',
        desc: `寄养款项 +¥${record.amount.toFixed(2)} 已到账`
      });
    } else {
      items.push({
        title: '寄养进行中',
        time: '进行中',
        status: 'current',
        desc: `预计 ${order?.checkOutDate || ''} 24:00前到账`
      });
    }
    return items;
  }, [order, record, isPending, isWithdraw]);

  const withdrawTimeline = useMemo(() => {
    if (!isWithdraw) return [];
    const createTime = new Date(record.createTime);
    const processTime = new Date(createTime.getTime() + 10 * 60 * 1000);
    const expectedArrival = new Date(createTime.getTime() + 24 * 60 * 60 * 1000);

    const fmt = (d: Date) => formatDate(d) + ' ' + d.toTimeString().slice(0, 5);
    const items = [
      {
        title: '申请提现',
        time: record.createTime,
        status: 'done',
        desc: `发起提现 -¥${record.amount.toFixed(2)}`
      },
      {
        title: '系统处理',
        time: fmt(processTime),
        status: isPending ? 'current' : 'done',
        desc: '平台审核中'
      }
    ];
    if (!isPending) {
      items.push({
        title: '到账成功',
        time: record.arrivalTime || fmt(expectedArrival),
        status: 'done',
        desc: `款项已到账至${record.withdrawMethod === 'wechat' ? '微信钱包' : '支付宝'}`
      });
    } else {
      items.push({
        title: '等待到账',
        time: fmt(expectedArrival) + ' 前',
        status: 'wait',
        desc: '预计24小时内到账'
      });
    }
    return items;
  }, [record, isWithdraw, isPending]);

  const timeline = isWithdraw ? withdrawTimeline : incomeTimeline;

  const platformFee = useMemo(() => {
    if (!order) return 0;
    return Number((order.totalAmount - order.deposit - order.price * order.days).toFixed(2));
  }, [order]);

  return (
    <View className={styles.page}>
      <View className={classnames(styles.amountHeader, { [styles.withdrawHeader]: isWithdraw })}>
        <Text className={styles.label}>{getAmountLabel()}</Text>
        <View className={styles.amount}>
          <Text className={styles.unit}>{isWithdraw ? '-' : '+'}¥</Text>
          {record.amount.toFixed(2)}
        </View>
        <Text
          className={classnames(styles.statusTag, {
            [styles.pendingTag]: isPending,
            [styles.completedTag]: !isPending,
            [styles.withdrawPendingTag]: isWithdraw && isPending
          })}
        >
          {getStatusText()}
        </Text>
      </View>

      {!isWithdraw && order && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>📋</Text>
            <Text className={styles.sectionTitle}>宠物订单</Text>
            <Text className={styles.sectionAction} onClick={handleViewOrder}>
              查看详情 →
            </Text>
          </View>
          <View className={styles.petCard} onClick={handleViewOrder}>
            <Image className={styles.petAvatar} src={order.petAvatar} mode="aspectFill" />
            <View className={styles.petInfo}>
              <View className={styles.petRow}>
                <Text className={styles.petName}>{order.petName}</Text>
                <View className={styles.petBadge}>{order.petType}</View>
                <View className={styles.petBadge}>{order.days}晚</View>
              </View>
              <Text className={styles.petDates}>
                {formatDate(order.checkInDate)} → {formatDate(order.checkOutDate)}
              </Text>
            </View>
            <Text className={styles.petAmount}>{formatMoney(order.totalAmount)}</Text>
          </View>
        </View>
      )}

      {isWithdraw && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>💸</Text>
            <Text className={styles.sectionTitle}>提现信息</Text>
          </View>
          <View className={styles.accountCard}>
            <View
              className={classnames(styles.accountIcon, {
                [styles.wechatIcon]: record.withdrawMethod === 'wechat',
                [styles.alipayIcon]: record.withdrawMethod === 'alipay'
              })}
            >
              {record.withdrawMethod === 'wechat' ? '💬' : '💰'}
            </View>
            <View className={styles.accountInfo}>
              <Text className={styles.accountName}>
                {record.withdrawMethod === 'wechat' ? '微信钱包' : '支付宝'}
              </Text>
              <Text className={styles.accountNo}>{record.withdrawAccount || '默认账户'}</Text>
            </View>
          </View>
          <View className={styles.infoGrid}>
            <View className={styles.infoCell}>
              <Text className={styles.infoLabel}>提现单号</Text>
              <Text className={styles.infoValue}>{record.id}</Text>
            </View>
            <View className={styles.infoCell}>
              <Text className={styles.infoLabel}>提现方式</Text>
              <Text className={styles.infoValue}>
                {record.withdrawMethod === 'wechat' ? '微信' : '支付宝'}
              </Text>
            </View>
            <View className={styles.infoCell}>
              <Text className={styles.infoLabel}>手续费</Text>
              <Text className={styles.infoValue}>免手续费</Text>
            </View>
            <View className={styles.infoCell}>
              <Text className={styles.infoLabel}>到账规则</Text>
              <Text className={styles.infoValue}>T+1到账</Text>
            </View>
          </View>
        </View>
      )}

      {!isWithdraw && order && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>🧮</Text>
            <Text className={styles.sectionTitle}>费用拆分</Text>
          </View>
          <View className={styles.feeBreakdown}>
            <View className={styles.feeRow}>
              <Text className={styles.feeLabel}>基础寄养费</Text>
              <Text className={styles.feeValue}>
                {formatMoney(order.price)} × {order.days}晚 = {formatMoney(order.price * order.days)}
              </Text>
            </View>
            <View className={styles.feeRow}>
              <Text className={styles.feeLabel}>附加服务</Text>
              <Text className={styles.feeValue}>{formatMoney(order.extraFee || 0)}</Text>
            </View>
            <View className={styles.feeRow}>
              <Text className={styles.feeLabel}>定金抵扣</Text>
              <Text className={classnames(styles.feeValue, styles.negative)}>
                -{formatMoney(order.deposit)}
              </Text>
            </View>
            <View className={styles.feeRow}>
              <Text className={styles.feeLabel}>优惠券</Text>
              <Text className={classnames(styles.feeValue, styles.negative)}>
                -{formatMoney(order.coupon || 0)}
              </Text>
            </View>
            <View className={styles.feeRow}>
              <Text className={styles.feeLabel}>平台服务费</Text>
              <Text className={styles.feeValue}>{formatMoney(platformFee)}</Text>
            </View>
            <View className={styles.feeDivider} />
            <View className={classnames(styles.feeRow, styles.feeTotal)}>
              <Text className={styles.feeLabel}>实际收款</Text>
              <Text className={styles.feeTotalValue}>{formatMoney(record.amount)}</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>⏳</Text>
          <Text className={styles.sectionTitle}>
            {isWithdraw ? '到账进度' : '收款进度'}
          </Text>
        </View>
        <View className={styles.timeline}>
          {timeline.map((item, idx) => (
            <View key={idx} className={styles.timelineItem}>
              <View className={styles.timelineLeft}>
                <View
                  className={classnames(styles.timelineDot, {
                    [styles.dotDone]: item.status === 'done',
                    [styles.dotCurrent]: item.status === 'current',
                    [styles.dotWait]: item.status === 'wait',
                    [styles.dotWithdraw]: isWithdraw && item.status !== 'wait'
                  })}
                />
                {idx < timeline.length - 1 && (
                  <View
                    className={classnames(styles.timelineLine, {
                      [styles.lineDone]: item.status === 'done',
                      [styles.lineWait]: item.status === 'wait' || item.status === 'current',
                      [styles.lineWithdraw]: isWithdraw && item.status === 'done'
                    })}
                  />
                )}
              </View>
              <View className={styles.timelineContent}>
                <View className={styles.timelineHeader}>
                  <Text
                    className={classnames(styles.timelineTitle, {
                      [styles.titleCurrent]: item.status === 'current'
                    })}
                  >
                    {item.title}
                  </Text>
                  <Text className={styles.timelineTime}>{item.time}</Text>
                </View>
                <Text className={styles.timelineDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {!isWithdraw && order && (
        <Button className={styles.actionBtn} onClick={handleViewOrder}>
          查看订单详情
        </Button>
      )}

      {isWithdraw && (
        <Button
          className={classnames(styles.actionBtn, styles.outlineBtn)}
          onClick={() => Taro.showToast({ title: '如有问题请联系客服', icon: 'none' })}
        >
          联系客服咨询
        </Button>
      )}
    </View>
  );
};

export default BillDetailPage;
