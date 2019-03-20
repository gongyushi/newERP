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
    orders: [],
  };
  componentDidMount(){
    this.initColumns();
    this.getList();
  }
  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextProps.detail) !== JSON.stringify(this.props.detail) ||
      JSON.stringify(nextState.orders) !== JSON.stringify(this.state.orders) ||
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    ){
      this.getList();
    }
  };
  getList = () => {
    const { requisition_id } = this.props;
    const { page, orders } = this.state;
    erpPost('requisition/log/index', {page, orders, requisition_id}, res => {
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
  handleTableChange = (page,filter,sorter) => {
    this.setState({
      page,
      orders: {field: sorter.field, order: sorter.order},
    });
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