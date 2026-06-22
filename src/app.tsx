import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { AppProvider } from '@/store';
// 全局样式
import './app.scss';

function App(props) {
  useEffect(() => {
    console.log('[App] App initialized');
  }, []);

  useDidShow(() => {
    console.log('[App] App did show');
  });

  useDidHide(() => {
    console.log('[App] App did hide');
  });

  return <AppProvider>{props.children}</AppProvider>;
}

export default App;
