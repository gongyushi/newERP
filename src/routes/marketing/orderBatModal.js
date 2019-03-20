import React from 'react';
import {
  Button,
  Modal,
  Icon,
  Table,
  message,
  InputNumber,
  Select,
} from 'antd';
import OrderSelectModal from './orderSelectModal';
import { erpPost } from '../../services/ajax';

const { Option } = Select;

require('./common.less');

class OrderBatModal extends React.Component {
  state = {
    visible: this.props.visible,
    modalVisible: false,
    modalTitle: '',
    loading: false,
    title: this.props.title,
    transformMsg: {},
    proList: this.props.proList || [],
    wareHouse: [],
    item: this.props.proList || [],
    currency: '',
    warehouse_id: null,
  };

  componentDidMount(){
    this.getWarehouseList();
    this.getCurrencyList();
  }

  componentWillReceiveProps(next) {
    this.setState({
      visible: next.visible,
      title: next.title,
    });
  }
  
  // 选择物流列表里的选择按钮
  onSubmit = ({ ...transformMsg }) => {
    this.setState({ transformMsg });
    this.getCurrencyList(transformMsg.shipping_price_currency_code);
  }
  
  // 获取货币单位
  getCurrencyList = (shipping_price_currency_code) => {
    erpPost('index/dictionary/index', {keyword:'currency'}, res => {
      this.setState({
        currency: res.data.data.children.filter(val => val.id === shipping_price_currency_code)[0].remark,
      });
    });
  }
  
  // 获取仓库列表
  getWarehouseList = () => {
    const { proList } = this.state;
    const product = [];
    proList.map(pro=>{
      if(pro.product&&pro.product.id){
        product.push(pro.product.id)
      }    
    })
    const product_id = product.join(',')
    erpPost('/warehouse/list-by-product',{product_id}, res => {
      this.setState({
        wareHouse: res.data.data,
      });
    });
  }

  // 移除操作
  handleRemove = (idx) => {
    const { proList, item } = this.state;
    proList.splice(idx,1);
    item.splice(idx,1);
    this.setState({
      proList,
      item,
    });
  }

  handleClose = (key) => {
    this.setState({
      [key]: false,
      loading: false,
    });
    if (key === 'visible' && this.props.onClose) {
      this.props.onClose('visible');
    }
  }

  handleOpenModal = () => {
    this.setState({
      modalVisible: true,
      modalTitle: '选择物流',
    });
  }

  handleSubmit = () => {
    const { warehouse_id, transformMsg, item } = this.state;
    const { order_id } = this.props;
    const items = [];
    for(let i = 0; i <item.length;i++){
      items.push({
        order_item_id:item[i]&&item[i].order_item_id,
        listing_id:item[i]&&item[i].listing_id,
        real_qualified_count:item[i]&&item[i].real_qualified_count,
      })
    }
    if(!transformMsg){
      message.warning('请选择物流然后提交');
      return;
    }
    delete transformMsg.logistics_company_name;
    console.log('transformMsg33',transformMsg)
    if(item.length === 0){
      message.warning('未发货不可提交',2);
      return;
    }
    for(const val of item){
      if(val.real_qualified_count === 0){
        message.warning('发货数量不能为0，请检查后再提交',2);
        return;
      }
    }
    this.setState({
      loading: true,
    });
    const order = {...transformMsg, warehouse_id, order_id };
    order.item = items;
    console.log('order',order)
    erpPost('/order/ship', order, () => {
      message.success('发货成功',2);
      if(this.props.onLoad()){
        this.props.onLoad();
      }
      this.handleClose('visible');
    },() => {
      message.error('提交失败，请重试',2);
      this.setState({
        loading: false,
      });
    });   
  }

  // 单元格编辑
  handleCellChange = (idx,record,value) => {
    const { item, proList } = this.state;
    item[idx] = {
      real_qualified_count:value,
      order_item_id:record.order_item_id,
      listing_id:record.listing_id,
    };
    proList[idx].real_qualified_count = value;
    proList[idx].product = record.product;
    proList[idx].outbound_quantity = record.outbound_quantity;
    proList[idx].ordered_count = record.ordered_count;
    console.log('333222',item[idx])
    this.setState({
      item, 
      proList,
    });
  }
  
