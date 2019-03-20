import React from 'react';
import {
  Card,
  Table,
} from 'antd';
import { erpPost } from '../../../services/ajax';

export default class OperationLog extends React.Component{
  state = {
    columns: [],
    list: [],
    page: {
      pageSize: 10,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
    id: this.props.requisition_id,
  };
  componentDidMount(){
    const { page } = this.state;
    this.initColumns();
    this.getList({page});
  }
  getList = (page) => {
    const { id } = this.state;
    erpPost('requisition/log-list', {...page, requisition_id: id}, res => {
      this.setState({
        list: res.data.data.map(val => this.handleData({...val})),
        page: res.data.page,
      });
    });
  }
  handleData = ({person,...data}) => {
    const { real_name } = person;
    return({real_name, ...data});
  }
  initColumns = () => {
    const columns = [
      {
        title: '操作类型',
        dataIndex: 'type',
        key: 'type',
        width: 200,
      },
      {
        title: '操作人员',
        dataIndex: 'real_name',
        key: 'real_name',
        width: 200,
      },
      {
        title: '操作时间（UTC）',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 200,
      },
      {
        title: '内容',
        dataIndex: 'content',
        key: 'content',
        width: 400,
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