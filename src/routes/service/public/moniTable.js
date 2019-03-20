import React from 'react';
import { Table } from 'antd';
import styles from '../monitor.less';
import {
  erpPost,
  // erpTaoBao,
  // erpService
} from '../../../services/ajax';

// const data = [];
// for (let i = 0; i < 15; i++) {
//   data.push({
//     key: i,
//     image: '图片',
//     message: 32,
//     price: `London, Park Lane no. ${i}`,
//     sales: `sales. ${i}`,
//     ranking: `ranking. ${i}`,
//     grade: `grade. ${i}`,
//     number: `number. ${i}`,
//     category: `category. ${i}`,
//     operation: `删除`,
//   });
// }
// 列表
class MoniTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          title: '产品图片',
          dataIndex: 'image_urls',
          render: () => {
            return (
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  border: '1px solid #dcdcdc',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1523959987204&di=3e0243fa31330e6173d9592066c925ce&imgtype=0&src=http%3A%2F%2Fs6.sinaimg.cn%2Fmw690%2F005MPMsrzy6QxBg4UQZ35%26690"
                  alt="商品图片"
                  style={{ width: '100%' }}
                />
              </div>
            );
          },
        },
        {
          title: '产品信息',
          dataIndex: 'prod_name',
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
          dataIndex: 'star',
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
          render: (text, val) => {
            return (
              <div
                onClick={() => {
                  console.log(val);
                }}
              >
                {val.status === 0 ? '已处理' : '未处理'}
              </div>
            );
          },
        },
      ],
      data: [],
      selectedRowKeys: [], // Check here to configure the default column
      loading: false,
    };
  }
  componentDidMount() {
    erpPost('negative/handle', {}, res => {
      this.setState({
        data: res.data.data,
      });
    });
  }
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
    const { loading, selectedRowKeys, columns, data } = this.state;
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

export default MoniTable;
