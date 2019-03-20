import React from 'react';
import { Form, Select, Button, Input, Radio } from 'antd';
import { erpPost } from '../../../services/ajax';

require('../appropriationPlan.less')
require('./common.less');

const FormItem = Form.Item;
const {Option} = Select;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class AppropriationPlans extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      warehouseList:[],
      outbound_warehouse_id: null,
      inbound_warehouse_id: null,
    }
  };
  componentDidMount(){
    this.warehouseList();
  }

  // 入仓库过滤
  onWareHouseId =  (e) => {
    const inbound_warehouse_id = e.target.value;
    const { outbound_warehouse_id } = this.state;
    const values = {};
    if(outbound_warehouse_id&&outbound_warehouse_id!==null) {
      values.outbound_warehouse_id = outbound_warehouse_id;
    }
    if(inbound_warehouse_id&&inbound_warehouse_id!==null) {
      values.inbound_warehouse_id = inbound_warehouse_id;
    }
    this.setState({
      outbound_warehouse_id,      
    });
    this.props.search(values)
  }

  // 出仓库过滤
  outWareHouseId =  (e) => {
    const outbound_warehouse_id = e.target.value;
    const { inbound_warehouse_id } = this.state;
    const values = {};
    if(outbound_warehouse_id&&outbound_warehouse_id!==null) {
      values.outbound_warehouse_id = outbound_warehouse_id;
    }
    if(inbound_warehouse_id&&inbound_warehouse_id!==null) {
      values.inbound_warehouse_id = inbound_warehouse_id;
    }
    this.setState({
      inbound_warehouse_id,      
    });
    this.props.search(values)
  }

  // 获取仓库列表
  warehouseList=()=>{
    erpPost('warehouse/index',{},res=>{
      const warehouseList = res.data.data;
      warehouseList.unshift({warehouse_name:'全部',warehouse_id:null});
      this.setState({
        warehouseList,
      })
    })
  }

  // 搜索提交
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.search(values)
      }
    });
  }
  
  
  render() {
    const { warehouseList}=this.state;
    const { getFieldDecorator } = this.props.form;
    
    return (
      <Form onSubmit={this.handleSubmit} layout='inline'>
        <div>
          {
            warehouseList.length !== 0 && (
              <FormItem label='调入仓库' className='button-radio'>
                {
                  getFieldDecorator('inbound_warehouse_id',{
                    initialValue: null,
                  })(
                    <RadioGroup onChange={this.onWareHouseId}>
                      {
                        warehouseList.map(list =>
                          <RadioButton className='radio' key={list.warehouse_id} value={list.warehouse_id}>{list.warehouse_name}</RadioButton>
                        )
                      }
                    </RadioGroup>
                  )
                }
              </FormItem>
            )
          }
        </div>
        <div>
          {
            warehouseList.length !== 0 && (
              <FormItem label='调出仓库' className='button-radio'>
                {
                  getFieldDecorator('outbound_warehouse_id',{
                    initialValue: null,
                  })(
                    <RadioGroup onChange={this.outWareHouseId}>
                      {
                        warehouseList.map(list =>
                          <RadioButton className='radio' key={list.warehouse_id} value={list.warehouse_id}>{list.warehouse_name}</RadioButton>
                        )
                      }
                    </RadioGroup>
                  )
                }
              </FormItem>
            )
          }
        </div>
        <FormItem style={{width:150}}>
          {getFieldDecorator('key',{
            initialValue: 'product_no',
          })(
            <Select style={{ width: 150 }} placeholder="请选择">
              <Option value="product_no">产品ID</Option>
              <Option value="title">产品名称</Option>
              <Option value="product_sku">SKU</Option>
            </Select>
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('value')(
            <Input style={{ width: '100%' }} placeholder="请输入搜索" />
          )}
        </FormItem>
        <FormItem
          wrapperCol={{ span:4}}
        >
          <Button type="primary" size="small" htmlType="submit">搜索</Button>
        </FormItem>
      </Form>
    )
  }
}
const AppropriationPlan = Form.create()(AppropriationPlans);
export default AppropriationPlan;

