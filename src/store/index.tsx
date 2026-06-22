import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import type { Order, Pet, CareRecord, Review, SitterSetting, Wallet, IncomeRecord, PaymentAccount, PaymentPasswordState } from '@/types';
import { mockOrders } from '@/data/orders';
import { mockPets } from '@/data/pets';
import { mockRecords } from '@/data/records';
import { mockSitterSetting, mockReviews, mockWallet, mockIncomeRecords, mockMonthlyIncome, mockPaymentAccounts } from '@/data/wallet';
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
  paymentAccounts: PaymentAccount[];
  paymentPassword: PaymentPasswordState;
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
  addIncomeRecord: (record: Omit<IncomeRecord, 'id'> & { id?: string }) => void;
  updateIncomeRecord: (recordId: string, updates: Partial<IncomeRecord>) => void;
  setPaymentPassword: (password: string) => boolean;
  verifyPaymentPassword: (password: string) => boolean;
  addPaymentAccount: (account: Omit<PaymentAccount, 'id'>) => void;
  updatePaymentAccount: (accountId: string, updates: Partial<PaymentAccount>) => void;
  deletePaymentAccount: (accountId: string) => void;
  setDefaultAccount: (accountId: string) => void;
  resetData: () => void;
  setOrders: Dispatch<SetStateAction<Order[]>>;
  setPets: Dispatch<SetStateAction<Pet[]>>;
  setRecords: Dispatch<SetStateAction<CareRecord[]>>;
  setWallet: Dispatch<SetStateAction<Wallet>>;
  setReviews: Dispatch<SetStateAction<Review[]>>;
  setIncomeRecords: Dispatch<SetStateAction<IncomeRecord[]>>;
}

