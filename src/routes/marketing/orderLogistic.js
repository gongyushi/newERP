import React from 'react';
import {
  Divider,
  Modal,
  Button,
  Table,
} from 'antd';
import OrderStoreContent from './orderStoreContent';
import OrderBatModal from './orderBatModal';
import { erpPost } from '../../services/ajax';

export default class OrderLogistic extends React.Component{
  state = {
    logistList: [],
    page: {
      pageSize: 10,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
    storeVisible: false,
    visible: false,
    title: '', 
    type: '',
    id: '',
    proList: [],
    currency:[],
    signVisible: false,
    order_fulfillment_id: '',
  };

  componentDidMount(){
    this.onGetOrderLogistic();
    this.getList();
    this.getCurrencyList()
  }

  onGetOrderLogistic= () =>{
    const { order_id } = this.props;
    erpPost('/order/logistics-list', { order_id }, res => {
      const { data } = res.data;
      this.setState({
        logistList:data,
      })      
    })
  }
  
  // 签收模态框
  onSignOpen = (order_fulfillment_id) => {
    this.setState({
      signVisible: true,
      order_fulfillment_id,
    })
  }

  // 关闭模态框
  onSignClose = () => {
    this.setState({
      signVisible: false,
    })
  }

  // 签收
  onSignIn= () =>{
    const { order_id } = this.props;
    const { order_fulfillment_id } = this.state;
    erpPost('/order/logistics-sign', { order_id, order_fulfillment_id }, () => {
      this.onGetOrderLogistic()
      this.setState({
        signVisible: false,
      })    
    })
  }

  // 根据order_id获取产品列表
  getList = () => {
    const { order_id } = this.props;
    if(order_id){
      erpPost('/order/product-list',{order_id}, res => {
        this.setState({
          proList: res.data.data,
        });
      });
    }
  }

  // 获取货币单位
  getCurrencyList = () => {
    erpPost('index/dictionary/lists', {keyword:'currency'}, res => {
      this.setState({
        currency: res.data.data.children,
      });
    });
  }

  handleOpenModal = (value, type, title) => {
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
      title: '订单发货',
    });
  }

  handleClose = (key) => {
    this.setState({
      [key]: false,
    });
  }

  handleTableChange = (page) => {
    this.setState({page});
    this.onGetOrderLogistic();
  }
  
  render(){
    const { logistList, storeVisible, type, title, visible, page, id, proList, currency, signVisible} = this.state;
    const { order_id } = this.props;
    const status = {
      0: '配送中',
      1: '已签收',
    };
    const logistColumns = [
      {
        title: '运单号',
        dataIndex: 'fulfillment_no',
        key: 'fulfillment_no',
      },
      {
        title: '物流单位',
        dataIndex: 'logistics_company',
        key: 'logistics_company',
        render: (text) =>{
          return text&&text.logistics_company_name
        },
      },
      {
        title: '发货仓库',
        dataIndex: 'warehouse',
        key: 'warehouse',
        render: (text) =>{
          return text&&text.warehouse_name
        },
      },
      {
        title: '运费',
        dataIndex: 'shipping_price',
        key: 'shipping_price',
        render: (value,record) =>`${value} ${record.shipping_price_currency_code
          &&currency.filter(val => val.id === record.shipping_price_currency_code)[0]
          &&currency.filter(val => val.id === record.shipping_price_currency_code)[0].remark}`,
      },
      {
        title: '配送数量(件)',
        dataIndex: 'shipping_count',
        key: 'shipping_count',
      },
      {
        title: '发货时间',
        dataIndex: 'created_at',
        key: 'created_at',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          return status[text]
        },
      },
      {
        title: '签收时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        render: (text, record) => {
          return record.status===1?text:null
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (value, record) => {
          return <div>{record.status!==1?(<Button onClick={()=>this.onSignOpen(record.order_fulfillment_id)}>签收</Button>):null}</div>         
        },
      },
    ];
    
    return(
      <div>
        <div style={{display:'flex',justifyContent:'flex-start'}}>
          <Button type='primary' onClick={this.handleOpenDiliverModal}>
            发货
          </Button>
        </div>
        <Divider style={{margin:'10px 0px'}} />
        <Table 
          dataSource={logistList} 
          columns={logistColumns} 
          rowKey='id' 
          pagination={page} 
          onChange={this.handleTableChange}
        />

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
          <OrderStoreContent type={type} id={id}  />
        </Modal>
        <Modal
          title='提示'
          maskClosable={false}
          visible={signVisible}
          onCancel={this.onSignClose}
          onOk={this.onSignIn}
        >
          确定收件人已签收该货件？
        </Modal>
        {
          visible && 
          (
            <OrderBatModal
              visible={visible} 
              title={title}
              order_id={order_id} 
              onClose={this.handleClose} 
              proList={proList}
              onLoad={this.onGetOrderLogistic}
            />
          )
        }
      </div>
    );
  }
}