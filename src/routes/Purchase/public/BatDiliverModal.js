import React from 'react';
import {
  Button,
  Modal,
  Icon,
  Table,
  Tooltip,
  message,
  InputNumber,
} from 'antd';
import BatSelectModal from './BatSelectModal';
import ProductCell from '../../../components/ProductCell';
import { erpPost } from '../../../services/ajax';
import Prompt from '../../../components/Prompt';

require('./common.less');

class BatDiliverModal extends React.Component {
  state = {
    visible: this.props.visible,
    modalVisible: false,
    modalTitle: '',
    loading: false,
    title: this.props.title,
    transformMsg: {},
    proList: [],
    proColumns: [],
    item: [], // 发货数据列表
    dataObj: this.props.dataObj,
    currency: '',
  };
  componentDidMount(){
    this.getList();
    this.getCurrencyList();
    this.initColumns();
  }
  componentWillReceiveProps(next) {
    this.setState({
      visible: next.visible,
      title: next.title,
    });
  }
  onSubmit = ({ ...transformMsg }) => {
    this.setState({ transformMsg });
    this.getCurrencyList(transformMsg.shipping_price_currency_code);
  }
  getCurrencyList = (shipping_price_currency_code) => {
    erpPost('index/dictionary/lists', {keyword:'currency'}, res => {
      this.setState({
        currency: res.data.data.children.filter(val => val.id === shipping_price_currency_code)[0].remark,
      });
    });
  }
  getList = () => {
    const { dataObj } = this.state;
    if(dataObj.requisition_id){
      erpPost('requisition/product-list',{...dataObj}, res => {
        this.setState({
          proList: res.data.data.map(val => this.handleData1({...val})),
          item: new Array(res.data.data.length),
        });
      });
    }else{
      erpPost('purchase-batch/item/index',{...dataObj}, res => {
        this.setState({
          proList: res.data.data.map(val => this.handleData2({...val})),
          item: new Array(res.data.data.length),
        });
      });
    }
  }
  handleData1 = ({ product,outbound_quantity,transfer_quantity,plan_quantity, ...data }) => {
    product.category_list = product.category_list.join('/');
    const inbound_quantity = outbound_quantity - transfer_quantity;
    let plan_qualified_count = plan_quantity - outbound_quantity;
    plan_qualified_count = plan_qualified_count >= 0 ? plan_qualified_count : 0;
    const real_qualified_count = 0;
    return ({...product, inbound_quantity, transfer_quantity, plan_qualified_count, real_qualified_count, ...data});
  }
  handleData2 = ({ batch_plan_quantity,sended_count, ...data }) => {
    batch_plan_quantity = batch_plan_quantity || 0;
    sended_count = sended_count || 0;
    let undeliver_count = batch_plan_quantity - sended_count;
    undeliver_count = undeliver_count >= 0 ? undeliver_count : 0;
    const send_quantity = 0;
    return ({ batch_plan_quantity,sended_count, send_quantity, undeliver_count, ...data});
  }
  initColumns = () => {
    const proColumns1 = [
      {
        title: '产品信息',
        dataIndex: 'id',
        key: 'id',
        width: 400,
        render: (value, record) => {
          return (
            <ProductCell
              product_no={record.product_no}
              title={record.title}
              image_url={record.image_url}
              product_sku={record.product_sku}
              category={record.category_name_arr}
            />
          )
        },
      },
      {
        title: '成本价',
        dataIndex: 'cost',
        key: 'cost',
        width: 100,
        render: value => value || 0,
      },
      {
        title: '未发货数量（件）',
        dataIndex: 'plan_qualified_count',
        key: 'plan_qualified_count',
        width: 100,
        render: value => value || 0,
      },
      {
        title: '发货数量（件）',
        dataIndex: 'real_qualified_count',
        key: 'real_qualified_count',
        width: 80,
        render: (value,record,idx) => (
          <InputNumber 
            value={value} 
            style={{width: 100}}
            max={record.plan_qualified_count}
            min={0}
            onChange={this.handleCellChange.bind(this,idx,record.id,record.product_id)} 
          />
        ),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 50,
        render: (value,record,index) => 
          <Button size='small' type='primary' ghost onClick={this.handleRemove.bind(this,index)}>移除</Button>,
      },
    ];
    const proColumns2 = [
      {
        title: '产品信息',
        dataIndex: 'id',
        key: 'id',
        width: 400,
        render: (value, record) => {
          return (
            <ProductCell
              product_no={record.product_no}
              title={record.title}
              image_url={record.image_url}
              product_sku={record.product_sku}
              category={record.category_name_arr}
            />
          )
        },
      },
      {
        title: '成本价',
        dataIndex: 'cost',
        key: 'cost',
        width: 100,
        render: value => value || 0,
      },
      {
        title: '未发货数量（件）',
        dataIndex: 'undeliver_count',
        key: 'undeliver_count',
        width: 100,
        render: value => value || 0,
      },
      {
        title: '发货数量（件）',
        dataIndex: 'send_quantity',
        key: 'send_quantity',
        width: 80,
        render: (value,record,idx) => (
          <InputNumber 
            value={value} 
            style={{width: 100}}
            max={record.undeliver_count}
            min={0}
            onChange={this.handleCellChange2.bind(this,idx,record.id)} 
          />
        ),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 50,
        render: (value,record,index) => 
          <Button size='small' type='primary' ghost onClick={this.handleRemove.bind(this,index)}>移除</Button>,
      },
    ];
    const { dataObj } = this.state;
    if(dataObj.requisition_id){
      this.setState({proColumns:proColumns1});
    }else{
      this.setState({proColumns:proColumns2});
    }
  }
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
    const { dataObj } = this.state;
    let { transformMsg, item } = this.state;
    if(!transformMsg){
      Prompt.warning({content:'请选择物流然后提交'});
      return;
    }
    transformMsg = {...transformMsg,...dataObj};
    transformMsg.logistics_company_name = undefined;
    item = item.filter(val => val);
    if(item.length === 0){
      Prompt.warning({content:'未发货不可提交'});
      return;
    }
    for(const val of item){
      if(dataObj.requisition_id){
        if(val.real_qualified_count === 0){
          Prompt.warning({content:'发货数量不能为0，请检查后再提交'});
          return;
        }
      }else if(val.send_quantity === 0){
        Prompt.warning({content:'发货数量不能为0，请检查后再提交'});
        return;
      }
    }
    this.setState({
      loading: true,
    });
    if(dataObj.requisition_id){
      erpPost('requisition/ship',{...transformMsg,item},() => {
        Prompt.success();
        if(this.props.onLoad()){
          this.props.onLoad();
        }
        this.handleClose('visible');
      },() => {
        // message.error('提交失败，请重试',2);
        this.setState({
          loading: false,
        });
      });
    }else{
      transformMsg.batch_id = dataObj.id;
      transformMsg.id = undefined;
      erpPost('purchase-batch/delivery',{...transformMsg,items:item},() => {
        Prompt.success();
        if(this.props.onLoad()){
          this.props.onLoad();
        }
        this.handleClose('visible');
      },() => {
        // message.error('提交失败，请重试',2);
        this.setState({
          loading: false,
        });
      });
    }
  }
  handleCellChange = (idx,requisition_item_id,product_id,real_qualified_count) => {
    const { item, proList } = this.state;
    item[idx] = {
      requisition_item_id,
      product_id,
      real_qualified_count,
    };
    proList[idx].real_qualified_count = real_qualified_count;
    this.setState({item, proList});
  }
  handleCellChange2 = (idx,item_id,send_quantity) => {
    const { item, proList } = this.state;
    item[idx] = {
      item_id,
      send_quantity,
    };
    proList[idx].send_quantity = send_quantity;
    this.setState({item, proList});
  }
  render() {
    const { visible, title, transformMsg, loading, modalTitle, modalVisible,dataObj, proList, proColumns, currency } = this.state;
    return (
      <div>
        <Modal
          className='purchase'
          visible={visible}
          closable={false}
          maskClosable={false}
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
          footer={[
            <Button
              style={{ borderColor: '#00EC00', marginRight: 5 }}
              onClick={this.handleClose.bind(this, 'visible')}
            >
              取消
            </Button>,
            <Button type='primary' loading={loading} onClick={this.handleSubmit}>
              确定
            </Button>,
          ]}
        >
          <div>
            {
              dataObj.requisition_id &&
              (
                <div style={{marginBottom:5}}>
                  发货仓库：{this.props.outStore}
                </div>
              )
           }
            <div style={{display:'flex', justifyContent:'flex-start', alignItems:'center',marginBottom:10}}>
              <div>
                <Button type='primary' onClick={this.handleOpenModal}>
                  选择物流
                </Button>
              </div>
              <div style={{marginLeft:50}}>
                <span>物流单位：</span>
                {
                  transformMsg ? (
                    <span>
                      {transformMsg.logistics_company_name}
                    </span>
                  ) : (
                    <span>---</span>
                  )
                }
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
            <Table dataSource={proList} className='table-four-line' columns={proColumns} rowKey='id' pagination={false} />
          </div>
        </Modal>
        {/* 选择物流模态框 */}
        {
          modalVisible && 
          <BatSelectModal title={modalTitle} visible={modalVisible} dataObj={dataObj}  onClose={this.handleClose} onSubmit={this.onSubmit} />
        }
      </div>
    );
  }
}

export default BatDiliverModal;