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

export default class BatLogisticsProgress extends React.Component{
  state = {
    logistColumns: [],
    logistList: [],
    visible: false,
    storeVisible: false, // 出入库模态框
    title: '', // 模态框标题
    type: '', // 类型，出库或入库
    status: {},
    currencys: [],
    page: {
      pageSize: 10,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
    id: this.props.batch_id,
    purchase_id: this.props.purchase_id,
    inId: '', // 入库单ID
  };
  componentDidMount(){
    this.getList();
    this.getCurrencyList();
    this.initColumns();
  }
  getList = () => {
    const { page, id, purchase_id } = this.state;
    erpPost('purchase-batch/logistics/index',{page, purchase_id, id},res => {
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
  handleData = ({inbound_status,shipping_price_currency_code,...data}) => {
    const { currencys, status } = this.state;
    const currency_name = currencys.filter(val => val.id === shipping_price_currency_code)[0].remark;
    const inStatus = inbound_status ? status[inbound_status] : '---';
    return({currency_name,inStatus,...data});
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
        title: '入库单号',
        dataIndex: 'receipt_no',
        key: 'receipt_no',
        render: (value,record) => (
          <a
            style={{ cursor: 'pointer' }}
            onClick={this.handleOpenModal.bind(this, record.inbound_id, 'in', '入库详情')}
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
    this.setState({
      storeVisible: true,
      title,
      type,
      inId: value,
    });
  }
  // 发货一些列模态框
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
  render(){
    const { logistColumns, logistList, storeVisible, visible, type, title, page, inId, purchase_id, id} = this.state;
    const { status } = this.props;
    return(
      <div>
        <div className='cardHeadStyle'>
          <Card 
            title={
              (status === 4 || status === 5) && (
                <Button type='primary' onClick={this.handleOpenDiliverModal} >
                  发货
                </Button>
            )} 
            bordered={false}
          >
            <Table dataSource={logistList} columns={logistColumns} rowKey='id' pagination={page} />
          </Card>
        </div>
        <Modal
          title={title}
          visible={storeVisible}
          centered
          width='750px'
          maskClosable={false}
          onCancel={this.handleClose.bind(this,'storeVisible')}
          footer={[
            <Button key='back' onClick={this.handleClose.bind(this,'storeVisible')}>
              返回
            </Button>,
          ]}
        >
          <StoreContent type={type} id={inId} />
        </Modal>

        {/* 新增物流信息模态框 */}
        {
          visible && 
          (
            <BatDiliverModal 
              visible={visible} 
              title={title} 
              onClose={this.handleClose} 
              dataObj={{'purchase_id':purchase_id,'id':id}}
              onLoad={this.getList}
            />
          )
        }
      </div>
    );
  }
}