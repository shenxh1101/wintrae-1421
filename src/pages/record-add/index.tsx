import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Button, Input, Textarea, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store';
import { getRecordTypeText, formatDateTime } from '@/utils';
import classnames from 'classnames';
import type { CareRecord, RecordType, Order } from '@/types';
import dayjs from 'dayjs';

const typeIcons: Record<string, string> = {
  feed: '🍖',
  walk: '🐾',
  medicine: '💊',
  photo: '📷',
  abnormal: '⚠️',
  handover: '📦'
};

const typeDescs: Record<string, string> = {
  feed: '记录宠物的喂食情况',
  walk: '记录遛弯时间和状态',
  medicine: '记录用药情况',
  photo: '上传照片或视频',
  abnormal: '记录异常情况并提醒',
  handover: '记录交接的物品'
};

const feedOptions = ['食欲正常', '食欲良好', '食欲不佳', '全部吃完', '剩余少量', '剩余较多'];
const walkOptions = ['精神良好', '排便正常', '排便偏软', '未排便', '玩耍开心', '走路缓慢'];
const medicineOptions = ['已喂药', '拒食药物', '药物反应正常', '需观察', '已涂抹外用药'];
const handoverItems = ['狗粮', '猫粮', '牵引绳', '食盆', '水盆', '玩具', '猫砂', '猫砂盆', '衣服', '梳子', '航空箱', '药物', '其他'];

const quickContent: Record<string, string[]> = {
  feed: ['早餐喂食完毕，吃得很香', '午餐正常进食', '晚餐食欲良好', '加餐了一点零食', '喝水情况正常'],
  walk: ['遛弯30分钟，状态很好', '排便正常，精神不错', '玩得很开心，跑了很久', '今天走路比较慢', '遇到其他狗狗很友好'],
  medicine: ['按医嘱喂药完成', '药物已涂抹', '观察中，暂无异常', '吃药很配合', '有点抗拒，最后还是吃了']
};

