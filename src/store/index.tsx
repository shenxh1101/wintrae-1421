import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import type { Order, Pet, CareRecord, Review, SitterSetting, Wallet, IncomeRecord } from '@/types';
import { mockOrders } from '@/data/orders';
import { mockPets } from '@/data/pets';
import { mockRecords } from '@/data/records';
import { mockSitterSetting, mockReviews, mockWallet, mockIncomeRecords, mockMonthlyIncome } from '@/data/wallet';
import { generateId } from '@/utils';
import Taro from '@tarojs/taro';

interface MonthlyIncome {
  month: string;
  income: number;
}

interface AppState {
  orders: Order[];
  pets: Pet[];
  records: CareRecord[];
  reviews: Review[];
  sitterSetting: SitterSetting;
  wallet: Wallet;
  incomeRecords: IncomeRecord[];
  monthlyIncome: MonthlyIncome[];
}

interface AppContextType extends AppState {
  updateSitterSetting: (setting: Partial<SitterSetting>) => void;
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addPet: (pet: Omit<Pet, 'id'>) => void;
  updatePet: (petId: string, updates: Partial<Pet>) => void;
  addRecord: (record: Omit<CareRecord, 'id'>) => void;
  addReviewReply: (reviewId: string, reply: string) => void;
  updatePetRemark: (petId: string, remark: string) => void;
  addIncomeRecord: (record: Omit<IncomeRecord, 'id'>) => void;
  resetData: () => void;
  setOrders: Dispatch<SetStateAction<Order[]>>;
  setPets: Dispatch<SetStateAction<Pet[]>>;
  setRecords: Dispatch<SetStateAction<CareRecord[]>>;
  setWallet: Dispatch<SetStateAction<Wallet>>;
  setReviews: Dispatch<SetStateAction<Review[]>>;
  setIncomeRecords: Dispatch<SetStateAction<IncomeRecord[]>>;
}

const STORAGE_KEY = 'pet_sitter_app_data';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [records, setRecords] = useState<CareRecord[]>(mockRecords);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [sitterSetting, setSitterSetting] = useState<SitterSetting>(mockSitterSetting);
  const [wallet, setWallet] = useState<Wallet>(mockWallet);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(mockIncomeRecords);
  const [monthlyIncome] = useState<MonthlyIncome[]>(mockMonthlyIncome);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (loaded) {
      saveToStorage();
    }
  }, [orders, pets, records, reviews, sitterSetting, wallet, incomeRecords, loaded]);

  const loadFromStorage = async () => {
    try {
      const data = await Taro.getStorage({ key: STORAGE_KEY });
      if (data.data) {
        const parsed = JSON.parse(data.data);
        console.log('[Store] 从缓存加载数据');
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.pets) setPets(parsed.pets);
        if (parsed.records) setRecords(parsed.records);
        if (parsed.reviews) setReviews(parsed.reviews);
        if (parsed.sitterSetting) setSitterSetting(parsed.sitterSetting);
        if (parsed.wallet) setWallet(parsed.wallet);
        if (parsed.incomeRecords) setIncomeRecords(parsed.incomeRecords);
      }
    } catch (e) {
      console.log('[Store] 无缓存数据，使用默认数据');
    } finally {
      setLoaded(true);
    }
  };

  const saveToStorage = async () => {
    try {
      const data = {
        orders,
        pets,
        records,
        reviews,
        sitterSetting,
        wallet,
        incomeRecords
      };
      await Taro.setStorage({ key: STORAGE_KEY, data: JSON.stringify(data) });
      console.log('[Store] 数据已保存到缓存');
    } catch (e) {
      console.error('[Store] 保存缓存失败:', e);
    }
  };

  const resetData = () => {
    Taro.showModal({
      title: '重置数据',
      content: '确定要重置所有数据吗？此操作不可恢复。',
      confirmColor: '#ff5252',
      success: (res) => {
        if (res.confirm) {
          setOrders(mockOrders);
          setPets(mockPets);
          setRecords(mockRecords);
          setReviews(mockReviews);
          setSitterSetting(mockSitterSetting);
          setWallet(mockWallet);
          setIncomeRecords(mockIncomeRecords);
          Taro.removeStorage({ key: STORAGE_KEY });
          Taro.showToast({ title: '已重置', icon: 'success' });
        }
      }
    });
  };

  const updateSitterSetting = (setting: Partial<SitterSetting>) => {
    console.log('[Store] Update sitter setting:', setting);
    setSitterSetting((prev) => ({ ...prev, ...setting }));
  };

  const addOrder = (order: Omit<Order, 'id'>) => {
    console.log('[Store] Add order:', order.orderNo);
    const newOrder: Order = { ...order, id: generateId() };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    console.log('[Store] Update order:', orderId, updates);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    console.log('[Store] Update order status:', orderId, status);
    updateOrder(orderId, { status });
  };

  const addPet = (pet: Omit<Pet, 'id'>) => {
    console.log('[Store] Add pet:', pet.name);
    const newPet: Pet = { ...pet, id: generateId() };
    setPets((prev) => [newPet, ...prev]);
  };

  const updatePet = (petId: string, updates: Partial<Pet>) => {
    console.log('[Store] Update pet:', petId, updates);
    setPets((prev) =>
      prev.map((p) => (p.id === petId ? { ...p, ...updates } : p))
    );
  };

  const addRecord = (record: Omit<CareRecord, 'id'>) => {
    console.log('[Store] Add record:', record.title);
    const newRecord: CareRecord = { ...record, id: generateId() };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const addReviewReply = (reviewId: string, reply: string) => {
    console.log('[Store] Add review reply:', reviewId);
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reply } : r))
    );
  };

  const updatePetRemark = (petId: string, remark: string) => {
    console.log('[Store] Update pet remark:', petId);
    updatePet(petId, { remark });
  };

  const addIncomeRecord = (record: Omit<IncomeRecord, 'id'>) => {
    console.log('[Store] Add income record:', record.orderNo);
    const newRecord: IncomeRecord = { ...record, id: generateId() };
    setIncomeRecords((prev) => [newRecord, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        pets,
        records,
        reviews,
        sitterSetting,
        wallet,
        incomeRecords,
        monthlyIncome,
        updateSitterSetting,
        addOrder,
        updateOrder,
        updateOrderStatus,
        addPet,
        updatePet,
        addRecord,
        addReviewReply,
        updatePetRemark,
        addIncomeRecord,
        resetData,
        setOrders,
        setPets,
        setRecords,
        setWallet,
        setReviews,
        setIncomeRecords
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
