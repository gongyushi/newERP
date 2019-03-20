import React from 'react';
import { Table, Row, Col, Icon, Button, message, Tabs, Popover } from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './orderDetail.less';
import EditableItem from '../../components/EditableItem';
import RelativeDocument from './relativeDocument';
import DeleteConfirmModal from '../../components/DeleteConfirm';
import OrderDetailModal from './orderDetailModal';
import OrderLogistic from './orderLogistic';
import ListingCell from '../../components/ListingCell';

require('../ListStyle.less');

const { TabPane } = Tabs;

class OrderDetail extends React.Component {
  constructor(props){
    super(props)
    this.state={
      orderDetail: {},
      orderList:[],
      operateList: [],
      visible: false,
      orderDetailId: '',
      currency:[],
    }
  }

  componentDidMount(){
    this.onOrderDetail()
    this.getCurrencyList()
  }

  componentWillReceiveProps(nextProps){
    console.log(nextProps)
  }
  
  // 获取订单详情  销售订单明细列表 订单操作日志列表  
  onOrderDetail = () => {
    const { order_id } = this.props;
    erpPost('/order/detail', {order_id}, res => {
      const { data } = res.data;
      this.setState({
        orderDetail:data,
      })      
    })
    erpPost('/order/item-list', {order_id}, res => {
      const { data } = res.data;
      this.setState({
        orderList:data,
      })      
    })
    erpPost('/order/log-list', {order_id}, res => {
      const { data } = res.data;
      this.setState({
        operateList:data,
      })      
    })
  }

  // 获取货币单位
  getCurrencyList = () => {
    erpPost('index/dictionary/lists', {keyword:'currency'}, res => {
      console.log(res.data.data.children,'3333')
      this.setState({
        currency: res.data.data.children,
      });
    });
  }

  // 编辑备注
  handleEditChange = (value) => {
    this.handleUpdate('remark',value);
  }

  handleUpdate = (type, content) => {
    const { order_id } = this.props;
    erpPost('/order/update',{order_id, type, content}, () => {
      message.success('修改成功',2);
      this.onOrderDetail()
    });
  }
  
  // 已全部发货按钮
  handleSendChange = () => {
    const value = 3;
    this.handleUpdate('status',value);
  }

  expandedRowRender = () => {
    const {operateList} = this.state;
    const column = [{
      title:'操作类型',
      dataIndex:'type',
      key:'type',
      width: 80,
    },{
      title:'操作人员',
      dataIndex:'person',
      key:'person',
      width: 80,
      render: (text, record) => {
        return record&&record.real_name
      },
    },{
      title:'操作时间(UTC)',
      dataIndex:'created_at',
      key:'created_at',
      width: 80,
    },{
      title:'内容',
      dataIndex:'content',
      key:'content',
      width: 380,
    }]
    return (
      <Table
        columns={column}
        dataSource={operateList}
        className='table-three-line'
      />
    )
  }
  
  // 打开订单详情
  openVisible = (id) => {
    this.setState({ 
      visible: true,
      orderDetailId: id,
    })
  }

  closeVisible = () => {
    this.setState({
      visible: false,
    })
  }

  renderOrderList = () => {
    const {orderList, currency} = this.state;
    const column = [{
      title:'商品信息',
      width: 380,
      render: (text, record) => {
        return (
          <ListingCell
            title={record.title}
            image_url={record.image_url}
            seller_sku={record.seller_sku}
            category={record.category}
            asin={record.asin}
          />
        )
      },
    },{
      title:'售价',
      dataIndex:'listing_price',
      key:'listing_price',
      width: 130,
      render: (value, record) => {
        return (<span>{record&&currency.filter(val => val.id === record.listing_price_currency_code)[0]&&currency.filter(val => val.id === record.listing_price_currency_code)[0].remark} {value}</span>)
      },
    },{
      title:'购买数量',
      dataIndex:'ordered_count',
      key:'ordered_count',
      width: 130,
    },{
      title:'未配送数量',
      width: 130,
      render: (text, record) => {
        return record.ordered_count - record.outbound_quantity;
      },
    },{
      title:'已配送数量',
      dataIndex:'outbound_quantity',
      key:'outbound_quantity',
      width: 130,
    },{
      title:'操作',
      dataIndex:'operation',
      key:'operation',
      width: 130,
      render: (value, record)=> {
        return (<Button type="primary" ghost onClick={() => this.openVisible(record.order_item_id)} >详情</Button>)
      },
    }]
    return (
      <Table
        columns={column}
        dataSource={orderList}
        pagination={false}
        className='table-one-line'
      />
    )
  }