  // 下拉选择框
  handleChange = (value) => {
    this.setState({
      warehouse_id:value,
    })
  }

  render() {
    const { visible, title, transformMsg, loading, modalTitle, modalVisible, proList, currency, wareHouse } = this.state;
    const proColumns1 = [
      {
        title: '商品信息',
        dataIndex: 'product',
        key: 'product',
        className: 'goods-message',
        render: (value) => (
          <div>
            <div style={{textAlign:'left'}}>
              ID: {value&&value.product_no}
            </div>
            <div style={{textAlign:'left'}}>
              SKU：{value&&value.product_sku}
            </div>
          </div>
        ),
      },
      {
        title: '售价',
        dataIndex: 'product',
        key: 'product',
        render: (value) => (
          <div>
            <div style={{textAlign:'left'}}>
              {value&&value.cost_currency_code&&currency[value.cost_currency_code]}   {value&&value.cost}
            </div>
          </div>
        ),
      },
      {
        title: '未配送数量（件）',
        dataIndex: 'outbound_quantity',
        key: 'outbound_quantity',
        render: (value, record) => (
          <div>
            {record&&record.ordered_count - value}
          </div>
        ),

      },
      {
        title: '发货数量（件）',
        dataIndex: 'real_qualified_count',
        key: 'real_qualified_count',
        render: (value,record,idx) => (
          <InputNumber 
            value={value} 
            style={{width: 100}}
            max={record&&(record.ordered_count - record.outbound_quantity)}
            min={0}
            onChange={this.handleCellChange.bind(this,idx,record)} 
          />
        ),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (value,record,index) => 
          <Button size='small' type='primary' ghost onClick={this.handleRemove.bind(this,index)}>移除</Button>,
      },
    ];

    return (
      <div>
        <Modal
          className='purchase'
          visible={visible}
          closable={false}
          title={(
            <div>
              <span style={{ opacity: 0.6 }}>{title}</span>
              <Icon
                type='close'
                style={{ fontSize: 30, opacity: 0.6, position: 'absolute', top: 5, right: 5, cursor: 'pointer' }}
                onClick={this.handleClose.bind(this, 'visible')}
              />
            </div>
          )}
          centered
          width='900px'
          maskClosable={false}
          footer={[
            <Button
              style={{ borderColor: '#00EC00', marginRight: 5 }}
              onClick={this.handleClose.bind(this, 'visible')}
            >
              关闭
            </Button>,
            <Button type='primary' loading={loading} onClick={this.handleSubmit}>
              发货
            </Button>,
          ]}
        >
          <div>   
            <div style={{marginBottom:5}}>
              发货仓库：
              <Select
                onChange={this.handleChange}
                placeholder='请选择发货仓库'
                style={{width:200}}
                showSearch
                optionFilterProp='children'
              >
                {
                  wareHouse.map(ware=>{
                    return <Option key={ware&&ware.id} value={ware&&ware.id}>{ware&&ware.warehouse_name}</Option>
                  })
                }
              </Select>
            </div>    
            <div style={{display:'flex', justifyContent:'flex-start', alignItems:'center',marginBottom:10}}>
              <div>
                <Button type='primary' onClick={this.handleOpenModal}>
                  选择物流
                </Button>
              </div>
              <div style={{marginLeft:50}}>
                <span>运单号：</span>
                {
                  transformMsg ? (
                    <span>
                      {transformMsg.fulfillment_no}{}
                    </span>
                  ) : (
                    <span>---</span>
                  )
                }
              </div>
              <div style={{marginLeft:50}}>
                <span>运费：</span>
                {
                  transformMsg ? (
                    <span>
                      {transformMsg.shipping_price}{currency}
                    </span>
                  ) : (
                    <span>---</span>
                  )
                }
              </div>
            </div>
            <Table dataSource={proList} columns={proColumns1} rowKey='id' pagination={false} />
          </div>
        </Modal>
        {
          modalVisible && 
          <OrderSelectModal title={modalTitle} visible={modalVisible} order_id={this.props.order_id}  onClose={this.handleClose} onSubmit={this.onSubmit} />
        }
      </div>
    );
  }
}

export default OrderBatModal;