const RecordAddPage: React.FC = () => {
  const router = useRouter();
  const { records, pets, orders, addRecord } = useAppContext();

  const recordType = (router.params.type as RecordType) || 'feed';
  const petIdFromParam = router.params.petId;
  const orderIdFromParam = router.params.orderId;

  const [selectedPetId, setSelectedPetId] = useState(petIdFromParam || '');
  const [selectedOrderId, setSelectedOrderId] = useState(orderIdFromParam || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [abnormalDesc, setAbnormalDesc] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const ongoingOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'ongoing' || o.status === 'accepted');
  }, [orders]);

  const selectedOrder = useMemo(() => {
    return ongoingOrders.find((o) => o.id === selectedOrderId);
  }, [ongoingOrders, selectedOrderId]);

  const selectedPet = useMemo(() => {
    return pets.find((p) => p.id === selectedPetId);
  }, [pets, selectedPetId]);

  useEffect(() => {
    console.log('[RecordAdd] 记录类型:', recordType, '宠物ID:', petIdFromParam, '订单ID:', orderIdFromParam);
    if (selectedOrder) {
      setSelectedPetId(selectedOrder.petId);
    }
  }, [recordType, petIdFromParam, orderIdFromParam, selectedOrder]);

  const handleOrderSelect = () => {
    if (ongoingOrders.length === 0) {
      Taro.showToast({ title: '暂无进行中的订单', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: ongoingOrders.map((o) => `${o.petName} - ${o.checkInDate}至${o.checkOutDate}`),
      success: (res) => {
        const order = ongoingOrders[res.tapIndex];
        setSelectedOrderId(order.id);
        setSelectedPetId(order.petId);
      }
    });
  };

  const handleOptionClick = (option: string) => {
    if (quickContent[recordType]?.includes(option)) {
      setContent(option);
    } else if (handoverItems.includes(option)) {
      setSelectedItems((prev) =>
        prev.includes(option)
          ? prev.filter((i) => i !== option)
          : [...prev, option]
      );
    } else {
      const currentContent = content ? content + '，' + option : option;
      setContent(currentContent);
    }
  };

  const handleAddImage = () => {
    Taro.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: () => {
        const mockImages = [
          'https://picsum.photos/id/237/400/300',
          'https://picsum.photos/id/659/400/300',
          'https://picsum.photos/id/718/400/300',
          'https://picsum.photos/id/1025/400/300'
        ];
        const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
        setImages((prev) => [...prev, randomImage]);
        Taro.showToast({ title: '添加成功', icon: 'success' });
      }
    });
  };

  const handleAddVideo = () => {
    Taro.showActionSheet({
      itemList: ['拍摄视频', '从相册选择'],
      success: () => {
        const mockVideos = [
          'https://www.w3schools.com/html/mov_bbb.mp4',
          'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
        ];
        const randomVideo = mockVideos[Math.floor(Math.random() * mockVideos.length)];
        setVideos((prev) => [...prev, randomVideo]);
        Taro.showToast({ title: '视频添加成功', icon: 'success' });
      }
    });
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    console.log('[RecordAdd] 保存记录:', { recordType, title, content, images });

    if (!selectedOrderId && !selectedPetId) {
      Taro.showToast({ title: '请选择宠物或订单', icon: 'none' });
      return;
    }

    const orderPetId = selectedOrder?.petId || selectedPetId;
    const orderPetName = selectedOrder?.petName || selectedPet?.name || '';

    if (!orderPetId || !orderPetName) {
      Taro.showToast({ title: '宠物信息不完整', icon: 'none' });
      return;
    }

    let finalTitle = title;
    let finalContent = content;
    let finalIsAbnormal = isAbnormal;
    let finalAbnormalDesc = abnormalDesc;

    if (recordType === 'handover') {
      if (selectedItems.length === 0 && !content) {
        Taro.showToast({ title: '请选择交接物品', icon: 'none' });
        return;
      }
      finalTitle = '交接物品确认';
      finalContent = `已确认收到：${selectedItems.join('、')}${content ? '。备注：' + content : ''}`;
    } else if (recordType === 'abnormal') {
      if (!abnormalDesc && !content) {
        Taro.showToast({ title: '请描述异常情况', icon: 'none' });
        return;
      }
      finalIsAbnormal = true;
      finalAbnormalDesc = abnormalDesc || content;
      finalTitle = title || '异常提醒';
    } else {
      if (!content) {
        Taro.showToast({ title: '请填写记录内容', icon: 'none' });
        return;
      }
      if (!finalTitle) {
        const defaultTitles: Record<string, string> = {
          feed: '喂食记录',
          walk: '遛弯记录',
          medicine: '用药记录',
          photo: '照片记录'
        };
        finalTitle = defaultTitles[recordType] || '照护记录';
      }
    }

    Taro.showLoading({ title: '保存中...' });
    setTimeout(() => {
      const newRecord: Omit<CareRecord, 'id'> = {
        orderId: selectedOrderId || '',
        petId: orderPetId,
        petName: orderPetName,
        type: recordType,
        title: finalTitle,
        content: finalContent,
        time: formatDateTime(dayjs().toDate()),
        images: images.length > 0 ? images : undefined,
        videos: videos.length > 0 ? videos : undefined,
        isAbnormal: finalIsAbnormal,
        abnormalDesc: finalAbnormalDesc || undefined
      };

      addRecord(newRecord);
      Taro.hideLoading();
      Taro.showToast({ title: '保存成功', icon: 'success' });
      console.log('[RecordAdd] 记录保存成功:', newRecord);
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    }, 500);
  };

  const getOptionsForType = () => {
    switch (recordType) {
      case 'feed': return feedOptions;
      case 'walk': return walkOptions;
      case 'medicine': return medicineOptions;
      case 'handover': return handoverItems;
      default: return [];
    }
  };

  const showImageUpload = recordType === 'photo' || recordType === 'abnormal';
  const showItemList = recordType === 'handover';
  const showAbnormalBox = recordType === 'abnormal';

  return (
    <View className={styles.page}>
      <View className={styles.typeHeader}>
        <View className={styles.typeInfo}>
          <View className={styles.icon}>{typeIcons[recordType]}</View>
          <View className={styles.info}>
            <Text className={styles.typeName}>{getRecordTypeText(recordType)}</Text>
            <Text className={styles.typeDesc}>{typeDescs[recordType]}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>🐾</Text>选择宠物
          <Text className={styles.required}>*</Text>
        </Text>
        <View className={styles.petSelector} onClick={handleOrderSelect}>
          {selectedOrder ? (
            <>
              <Image className={styles.avatar} src={selectedOrder.petAvatar} mode="aspectFill" />
              <View className={styles.info}>
                <Text className={styles.name}>{selectedOrder.petName}</Text>
                <Text className={styles.meta}>
                  {selectedOrder.checkInDate} - {selectedOrder.checkOutDate}（{selectedOrder.days}晚）
                </Text>
              </View>
            </>
          ) : selectedPet ? (
            <>
              <Image className={styles.avatar} src={selectedPet.avatar} mode="aspectFill" />
              <View className={styles.info}>
                <Text className={styles.name}>{selectedPet.name}</Text>
                <Text className={styles.meta}>{selectedPet.breed} · {selectedPet.age}岁</Text>
              </View>
            </>
          ) : (
            <View className={styles.info} style={{ flex: 1 }}>
              <Text className={styles.name} style={{ color: '#9c8c7e' }}>请选择进行中的订单</Text>
              <Text className={styles.meta}>点击选择宠物</Text>
            </View>
          )}
          <Text className={styles.arrow}>›</Text>
        </View>
      </View>

      {!showAbnormalBox && !showItemList && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>📝</Text>记录标题
          </Text>
          <View className={styles.formRow}>
            <Input
              className={styles.input}
              placeholder={`请输入${getRecordTypeText(recordType)}标题`}
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
            />
          </View>
        </View>
      )}

      {showAbnormalBox && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>⚠️</Text>异常情况描述
            <Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.abnormalBox}>
            <Text className={styles.label}>请详细描述异常情况，以便及时处理</Text>
            <Input
              className={styles.input}
              placeholder="例如：精神不佳、食欲不振、呕吐腹泻等"
              value={abnormalDesc}
              onInput={(e) => setAbnormalDesc(e.detail.value)}
            />
          </View>
        </View>
      )}

      {showItemList && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>📦</Text>交接物品
          </Text>
          <View className={styles.itemList}>
            {handoverItems.map((item) => (
              <Button
                key={item}
                className={classnames(styles.item, {
                  [styles.active]: selectedItems.includes(item)
                })}
                onClick={() => handleOptionClick(item)}
              >
                {item}
              </Button>
            ))}
          </View>
          <Text className={styles.hint}>已选择 {selectedItems.length} 件物品</Text>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.icon}>✍️</Text>详细内容
          <Text className={styles.required}>*</Text>
        </Text>
        <View className={styles.formRow}>
          <Textarea
            className={styles.textarea}
            placeholder={
              showItemList
                ? '其他需要说明的内容（选填）'
                : showAbnormalBox
                ? '补充说明情况（选填）'
                : `请详细描述${getRecordTypeText(recordType)}的具体情况...`
            }
            value={content}
            onInput={(e) => setContent(e.detail.value)}
          />
        </View>

        {quickContent[recordType] && (
          <>
            <Text className={styles.hint}>快捷填写：</Text>
            <View className={styles.quickOptions}>
              {quickContent[recordType].map((option, idx) => (
                <Button
                  key={idx}
                  className={styles.option}
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </Button>
              ))}
            </View>
          </>
        )}

        {!showItemList && !showAbnormalBox && getOptionsForType().length > 0 && (
          <>
            <Text className={styles.hint} style={{ marginTop: '$spacing-md' }}>快速标签：</Text>
            <View className={styles.optionGrid}>
              {getOptionsForType().map((option, idx) => (
                <Button
                  key={idx}
                  className={classnames(styles.option, {
                    [styles.active]: content.includes(option)
                  })}
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </Button>
              ))}
            </View>
          </>
        )}
      </View>

      {showImageUpload && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.icon}>📷</Text>照片/视频
          </Text>

          <View className={styles.mediaTabs}>
            <Button
              className={classnames(styles.mediaTab, {
                [styles.active]: mediaType === 'photo'
              })}
              onClick={() => setMediaType('photo')}
            >
              📷 照片 ({images.length})
            </Button>
            <Button
              className={classnames(styles.mediaTab, {
                [styles.active]: mediaType === 'video'
              })}
              onClick={() => setMediaType('video')}
            >
              🎬 视频 ({videos.length})
            </Button>
          </View>

          {mediaType === 'photo' ? (
            <View className={styles.imageUpload}>
              {images.map((img, idx) => (
                <View key={idx} className={styles.imageItem}>
                  <Image className={styles.image} src={img} mode="aspectFill" />
                  <Button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(idx);
                    }}
                  >
                    ×
                  </Button>
                </View>
              ))}
              {images.length < 9 && (
                <Button className={styles.addBtn} onClick={handleAddImage}>
                  <Text className={styles.plus}>+</Text>
                  <Text>添加照片</Text>
                </Button>
              )}
            </View>
          ) : (
            <View className={styles.imageUpload}>
              {videos.map((_, idx) => (
                <View key={idx} className={styles.videoItem}>
                  <View className={styles.videoThumb}>
                    <Text className={styles.videoIcon}>▶️</Text>
                    <Text className={styles.videoLabel}>视频{idx + 1}</Text>
                  </View>
                  <Button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteVideo(idx);
                    }}
                  >
                    ×
                  </Button>
                </View>
              ))}
              {videos.length < 3 && (
                <Button className={styles.addBtn} onClick={handleAddVideo}>
                  <Text className={styles.plus}>+</Text>
                  <Text>添加视频</Text>
                </Button>
              )}
            </View>
          )}
          <Text className={styles.hint}>
            照片最多9张，视频最多3个
          </Text>
        </View>
      )}

      <View className={styles.footer}>
        <Button className={styles.saveBtn} onClick={handleSave}>
          保存记录
        </Button>
      </View>
    </View>
  );
};

export default RecordAddPage;
