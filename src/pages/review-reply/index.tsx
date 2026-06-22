import React, { useState, useEffect } from 'react';
import { View, Text, Textarea, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';

const quickReplies = [
  '感谢您的信任和好评，欢迎宝贝常来玩~',
  '谢谢您的建议，我们会继续改进！',
  '宝贝很可爱，期待下次再见！',
  '感谢您的认可，我们会继续努力提供更好的服务',
  '宝贝在我们这也很开心，期待下次光临~'
];

const ReviewReplyPage: React.FC = () => {
  const router = useRouter();
  const { reviews, addReviewReply } = useAppContext();
  const [review, setReview] = useState(reviews.find((r) => r.id === router.params.id));
  const [replyContent, setReplyContent] = useState(review?.reply || '');

  useEffect(() => {
    const reviewId = router.params.id;
    console.log('[ReviewReply] 评价ID:', reviewId);
    const found = reviews.find((r) => r.id === reviewId);
    setReview(found);
    if (found) {
      setReplyContent(found.reply || '');
    }
  }, [router.params.id, reviews]);

  const handleQuickReply = (text: string) => {
    setReplyContent(text);
  };

  const handleSave = () => {
    if (!review) return;
    if (!replyContent.trim()) {
      Taro.showToast({ title: '请输入回复内容', icon: 'none' });
      return;
    }

    console.log('[ReviewReply] 保存回复:', replyContent);
    Taro.showLoading({ title: '保存中...' });
    setTimeout(() => {
      addReviewReply(review.id, replyContent.trim());
      Taro.hideLoading();
      Taro.showToast({ title: '回复成功', icon: 'success' });
      console.log('[ReviewReply] 回复保存成功');
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    }, 500);
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (!review) {
    return (
      <View className={styles.page}>
        <View style={{ textAlign: 'center', padding: '120rpx 0' }}>
          <Text style={{ fontSize: '120rpx', opacity: 0.3 }}>⭐</Text>
          <Text style={{ fontSize: '24rpx', color: '#9c8c7e', marginTop: '24rpx' }}>
            评价不存在
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.reviewCard}>
        <View className={styles.header}>
          <View className={styles.left}>
            <Text className={styles.petName}>{review.petName}</Text>
            <Text className={styles.owner}>({review.ownerName})</Text>
          </View>
          <Text className={styles.rating}>{renderStars(review.rating)}</Text>
        </View>
        <View className={styles.content}>{review.content}</View>
        <Text className={styles.time}>{review.createTime}</Text>
        {review.reply && (
          <View className={styles.oldReply}>
            <Text className={styles.label}>我的回复</Text>
            <Text className={styles.content}>{review.reply}</Text>
          </View>
        )}
      </View>

      <View className={styles.replySection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>✍️</Text>
          {review.reply ? '修改回复' : '回复评价'}
        </Text>
        <Textarea
          className={styles.textarea}
          placeholder="请输入回复内容，回复会展示给客户查看"
          value={replyContent}
          onInput={(e) => setReplyContent(e.detail.value)}
        />
        <Text className={styles.hint}>回复将在评价下方展示，请文明用语</Text>

        <Text className={styles.hint} style={{ marginTop: '32rpx' }}>快捷回复：</Text>
        <View className={styles.quickReplies}>
          {quickReplies.map((reply, idx) => (
            <Button
              key={idx}
              className={styles.reply}
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.footer}>
        <Button className={styles.saveBtn} onClick={handleSave}>
          {review.reply ? '修改回复' : '发送回复'}
        </Button>
      </View>
    </View>
  );
};

export default ReviewReplyPage;