const STORAGE_KEY = 'pet_sitter_app_data';
const PASSWORD_HASH_KEY = 'payment_password_hash';

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockPasswordState: PaymentPasswordState = {
  hasPassword: false
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [records, setRecords] = useState<CareRecord[]>(mockRecords);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [sitterSetting, setSitterSetting] = useState<SitterSetting>(mockSitterSetting);
  const [wallet, setWallet] = useState<Wallet>(mockWallet);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(mockIncomeRecords);
  const [monthlyIncome] = useState<MonthlyIncome[]>(mockMonthlyIncome);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>(mockPaymentAccounts);
  const [paymentPassword, setPaymentPasswordState] = useState<PaymentPasswordState>(mockPasswordState);
  const [loaded, setLoaded] = useState(false);

  const hashPassword = (pwd: string): string => {
    let hash = 0;
    for (let i = 0; i < pwd.length; i++) {
      const char = pwd.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  const recalcWallet = (records: IncomeRecord[], currentWallet: Wallet): Wallet => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    let balance = currentWallet.balance;
    let pendingAmount = 0;
    let withdrawPending = 0;
    let totalIncome = 0;
    let monthIncome = 0;

    records.forEach((r) => {
      if (r.type === 'income') {
        totalIncome += r.amount;
        if (r.createTime.startsWith(currentMonth)) {
          monthIncome += r.amount;
        }
        if (r.status === 'pending') {
          pendingAmount += r.amount;
        }
      } else if (r.type === 'withdraw') {
        if (r.status === 'pending') {
          withdrawPending += r.amount;
        }
      }
    });

    return {
      balance: Number(balance.toFixed(2)),
      pendingAmount: Number(pendingAmount.toFixed(2)),
      withdrawPending: Number(withdrawPending.toFixed(2)),
      totalIncome: Number(totalIncome.toFixed(2)),
      monthIncome: Number(monthIncome.toFixed(2))
    };
  };

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (loaded) {
      saveToStorage();
    }
  }, [orders, pets, records, reviews, sitterSetting, wallet, incomeRecords, paymentAccounts, paymentPassword, loaded]);

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
        if (parsed.paymentAccounts) setPaymentAccounts(parsed.paymentAccounts);
        if (parsed.paymentPassword) setPaymentPasswordState(parsed.paymentPassword);
      }
    } catch (e) {
      console.log('[Store] 无缓存数据，使用默认数据');
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (loaded) {
      setWallet((prev) => recalcWallet(incomeRecords, prev));
    }
  }, [loaded, incomeRecords]);

  const saveToStorage = async () => {
    try {
      const data = {
        orders,
        pets,
        records,
        reviews,
        sitterSetting,
        wallet,
        incomeRecords,
        paymentAccounts,
        paymentPassword
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
          setPaymentAccounts(mockPaymentAccounts);
          setPaymentPasswordState(mockPasswordState);
          Taro.removeStorage({ key: STORAGE_KEY });
          Taro.removeStorage({ key: PASSWORD_HASH_KEY });
          Taro.showToast({ title: '已重置', icon: 'success' });
        }
      }
    });
  };

  const setPaymentPassword = async (password: string): Promise<boolean> => {
    try {
      const hash = hashPassword(password);
      await Taro.setStorage({ key: PASSWORD_HASH_KEY, data: hash });
      setPaymentPasswordState({
        hasPassword: true,
        lastSetTime: new Date().toISOString()
      });
      console.log('[Store] 支付密码设置成功');
      return true;
    } catch (e) {
      console.error('[Store] 设置支付密码失败:', e);
      return false;
    }
  };

  const verifyPaymentPassword = async (password: string): Promise<boolean> => {
    try {
      const data = await Taro.getStorage({ key: PASSWORD_HASH_KEY });
      if (!data.data) return false;
      const hash = hashPassword(password);
      return data.data === hash;
    } catch (e) {
      console.error('[Store] 验证支付密码失败:', e);
      return false;
    }
  };

  const addPaymentAccount = (account: Omit<PaymentAccount, 'id'>) => {
    console.log('[Store] 添加收款账户:', account.type, account.account);
    const newAccount: PaymentAccount = {
      ...account,
      id: generateId()
    };
    if (newAccount.isDefault) {
      setPaymentAccounts((prev) =>
        prev.map((a) => ({ ...a, isDefault: false })).concat(newAccount)
      );
    } else {
      setPaymentAccounts((prev) => [...prev, newAccount]);
    }
  };

  const updatePaymentAccount = (accountId: string, updates: Partial<PaymentAccount>) => {
    console.log('[Store] 更新收款账户:', accountId, updates);
    if (updates.isDefault) {
      setPaymentAccounts((prev) =>
        prev.map((a) =>
          a.id === accountId
            ? { ...a, ...updates }
            : { ...a, isDefault: false }
        )
      );
    } else {
      setPaymentAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, ...updates } : a))
      );
    }
  };

  const deletePaymentAccount = (accountId: string) => {
    console.log('[Store] 删除收款账户:', accountId);
    setPaymentAccounts((prev) => prev.filter((a) => a.id !== accountId));
  };

  const setDefaultAccount = (accountId: string) => {
    console.log('[Store] 设置默认账户:', accountId);
    setPaymentAccounts((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === accountId
      }))
    );
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

  const addIncomeRecord = (record: Omit<IncomeRecord, 'id'> & { id?: string }) => {
    console.log('[Store] Add income record:', record.orderNo, record.type);
    const newRecord: IncomeRecord = { ...record, id: record.id || generateId() } as IncomeRecord;
    setIncomeRecords((prev) => {
      const next = [newRecord, ...prev];
      setWallet((prevWallet) => {
        let nextWallet = { ...prevWallet };
        if (newRecord.type === 'income' && newRecord.status === 'completed') {
          nextWallet.balance = Number((prevWallet.balance + newRecord.amount).toFixed(2));
        } else if (newRecord.type === 'withdraw') {
          nextWallet.balance = Number((prevWallet.balance - newRecord.amount).toFixed(2));
        }
        return recalcWallet(next, nextWallet);
      });
      return next;
    });
  };

  const updateIncomeRecord = (recordId: string, updates: Partial<IncomeRecord>) => {
    console.log('[Store] Update income record:', recordId, updates);
    setIncomeRecords((prev) => {
      const next = prev.map((r) => (r.id === recordId ? { ...r, ...updates } : r));
      setWallet((prevWallet) => recalcWallet(next, prevWallet));
      return next;
    });
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
        paymentAccounts,
        paymentPassword,
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
        updateIncomeRecord,
        setPaymentPassword,
        verifyPaymentPassword,
        addPaymentAccount,
        updatePaymentAccount,
        deletePaymentAccount,
        setDefaultAccount,
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
