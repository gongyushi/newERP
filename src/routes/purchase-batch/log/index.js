import React from 'react';
import {
  Card,
  Table,
} from 'antd';
import { erpPost } from '../../../services/ajax';

export default class BatOperationLog extends React.Component{
  state = {
    columns: [],
    list: [],
    page: {
      pageSize: 10,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
  };
  componentDidMount(){
    this.getList({page:this.state.page});
    this.initColumns();
  }
  getList = (page) => {
    const { id, purchase_id } = this.props;
    erpPost('purchase-batch/log/index', {purchase_id, id, ...page}, res => {
      this.setState({
        list: res.data.data,
        page: res.data.page,
      });
    });
  }
  initColumns = () => {
    const columns = [
      {
        title: '操作类型',
        dataIndex: 'type',
        key: 'type',
        width: 100,
      },
      {
        title: '操作人员',
        dataIndex: 'real_name',
        key: 'real_name',
        width: 100,
      },
      {
        title: '操作时间（UTC）',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 100,
        render: val => val || '--',
      },
      {
        title: '内容',
        dataIndex: 'content',
        key: 'content',
        width: 100,
      },
    ];
    this.setState({columns});
  }
  handleTableChange = (page) => {
    this.getList({page});
  }
  render(){
    const {columns,list, page} = this.state;
    return(
      <div>
        <div className='cardHeadStyle'>
          <Card title='操作日志' bordered={false}>
            <Table columns={columns} dataSource={list} pagination={page} onChange={this.handleTableChange} rowKey='id' />
          </Card>
        </div>
      </div>
    );
  }
}