  render(){
    const { orderDetail, visible, orderDetailId } = this.state;
    const type = {
      0:'Amazon',
    };
    const status = {
      0:'已生成',
      1:'已付款',
      2:'部分发货',
      3:'全部发货',
      4:'订单取消',
      5:'卖家自行发货',
    }
    const channel = {
      0:'卖家自行配送',
      1:'亚马逊配送',
    }
    return(
      <div className={styles.orderDetail}>
        <div className={styles.order1}>
          <div className={styles.number}>
            <Icon type="check-circle-o" />
            <span>订单编号：{orderDetail&&orderDetail.order_no}</span>
            <span style={{float:'right'}}>
              {(orderDetail&&orderDetail.status===3)||(orderDetail&&orderDetail.status===4)?null
              :(
                <DeleteConfirmModal content='确认该订单所有产品已发货' onOk={this.handleSendChange}>
                  <Button type="primary">已全部发货</Button>
                </DeleteConfirmModal>
              )}
            </span>
          </div>
          <Row className={styles.row} >
            <Col span={6}>下单时间：{orderDetail&&orderDetail.purchase_date}</Col>
            <Col span={6}>订单金额：{orderDetail&&orderDetail.total_amount}</Col>
            <Col span={6}>店铺名称：{orderDetail&&orderDetail.store&&orderDetail.store.store_name}</Col>
            <Col span={6}><span style={{float:'right'}} >状态：</span></Col>
          </Row>
          <Row className={styles.row} >
            <Col span={6}>收件人：{orderDetail&&orderDetail.shipping_name}</Col>
            <Col span={6}>订单类型：{orderDetail&&type[orderDetail.type]}</Col>
            <Col span={6}>配送方式：{orderDetail&&channel[orderDetail.fulfillment_channel]}</Col>
            <Col span={6}><span style={{float:'right', fontSize:20, color: 'black'}}>{orderDetail&&status[orderDetail.status]}</span></Col>
          </Row>
          <Row className={styles.row} >
            <Col span={12}>收货地址：{orderDetail&&orderDetail.shipping_address}</Col>
            <Col span={12}>未配送数量：{orderDetail&&orderDetail.un_ship_quantity}</Col>
          </Row>
          <Row className={styles.row} >
            <Col>
              <span style={{float:'left'}}><EditableItem width='200' value={orderDetail&&orderDetail.remark} onChange={this.handleEditChange} title='备注：' /></span>
            </Col>
          </Row>
        </div>
        <hr style={{marginTop:20}} />
        <Tabs defaultActiveKey='1'>
          <TabPane tab='基本信息' key='1'>
            <div className={styles.order2}>订单明细：</div>
            {this.renderOrderList()}
            <div className={styles.order3}>
              <div className={styles.number}><span>Amazon 扩展信息：</span></div>
              <Row className={styles.row}>
                <Col span={6}><div style={{marginLeft:12}}>订单状态：{orderDetail&&orderDetail.amazon_order&&orderDetail.amazon_order.order_status}</div></Col>
                <Col span={6}>订单类型：{orderDetail&&orderDetail.amazon_order&&orderDetail.amazon_order.order_type}</Col>
                <Col span={6}>已发货数量：{orderDetail&&orderDetail.amazon_order&&orderDetail.amazon_order.shipped_count}</Col>
                <Col span={6}>未发货数量：{orderDetail&&orderDetail.amazon_order&&orderDetail.amazon_order.unshipped_count}</Col>
              </Row>
              <Row className={styles.row} >
                <Col span={6}><div style={{marginLeft:12}}>买家姓名：{orderDetail&&orderDetail.amazon_order&&orderDetail.amazon_order.buyer_name}</div></Col>
                <Col span={6}>买家EMAIL：{orderDetail&&orderDetail.amazon_order&&orderDetail.amazon_order.buyer_email}</Col>
                <Col span={6}>收货国家代码：{orderDetail&&orderDetail.amazon_order&&orderDetail.amazon_order.shipping_country_code}</Col>
                <Col span={6}>收货城市：{orderDetail&&orderDetail.amazon_order&&orderDetail.amazon_order.shipping_city}</Col>
              </Row>
              <Row className={styles.row} >
                <Col span={6}><div style={{marginLeft:12}}>供货服务等级：{orderDetail&&orderDetail.amazon_order&&orderDetail.amazon_order.shipment_service_level_category}</div></Col>
                <Col span={18} />
              </Row>
            </div>
            <div className={styles.listb}>
              <div className={styles.listTitle}>操作日志：</div>
              <hr style={{marginTop:4}} />
              {this.expandedRowRender()}
            </div>
          </TabPane>
          <TabPane tab='物流' key='2'>
            <OrderLogistic  order_id={orderDetail&&orderDetail.id} />
          </TabPane>
          <TabPane tab='相关文档' key='3'>
            <RelativeDocument  order_id={orderDetail&&orderDetail.id} />
          </TabPane>
        </Tabs>
        {visible?<OrderDetailModal visible={visible} order_item_id={orderDetailId} closeVisible={this.closeVisible} />:null}
      </div>
    )
  }
}

export default OrderDetail;