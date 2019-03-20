import React from 'react';
import { Button } from 'antd';
import styles from './monitor.less';
import MoniTable from './public/moniTable';
import MoniSelect from './public/moniSelect';

// 渲染到页面
class Monitoring extends React.Component {
  handleChange = value => {
    console.log(`selected ${value}`);
  };

  handleBlur = () => {
    console.log('blur');
  };

  handleFocus = () => {
    console.log('focus');
  };
  render() {
    return (
      <div className={styles.competition}>
        <ul>
          <li>
            <MoniSelect />
          </li>
          <li>
            <MoniSelect />
          </li>
          <li>
            <MoniSelect />
          </li>
          <li>
            <Button type="primary">搜索</Button>
          </li>
          <li>
            <span style={{ lineHeight: '30px', color: '#4ca5ff' }}>高级搜索</span>
          </li>
        </ul>
        <div className={styles.function}>
          <Button type="primary">已处理</Button>
          <Button type="primary">未处理</Button>
          <Button type="primary">导出</Button>
        </div>
        <div>
          <MoniTable />
        </div>
      </div>
    );
  }
}

export default Monitoring;
