import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Video } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';

const VideoPreviewPage: React.FC = () => {
  const router = useRouter();
  const { records } = useAppContext();
  const videoRef = useRef<any>(null);
  const [record, setRecord] = useState<any>(null);
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    const recordId = router.params.recordId;
    const vIndex = parseInt(router.params.videoIndex || '0');
    setVideoIndex(vIndex);

    console.log('[VideoPreview] 记录ID:', recordId, '视频索引:', vIndex);

    if (recordId) {
      const found = records.find((r) => r.id === recordId);
      setRecord(found);
    } else {
      const videoUrl = router.params.url;
      const petName = router.params.petName || '宠物';
      const time = router.params.time || '';
      const content = router.params.content || '';
      setRecord({
        id: 'temp',
        petName,
        time,
        content,
        videos: videoUrl ? [videoUrl] : []
      });
    }
  }, [router.params, records]);

  if (!record || !record.videos || record.videos.length === 0) {
    return (
      <View className={styles.page}>
        <View className={styles.infoSection}>
          <Text className={styles.content}>视频加载失败</Text>
        </View>
      </View>
    );
  }

  const currentVideo = record.videos[videoIndex];

  return (
    <View className={styles.page}>
      <View className={styles.videoContainer}>
        <Video
          ref={videoRef}
          className={styles.video}
          src={currentVideo}
          autoplay
          controls
          showCenterPlayBtn
          showFullscreenBtn
          showPlayBtn
          showProgress
          enableProgressGesture
          onError={(e) => {
            console.error('[VideoPreview] 视频加载错误:', e);
            Taro.showToast({ title: '视频加载失败', icon: 'none' });
          }}
        />
      </View>

      <View className={styles.infoSection}>
        <View className={styles.petRow}>
          <Text className={styles.petIcon}>🐾</Text>
          <Text className={styles.petName}>{record.petName}</Text>
          <Text className={styles.recordTime}>{record.time}</Text>
        </View>

        <View className={styles.divider} />

        <Text className={styles.content}>
          {record.content || '照护视频记录'}
        </Text>
      </View>

      {record.videos.length > 1 && (
        <View className={styles.tips}>
          <Text className={styles.tipText}>
            共 {record.videos.length} 个视频，当前第 {videoIndex + 1} 个
          </Text>
        </View>
      )}
    </View>
  );
};

export default VideoPreviewPage;
