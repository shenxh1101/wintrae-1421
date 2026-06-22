import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import type { IncomeRecord, Review } from '@/types';
import classnames from 'classnames';

const tabOptions = [
  { key: 'income', label: '收支明细' },
  { key: 'reviews', label: '评价管理' }
];

const featureList = [
  { icon: '💰', label: '提现', key: 'withdraw' },
  { icon: '📊', label: '账单', key: 'bill' },
  { icon: '⭐', label: '常客', key: 'regular' },
  { icon: '⚙️', label: '设置', key: 'setting' }
];

const WalletPage: React.FC = () => {
  const { wallet, incomeRecords, reviews, monthlyIncome } = useAppContext();
  const [activeTab, setActiveTab] = useState('income');

  useDidShow(() => {
    console.log('[Wallet] 页面显示，刷新数据');
  });

  const stats = useMemo(() => {
    const incomePending = incomeRecords
      .filter((r) => r.type === 'income' && r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);
    const withdrawProcessing = incomeRecords
      .filter((r) => r.type === 'withdraw' && r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);
    return { incomePending, withdrawProcessing };
  }, [incomeRecords]);

  const maxIncome = Math.max(...monthlyIncome.map((item) => item.income));

  const handleWithdraw = () => {
    console.log('[Wallet] 提现');
    Taro.navigateTo({ url: '/pages/withdraw/index' });
  };

  const handleFeatureClick = (key: string) => {
    console.log('[Wallet] 点击功能:', key);
    switch (key) {
      case 'regular':
        Taro.navigateTo({ url: '/pages/regular-pets/index' });
        break;
      case 'bill':
        Taro.navigateTo({ url: '/pages/bill-list/index' });
        break;
      case 'withdraw':
        handleWithdraw();
        break;
      case 'setting':
        Taro.navigateTo({ url: '/pages/wallet-setting/index' });
        break;
      default:
        Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  const handleReplyReview = (review: Review) => {
    console.log('[Wallet] 回复评价:', review.id);
    Taro.navigateTo({ url: `/pages/review-reply/index?id=${review.id}` });
  };

  const handleIncomeClick = (record: IncomeRecord) => {
    console.log('[Wallet] 查看账单详情:', record.id);
    Taro.navigateTo({ url: `/pages/bill-detail/index?id=${record.id}` });
  };

  const handlePendingClick = () => {
    console.log('[Wallet] 查看寄养待收款');
    const pending = incomeRecords.find((r) => r.type === 'income' && r.status === 'pending');
    if (pending) {
      Taro.navigateTo({ url: `/pages/bill-detail/index?id=${pending.id}` });
    } else {
      Taro.showToast({ title: '暂无寄养待收款', icon: 'none' });
    }
  };

  const handleWithdrawPendingClick = () => {
    console.log('[Wallet] 查看提现处理中');
    const pending = incomeRecords.find((r) => r.type === 'withdraw' && r.status === 'pending');
    if (pending) {
      Taro.navigateTo({ url: `/pages/bill-detail/index?id=${pending.id}` });
    } else {
      Taro.showToast({ title: '暂无提现处理中', icon: 'none' });
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRecordIcon = (record: IncomeRecord) => {
    if (record.type === 'withdraw') return '💸';
    return '🐾';
  };

  const getRecordTitle = (record: IncomeRecord) => {
    if (record.type === 'withdraw') {
      const method = record.withdrawMethod === 'alipay' ? '支付宝' : '微信钱包';
      return `提现到${method}`;
    }
    return `${record.petName}寄养费`;
  };

  const getStatusText = (record: IncomeRecord) => {
    if (record.type === 'withdraw') {
      return record.status === 'completed' ? '已到账' : '处理中';
    }
    return record.status === 'completed' ? '已到账' : '待结算';
  };

  const getAmountPrefix = (record: IncomeRecord) => {
    return record.type === 'income' ? '+' : '-';
  };

  const sortedRecords = useMemo(() => {
    return [...incomeRecords].sort(
      (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
  }, [incomeRecords]);

  return (
    <View className={styles.page}>
      <View className={styles.walletHeader}>
        <Text className={styles.title}>我的钱包</Text>
        <View className={styles.balance}>
          <Text className={styles.label}>账户余额（元）</Text>
          <View className={styles.amount}>
            <Text className={styles.unit}>¥</Text>
            {wallet.balance.toFixed(2)}
          </View>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem} onClick={handlePendingClick}>
            <Text className={styles.label}>寄养待收款</Text>
            <Text className={styles.value}>¥{stats.incomePending.toFixed(2)}</Text>
          </View>
          <View className={styles.statItem} onClick={handleWithdrawPendingClick}>
            <Text className={styles.label}>提现处理中</Text>
            <Text className={styles.value}>¥{stats.withdrawProcessing.toFixed(2)}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>本月收入</Text>
            <Text className={styles.value}>¥{wallet.monthIncome.toFixed(2)}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>累计收入</Text>
            <Text className={styles.value}>¥{wallet.totalIncome.toFixed(0)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.actionRow}>
        <View className={styles.actionCard} onClick={handleWithdraw}>
          <Text className={styles.icon}>💳</Text>
          <Text className={styles.title}>立即提现</Text>
          <Text className={styles.subText}>T+1到账</Text>
        </View>
        <View className={styles.actionCard} onClick={() => handleFeatureClick('bill')}>
          <Text className={styles.icon}>📋</Text>
          <Text className={styles.title}>查看账单</Text>
          <Text className={styles.subText}>全部收支明细</Text>
        </View>
      </View>

      <View className={styles.chartCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.title}>收入趋势</Text>
          <Text className={styles.subText}>近6个月</Text>
        </View>
        <View className={styles.chartContainer}>
          {monthlyIncome.map((item, idx) => {
            const height = (item.income / maxIncome) * 180 + 8;
            const isActive = idx === monthlyIncome.length - 1;
            return (
              <View key={idx} className={styles.barItem}>
                <Text className={styles.amount}>¥{item.income}</Text>
                <View
                  className={classnames(styles.bar, { [styles.active]: isActive })}
                  style={{ height: `${height}rpx` }}
                />
                <Text className={styles.month}>{item.month}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.featureGrid}>
        {featureList.map((item) => (
          <View
            key={item.key}
            className={styles.featureItem}
            onClick={() => handleFeatureClick(item.key)}
          >
            <View className={styles.icon}>{item.icon}</View>
            <Text className={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.tabSection}>
        <View className={styles.tabHeader}>
          {tabOptions.map((tab) => (
            <Button
              key={tab.key}
              className={classnames(styles.tabItem, {
                [styles.active]: activeTab === tab.key
              })}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </View>

        <ScrollView scrollY style={{ height: '480rpx' }}>
          {activeTab === 'income' ? (
            <View className={styles.incomeList}>
              {sortedRecords.length > 0 ? (
                sortedRecords.map((record) => (
                  <View
                    key={record.id}
                    className={styles.incomeItem}
                    onClick={() => handleIncomeClick(record)}
                  >
                    <View
                      className={classnames(styles.itemIcon, {
                        [styles.incomeIcon]: record.type === 'income',
                        [styles.withdrawIcon]: record.type === 'withdraw'
                      })}
                    >
                      {getRecordIcon(record)}
                    </View>
                    <View className={styles.info}>
                      <Text className={styles.itemTitle}>{getRecordTitle(record)}</Text>
                      <Text className={styles.orderNo}>{record.orderNo}</Text>
                      <Text className={styles.time}>{record.createTime}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                      <Text
                        className={classnames(styles.itemAmount, {
                          [styles.incomeAmount]: record.type === 'income',
                          [styles.withdrawAmount]: record.type === 'withdraw',
                          [styles.pendingAmount]: record.status === 'pending'
                        })}
                      >
                        {getAmountPrefix(record)}¥{record.amount.toFixed(2)}
                      </Text>
                      <Text
                        className={classnames(styles.status, {
                          [styles.statusCompleted]: record.status === 'completed',
                          [styles.statusPending]: record.status === 'pending',
                          [styles.statusIncome]: record.type === 'income' && record.status === 'pending',
                          [styles.statusWithdraw]: record.type === 'withdraw' && record.status === 'pending'
                        })}
                      >
                        {getStatusText(record)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className={styles.empty}>
                  <Text className={styles.emptyIcon}>💵</Text>
                  <Text className={styles.emptyText}>暂无收支记录</Text>
                </View>
              )}
            </View>
          ) : (
            <View className={styles.reviewList}>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <View key={review.id} className={styles.reviewItem}>
                    <View className={styles.reviewHeader}>
                      <View className={styles.reviewLeft}>
                        <Text className={styles.petName}>{review.petName}</Text>
                        <Text className={styles.owner}>({review.ownerName})</Text>
                      </View>
                      <Text className={styles.rating}>
                        {renderStars(review.rating)}
                      </Text>
                    </View>
                    <Text className={styles.reviewContent}>{review.content}</Text>
                    {review.reply ? (
                      <View
                        className={styles.reply}
                        onClick={() => handleReplyReview(review)}
                      >
                        <Text className={styles.replyLabel}>我的回复（点击修改）</Text>
                        <Text className={styles.replyContent}>{review.reply}</Text>
                      </View>
                    ) : (
                      <Button
                        className={styles.replyBtn}
                        onClick={() => handleReplyReview(review)}
                      >
                        回复评价
                      </Button>
                    )}
                    <Text className={styles.reviewTime}>{review.createTime}</Text>
                  </View>
                ))
              ) : (
                <View className={styles.empty}>
                  <Text className={styles.emptyIcon}>⭐</Text>
                  <Text className={styles.emptyText}>暂无评价</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default WalletPage;
