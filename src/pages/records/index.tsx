import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import type { CareRecord, RecordType } from '@/types';
import { formatDate, getRecordTypeText } from '@/utils';
import classnames from 'classnames';

const typeIcons: Record<string, string> = {
  feed: '🍖',
  walk: '🐾',
  medicine: '💊',
  photo: '📷',
  abnormal: '⚠️',
  handover: '📦'
};

const filterOptions = [
  { key: 'all', label: '全部' },
  { key: 'feed', label: '喂食' },
  { key: 'walk', label: '遛弯' },
  { key: 'medicine', label: '用药' },
  { key: 'photo', label: '照片' },
  { key: 'abnormal', label: '异常' }
];

const RecordsPage: React.FC = () => {
  const { records } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 200);
  }, []);

  const sortedRecords = useMemo(() => {
    return [...records].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') return sortedRecords;
    return sortedRecords.filter((r) => r.type === activeFilter);
  }, [sortedRecords, activeFilter]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, CareRecord[]> = {};
    filteredRecords.forEach((record) => {
      const date = formatDate(record.time);
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
    });
    return groups;
  }, [filteredRecords]);

  const handleAddRecord = () => {
    console.log('[Records] 新增照护记录');
    Taro.showActionSheet({
      itemList: ['喂食记录', '遛弯记录', '用药记录', '照片视频', '异常提醒', '交接物品'],
      success: (res) => {
        const types: RecordType[] = ['feed', 'walk', 'medicine', 'photo', 'abnormal', 'handover'];
        const type = types[res.tapIndex];
        console.log('[Records] 选择添加类型:', type);
        Taro.navigateTo({
          url: `/pages/record-add/index?type=${type}`
        });
      }
    });
  };

  const handleRecordClick = (record: CareRecord) => {
    console.log('[Records] 查看记录详情:', record.id);
    const hasImages = record.images && record.images.length > 0;
    const hasVideos = record.videos && record.videos.length > 0;
    const hasMedia = hasImages || hasVideos;
    
    const mediaInfo = hasMedia
      ? `\n\n📷 照片: ${record.images?.length || 0}张 | 🎬 视频: ${record.videos?.length || 0}个`
      : '';

    const hasOnlyVideos = !hasImages && hasVideos;
    const confirmText = hasOnlyVideos ? '查看视频' : (hasImages ? '查看照片' : '知道了');

    Taro.showModal({
      title: record.title,
      content: `${record.time}\n\n${record.content}${record.abnormalDesc ? '\n\n⚠️ 异常：' + record.abnormalDesc : ''}${mediaInfo}`,
      confirmText,
      cancelText: '关闭',
      showCancel: hasMedia,
      success: (res) => {
        if (res.confirm) {
          if (hasOnlyVideos && record.videos) {
            Taro.navigateTo({
              url: `/pages/video-preview/index?recordId=${record.id}&videoIndex=0`
            });
          } else if (hasImages && record.images) {
            Taro.previewImage({
              current: record.images[0],
              urls: record.images
            });
          }
        }
      }
    });
  };

  const handleImagePreview = (image: string, images: string[]) => {
    Taro.previewImage({
      current: image,
      urls: images
    });
  };

  return (
    <View className={styles.page}>
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

      <ScrollView scrollY style={{ height: 'calc(100vh - 180rpx)' }}>
        <View className={styles.recordList}>
          <View className={styles.timelineLine} />
          
          {!loading && Object.keys(groupedRecords).length > 0 ? (
            Object.entries(groupedRecords).map(([date, dayRecords]) => (
              <View key={date} className={styles.dateGroup}>
                <View className={styles.dateHeader}>
                  <Text className={styles.dateText}>{date}</Text>
                  <Text className={styles.count}>{dayRecords.length}条记录</Text>
                </View>
                {dayRecords.map((record) => (
                  <View
                    key={record.id}
                    className={classnames(styles.recordCard, {
                      [styles.abnormal]: record.isAbnormal
                    })}
                    onClick={() => handleRecordClick(record)}
                  >
                    <View
                      className={classnames(styles.timelineDot, styles[record.type])}
                    />
                    
                    <View className={styles.cardHeader}>
                      <View className={styles.left}>
                        <View
                          className={classnames(styles.typeIcon, styles[record.type])}
                        >
                          {typeIcons[record.type]}
                        </View>
                        <View className={styles.titleWrap}>
                          <Text className={styles.title}>{record.title}</Text>
                          <Text className={styles.time}>
                            {new Date(record.time).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>
                      <Text className={styles.petName}>{record.petName}</Text>
                    </View>

                    {record.isAbnormal && (
                      <Text className={styles.abnormalBadge}>
                        ⚠️ {record.abnormalDesc}
                      </Text>
                    )}

                    <Text className={styles.content}>{record.content}</Text>

                    {(record.images && record.images.length > 0) || (record.videos && record.videos.length > 0) ? (
                      <View className={styles.mediaList}>
                        {record.images?.map((img, idx) => (
                          <Image
                            key={`img-${idx}`}
                            className={styles.imageItem}
                            src={img}
                            mode="aspectFill"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImagePreview(img, record.images!);
                            }}
                          />
                        ))}
                        {record.videos?.map((_, idx) => (
                          <View
                            key={`video-${idx}`}
                            className={styles.videoThumb}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('[Records] 点击视频:', record.id, idx);
                              Taro.navigateTo({
                                url: `/pages/video-preview/index?recordId=${record.id}&videoIndex=${idx}`
                              });
                            }}
                          >
                            <Text className={styles.playIcon}>▶️</Text>
                            <Text className={styles.videoLabel}>视频{idx + 1}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ))
          ) : (
            <View className={styles.empty}>
              <Text className={styles.icon}>📝</Text>
              <Text className={styles.text}>
                {loading ? '加载中...' : '暂无照护记录'}
              </Text>
              {!loading && (
                <Button className={styles.emptyAddBtn} onClick={handleAddRecord}>
                  + 添加第一条记录
                </Button>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Button className={styles.addBtn} onClick={handleAddRecord}>
        +
      </Button>
    </View>
  );
};

export default RecordsPage;
