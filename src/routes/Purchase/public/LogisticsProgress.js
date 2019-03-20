import React from 'react';
import {
  Card,
  Modal,
  Button,
  message,
  Table,
} from 'antd';
import StoreContent from './StoreContent';
import BatDiliverModal from './BatDiliverModal';
import { erpPost } from '../../../services/ajax';

export default class LogisticsProgress extends React.Component{
  state = {
    logistColumns: [],
    logistList: [],
    page: {
      pageSize: 10,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
    storeVisible: false, // 出入库模态框
    visible: false,
    title: '', // 模态框标题
    type: '', // 类型，出库或入库
    requisition_id: this.props.requisition_id,
    currencys: [],
    status: {},
    id: '', // 入库单或出库单ID
  };
  componentDidMount(){
    const { page } = this.state;
    this.getCurrencyList();
    this.getList({page});
    this.initColumns();
  }
  getList = (page) => {
    const { requisition_id } = this.state;
    erpPost('requisition/logistics-list',{...page, requisition_id},res => {
      this.setState({
        logistList: res.data.data.map(val => this.handleData({...val})),
        page: res.data.page,
      })
    });
  }
  getCurrencyList = () => {
    erpPost('index/dictionary/lists', {keyword:'currency'}, res => {
      this.setState({
        currencys: res.data.data.children,
      });
    });
  }
  handleData = ({outbound,inbound,shipping_price_currency_code,logistics_company,...data}) => {
    const { currencys, status } = this.state;
    const currency_name = currencys.filter(val => val.id === shipping_price_currency_code)[0].remark;
    const outStoreNo = outbound ? outbound.receipt_no : '---';
    const inStoreNo = inbound ? inbound.receipt_no : '---';
    const outStatus = outbound ? status[outbound.status] : '---';
    const inStatus = inbound ? status[inbound.status] : '---';
    const outId = outbound ? outbound.id : 0;
    const inId = inbound ? inbound.id : 0;
    const logistics_company_name = logistics_company.logistics_company_name ? logistics_company.logistics_company_name : '';
    return({currency_name,outStoreNo,inStoreNo,outStatus,inStatus,outId,inId,logistics_company_name,...data});
  }
  initColumns = () => {
    const logistColumns = [
      {
        title: '运单号',
        dataIndex: 'fulfillment_no',
        key: 'fulfillment_no',
      },
      {
        title: '物流单位',
        dataIndex: 'logistics_company_name',
        key: 'logistics_company_name',
      },
      {
        title: '运费',
        dataIndex: 'shipping_price',
        key: 'shipping_price',
        render: (value,record) =>`${value} ${record.currency_name}`,
      },
      {
        title: '配送数量',
        dataIndex: 'shipping_count',
        key: 'shipping_count',
      },
      {
        title: '发货时间',
        dataIndex: 'created_at',
        key: 'created_at',
      },
      {
        title: '出库单号',
        dataIndex: 'outStoreNo',
        key: 'outStoreNo',
        render: (value,record) => (
          <a
            style={{ cursor: 'pointer' }}
            onClick={this.handleOpenModal.bind(this, record.outId, 'out', '出库详情')}
          >
            {value}
          </a>
        ),
      },
      {
        title: '状态',
        dataIndex: 'outStatus',
        key: 'outStatus',
      },
      {
        title: '入库单号',
        dataIndex: 'inStoreNo',
        key: 'inStoreNo',
        render: (value,record) => (
          <a
            style={{ cursor: 'pointer' }}
            onClick={this.handleOpenModal.bind(this, record.inId, 'in', '入库详情')}
          >
            {value}
          </a>
        ),
      },
      {
        title: '状态',
        dataIndex: 'inStatus',
        key: 'inStatus',
      },
    ];
    const status = {
      10: '待出库',
      11: '已出库',
      20: '待入库',
      21: '已入库',
    };
    this.setState({logistColumns, status});
  }
  handleOpenModal = (value, type, title) => {
    // 判断是否有值
    if(value === 0){
      return;
    }
    this.setState({
      storeVisible: true,
      title,
      type,
      id: value,
    });
  }
  // 发货一系列模态框
  handleOpenDiliverModal = () => {
    this.setState({
      visible: true,
      title: '新增物流信息',
    });
  }
  handleClose = (key) => {
    this.setState({
      [key]: false,
    });
  }
  handleTableChange = (page) => {
    this.getList({page});
  }
  render(){
    const { logistColumns, logistList, storeVisible, type, title, visible, page, requisition_id, id} = this.state;
    return(
      <div>
        <div className='cardHeadStyle'>
          <Card 
            title={
              this.props.status === 0 && (
                <Button type='primary' onClick={this.handleOpenDiliverModal}>
                  发货
                </Button>
              )
            }
            bordered={false}
          >
            <Table 
              dataSource={logistList} 
              columns={logistColumns} 
              rowKey='id' 
              pagination={page} 
              onChange={this.handleTableChange}
            />
          </Card>
        </div>
        <Modal
          title={title}
          visible={storeVisible}
          centered
          maskClosable={false}
          width='750px'
          onCancel={this.handleClose.bind(this,'storeVisible')}
          footer={[
            <Button key='back' onClick={this.handleClose.bind(this,'storeVisible')}>
              返回
            </Button>,
          ]}
        >
          <StoreContent type={type} id={id}  />
        </Modal>
        {
          visible && 
          (
            <BatDiliverModal
              visible={visible} 
              title={title}
              dataObj={{'requisition_id':requisition_id}} 
              outStore={this.props.outStore}
              onClose={this.handleClose} 
              onLoad={this.handleTableChange}
            />
          )
        }
      </div>
    );
  }
}