import React from 'react';
import { Input, Button } from 'antd';
import styles from '../organization.less';

// 顶部
class OrganTop extends React.Component {
  handleChange = value => {
    console.log(`selected ${value}`);
  };
  render() {
    return (
      <div>
        <Input placeholder="Basic usage" />
        <Button type="primary">搜索</Button>
        <span>高级搜索</span>
        <div className={styles.organFun}>
          <Button type="primary">保存</Button>
          <p>集团-厦门公司A-运营部-Cost-Center ID：12</p>
        </div>
      </div>
    );
  }
}

export default OrganTop;
