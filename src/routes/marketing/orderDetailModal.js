import React from 'react';
import { Modal, Row, Col, Button, Divider } from 'antd';
import { erpPost } from '../../services/ajax';

export default class OrderDetailModal extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      orderDetail: '',
      currency: [],
    }
  }
  componentDidMount() {
    this.getOrderDetail();
    this.getCurrencyList()
  }

  getOrderDetail = () =>{
    const {order_item_id} = this.props;
    erpPost('/order/order-item-detail', { order_item_id }, res => {
      this.setState({
        orderDetail: res.data.data,
      });
    });
  }

  // 获取货币单位
  getCurrencyList = () => {
    erpPost('index/dictionary/lists', {keyword:'currency'}, res => {
      this.setState({
        currency: res.data.data.children,
      });
    });
  }

  render(){
    const { closeVisible, visible} = this.props;
    const { orderDetail, currency } = this.state;
    return (
      <Modal 
        title="订单详情"
        visible={visible} 
        width={900}
        onCancel={closeVisible}
        maskClosable={false}
        footer={[
          <Button onClick={closeVisible}>
            关闭
          </Button>,
        ]}
      >
        <div>
          <div style={{fontSize:20, color:'black'}}>基本信息</div>
          <Divider />
          <div>
            <Row>
              <Col span={6}>
                <div style={{height:80}}><img src={orderDetail&&orderDetail.image_url} alt='' style={{width:80, height:70 }} /></div>
                <div style={{height:40}}>订单数量:{orderDetail&&orderDetail.ordered_count}</div>
              </Col>
              <Col span={18}>
                <div style={{height:40}}>
                  <Row>
                    <Col span={12}>SellerSku：{orderDetail&&orderDetail.seller_sku}</Col>
                    <Col span={12}>ASIN：{orderDetail&&orderDetail.asin}</Col>
                  </Row>
                </div>
                <div style={{height:40}}>商品名称：{orderDetail&&orderDetail.title}</div>
                <div style={{height:40}}>
                  <Row>
                    <Col span={12}>已配送数量：{orderDetail&&orderDetail.outbound_quantity}</Col>
                    <Col span={12}>未配送数量：{orderDetail&&(orderDetail.ordered_count-orderDetail.outbound_quantity)}</Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </div>
          <div style={{fontSize:20, color:'black'}}>扩展信息</div>
          <Divider />
          <div>
            <Row style={{height:40}}>
              <Col span={8}>
                礼品包装金额：
                {
                  orderDetail&&orderDetail.order_item_amazon
                  &&currency.filter(val => val.id === orderDetail.order_item_amazon.gift_warp_price_currency_code)[0]
                  &&currency.filter(val => val.id === orderDetail.order_item_amazon.gift_warp_price_currency_code)[0].remark
                }
                {
                  
                  orderDetail&&orderDetail.order_item_amazon&&orderDetail.order_item_amazon.gift_warp_price
                }
              </Col>
              <Col span={8}>
                礼品包装等级: {orderDetail&&orderDetail.order_item_amazon&&orderDetail.order_item_amazon.gift_warp_level}
              </Col>
              <Col span={8}>
                计划送货时间：{orderDetail&&orderDetail.order_item_amazon&&orderDetail.order_item_amazon.scheduled_delivery_start_date}
              </Col>
            </Row>
            <Row style={{height:40}}>
              <Col span={8}>
                货到付款金额：
                {
                  orderDetail&&orderDetail.order_item_amazon
                  &&currency.filter(val => val.id === orderDetail.order_item_amazon.cod_fee_currency_code)[0]
                  &&currency.filter(val => val.id === orderDetail.order_item_amazon.cod_fee_currency_code)[0].remark
                }
                {orderDetail&&orderDetail.order_item_amazon&&orderDetail.order_item_amazon.cod_fee}
              </Col>
              <Col span={8}>
                货到付款优惠：
                {
                  orderDetail&&orderDetail.order_item_amazon
                  &&currency.filter(val => val.id === orderDetail.order_item_amazon.cod_fee_discount_currency_code)[0]
                  &&currency.filter(val => val.id === orderDetail.order_item_amazon.cod_fee_discount_currency_code)[0].remark
                }
                {orderDetail&&orderDetail.order_item_amazon&&orderDetail.order_item_amazon.cod_fee_discount}
              </Col>
              <Col span={8} />
            </Row>
          </div>
        </div>
      </Modal>
    )
  }
}
