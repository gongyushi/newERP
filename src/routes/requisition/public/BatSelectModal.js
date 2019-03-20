import React from 'react';
import {
  Button,
  Modal,
  Icon,
  Table,
} from 'antd';
import BatMessageModal from './BatMessageModal';
import BatAddLogModal from './BatAddLogModal';
import { erpPost } from '../../../services/ajax';


class BatSelectModal extends React.Component {
  state = {
    modalVisible: false,
    msgVisible: false,
    list: [],
    columns: [],
    title: '',
    logistics_company_id: '',
    logistics_company_name: '',
  };
  componentDidMount(){
    this.initColumns();
    this.getList();
  }
  onSubmit = (data) => {
    const { logistics_company_id, logistics_company_name } = this.state;
    if(this.props.onSubmit){
      this.handleClose('visible');
      this.props.onSubmit({logistics_company_id,logistics_company_name, ...data});
    }
  }
  getList = () => {
    erpPost('logistics-company/index',{},res => {
      this.setState({
        list: res.data.data,
      });
    });
  }
  initColumns = () => {
    const columns = [
      {
        title: '编号',
        dataIndex: 'logistics_company_no',
        key: 'logistics_company_no',
        width: 100,
        render: value => (
          <a>{value}</a>
        ),
      },
      {
        title: '物流名称',
        dataIndex: 'logistics_company_name',
        key: 'logistics_company_name',
        width: 100,
        render: value => (
          <a>{value}</a>
        ),
      },
      {
        title: '联系人',
        dataIndex: 'linkman',
        key: 'linkman',
        width: 100,
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
        key: 'phone',
        width: 100,
        render: (value,record) => value ? `+${record.phone_country_code}-${value}` : '',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 100,
        render: (value, record) => (
          <div>
            {/* 传递id或name */}
            <Button
              size='small'
              onClick={this.handleOpenModal.bind(this, 'msgVisible', '物流信息', record.logistics_company_name,record.logistics_company_id)}
              style={{ borderColor: '#6F9EEF', color: '#6F9EEF' }}
            >
              选择
            </Button>
          </div>
        ),
      },
    ];
    this.setState({columns});
  }
  handleClose = (key) => {
    this.setState({
      [key]: false,
    });
    if(key === 'visible' && this.props.onClose){
      this.props.onClose('modalVisible');
    }
  }
  handleOpenModal = (key,title,logistics_company_name='',logistics_company_id='') => {
    this.setState({
      [key]: true,
      title,
      logistics_company_id,
      logistics_company_name,
    });
  }
  
  render() {
    const { title, modalVisible, msgVisible, list, columns } = this.state;
    return (
      <div>
        <Modal
          visible={this.props.visible}
          closable={false}
          title={(
            <div>
              <span style={{ opacity: 0.6 }}>{this.props.title}</span>
              <Icon
                type='close'
                style={{ fontSize: 30, opacity: 0.6, position: 'absolute', top: 5, right: 5, cursor: 'pointer' }}
                onClick={this.handleClose.bind(this,'visible')}
              />
            </div>
          )}
          maskClosable={false}
          centered
          width='900px'
          footer={[
            <Button
              style={{ borderColor: '#00EC00', marginRight: 5 }}
              onClick={this.handleClose.bind(this,'visible')}
            >
              取消
            </Button>,
          ]}
        >
          <div style={{marginBottom: 10}}>
            <Button type='primary' onClick={this.handleOpenModal.bind(this, 'modalVisible', '新增物流单位')}>
              新增物流单位
            </Button>
          </div>
          <Table dataSource={list} columns={columns} pagination={false} rowKey='id' />
        </Modal>
        {/* 新增物流模态框 */}
        {
          modalVisible && 
          <BatAddLogModal visible={modalVisible} title={title} onClose={this.handleClose} onInit={this.getList} />
        }
        {/* 物流信息模态框 */}
        {
          msgVisible && 
          <BatMessageModal visible={msgVisible} dataObj={this.props.dataObj}  title={title} onClose={this.handleClose} onSubmit={this.onSubmit} />
        }
      </div>
    );
  }
}

export default BatSelectModal;