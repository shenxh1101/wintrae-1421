import React from 'react';
import { Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface TagProps {
  text: string;
  type?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'dog' | 'cat' | 'outline';
}

const Tag: React.FC<TagProps> = ({ text, type = 'default' }) => {
  return (
    <Text className={classnames(styles.tag, styles[type])}>
      {text}
    </Text>
  );
};

export default Tag;
