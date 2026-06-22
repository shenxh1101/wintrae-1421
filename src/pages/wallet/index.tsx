import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import type { IncomeRecord, Review } from '@/types';
import classnames from 'classnames';

const tabOptions = [
  { key: 'income', label: '收入明细' },
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

  useEffect(() => {
    console.log('[Wallet] 钱包页面加载');
  }, []);

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
        if (incomeRecords.length > 0) {
          Taro.navigateTo({ url: `/pages/bill-detail/index?id=${incomeRecords[0].id}` });
        } else {
          Taro.showToast({ title: '暂无账单记录', icon: 'none' });
        }
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
    console.log('[Wallet] 查看待收款');
    const pending = incomeRecords.find((r) => r.status === 'pending');
    if (pending) {
      Taro.navigateTo({ url: `/pages/bill-detail/index?id=${pending.id}` });
    } else {
      Taro.showToast({ title: '暂无待收款', icon: 'none' });
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

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
            <Text className={styles.label}>待收款</Text>
            <Text className={styles.value}>¥{wallet.pendingAmount.toFixed(2)}</Text>
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
          <Text className={styles.subText}>收支明细</Text>
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
              {incomeRecords.length > 0 ? (
                incomeRecords.map((record) => (
                  <View
                    key={record.id}
                    className={styles.incomeItem}
                    onClick={() => handleIncomeClick(record)}
                  >
                    <View className={styles.icon}>💰</View>
                    <View className={styles.info}>
                      <Text className={styles.title}>{record.petName}寄养费</Text>
                      <Text className={styles.orderNo}>{record.orderNo}</Text>
                      <Text className={styles.time}>{record.createTime}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                      <Text
                        className={classnames(styles.amount, {
                          [styles.pending]: record.status === 'pending'
                        })}
                      >
                        +¥{record.amount.toFixed(2)}
                      </Text>
                      <Text className={styles.status}>
                        {record.status === 'completed' ? '已到账' : '待结算'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className={styles.empty}>
                  <Text className={styles.icon}>💵</Text>
                  <Text className={styles.text}>暂无收入记录</Text>
                </View>
              )}
            </View>
          ) : (
            <View className={styles.reviewList}>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <View key={review.id} className={styles.reviewItem}>
                    <View className={styles.reviewHeader}>
                      <View className={styles.left}>
                        <Text className={styles.petName}>{review.petName}</Text>
                        <Text className={styles.owner}>({review.ownerName})</Text>
                      </View>
                      <Text className={styles.rating}>
                        {renderStars(review.rating)}
                      </Text>
                    </View>
                    <Text className={styles.content}>{review.content}</Text>
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
                    <Text className={styles.time}>{review.createTime}</Text>
                  </View>
                ))
              ) : (
                <View className={styles.empty}>
                  <Text className={styles.icon}>⭐</Text>
                  <Text className={styles.text}>暂无评价</Text>
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
