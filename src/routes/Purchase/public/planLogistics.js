import React from 'react';
import { Button, Table } from 'antd';

require('../appropriationPlan.less')


class PlanLogistics extends React.Component {
  state = {
    logList :[
      {
        id: '00001',
        name: '顺丰物流',
        linkman: '张三',
        customer: '李某',
        phone: '13012312312',
      },
      {
        id: '00002',
        name: '京东物流',
        linkman: '李四',
        customer: '王某',
        phone: '13012312312',
      },
    ],
  }
  // 单元格编辑
  onCellChange = (key, dataIndex, data) => {
    const dataSource = [...this.state.dataSource];
    const target = dataSource.find(item => {
      return item.inbound_item_id === key;
    });
    if (target) {
      target[dataIndex] = data;
      this.setState({ dataSource });
    }
  };
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }
  render() {
    const { logList}=this.state;
    const logColumns = [
      {
        title: '编号',
        dataIndex: 'id',
        key: 'id',
        render: value => (
          <a>{value}</a>
        ),
      },
      {
        title: '物流名称',
        dataIndex: 'name',
        key: 'name',
        render: value => (
          <a>{value}</a>
        ),
      },
      {
        title: '联系人',
        dataIndex: 'linkman',
        key: 'linkman',
      },
      {
        title: '协议客户',
        dataIndex: 'customer',
        key: 'customer',
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
        key: 'phone',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (value, record) => (
          <div>
            {/* 传递id或name */}
            <Button
              size='small'
              onClick={this.props.onShowModal.bind(this, 4)}
              style={{ borderColor: '#6F9EEF', color: '#6F9EEF' }}
            >
              选择
            </Button>
          </div>
        ),
      },
    ];
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button 
            type='primary' 
            size='small'
            onClick={this.props.onShowModal.bind(this, 3)}
          >
            新增物流
          </Button>
        </div>
        <div style={{ marginTop: 10 }}>
          <Table columns={logColumns} rowKey='id' dataSource={logList} pagination={false} />
        </div>
      </div>
    )
  }
}


export default PlanLogistics;