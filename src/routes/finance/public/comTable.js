import React from 'react';
import { Table } from 'antd';
import styles from '../finance.less';

// 产品列表数据
const columns = [
  {
    title: '产品图片',
    dataIndex: 'image',
  },
  {
    title: '产品信息',
    dataIndex: 'message',
  },
  {
    title: '价格($)',
    dataIndex: 'price',
  },
  {
    title: '销量',
    dataIndex: 'sales',
  },
  {
    title: '排名',
    dataIndex: 'ranking',
  },
  {
    title: '评分',
    dataIndex: 'grade',
  },
  {
    title: '评论数',
    dataIndex: 'number',
  },
  {
    title: '品类',
    dataIndex: 'category',
  },
  {
    title: '操作',
    dataIndex: 'operation',
  },
];
const data = [];
for (let i = 0; i < 15; i++) {
  data.push({
    key: i,
    image: '图片',
    message: 32,
    price: `London, Park Lane no. ${i}`,
    sales: `sales. ${i}`,
    ranking: `ranking. ${i}`,
    grade: `grade. ${i}`,
    number: `number. ${i}`,
    category: `category. ${i}`,
    operation: `删除`,
  });
}
// 列表
class ComTable extends React.Component {
  state = {
    selectedRowKeys: [], // Check here to configure the default column
    loading: false,
  };
  onSelectChange = selectedRowKeys => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  };
  start = () => {
    this.setState({ loading: true });
    // ajax request after empty completing
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }, 1000);
  };

  render() {
    const { loading, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    // const hasSelected = selectedRowKeys.length > 0;
    return (
      <div>
        <Table
          className={styles.comTable}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
        />
      </div>
    );
  }
}

export default ComTable;
