import React from 'react';
import { Form, Select, Button, Input, Radio } from 'antd';
import { erpPost } from '../../../services/ajax';

require('../shoppingList.less')

const FormItem = Form.Item;
const { Option } = Select;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


class AppropriationPlans extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      warehouseList: [],
      supplierList:[],
      warehouse_id: null,
      supplier_id: null,
    }
  }
  componentDidMount() {
    this.warehouseList();
    this.supplierList();
  }

  // 仓库过滤
  onWareHouseId =  (e) => {
    const warehouse_id = e.target.value;
    const { supplier_id } = this.state;
    const values = {};
    if(supplier_id&&supplier_id!==null) {
      values.supplier_id = supplier_id;
    }
    if(warehouse_id&&warehouse_id!==null) {
      values.warehouse_id = warehouse_id;
    }
    this.setState({
      warehouse_id,      
    });
    this.props.search(values)
  }

  // 供应商过滤
  outSupplierId =  (e) => {
    const supplier_id = e.target.value;
    const { warehouse_id } = this.state;
    const values = {};
    if(supplier_id&&supplier_id!==null) {
      values.supplier_id = supplier_id;
    }
    if(warehouse_id&&warehouse_id!==null) {
      values.warehouse_id = warehouse_id;
    }
    this.setState({
      supplier_id,      
    });
    this.props.search(values)
  }

  // 获取仓库列表
  warehouseList = () => {
    erpPost('warehouse/index', {}, res => {
      const warehouseList = res.data.data;
      warehouseList.unshift({warehouse_name:'全部',warehouse_id:null});
      this.setState({
        warehouseList,
      })
    })
  }
  // 供应商列表
  supplierList=()=>{
    erpPost('supplier/index',{},res=>{
      const supplierList = res.data.data;
      supplierList.unshift({name:'全部',supplier_id:null});
      this.setState({
        supplierList: res.data.data,
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
    const { warehouseList, supplierList } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} layout='inline'>
        <div>
          {
            warehouseList.length !== 0 && (
              <FormItem label='调入仓库' className='button-radio'>
                {
                  getFieldDecorator('warehouse_id',{
                    initialValue: null,
                  })(
                    <RadioGroup  onChange={this.onWareHouseId}>
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
            supplierList.length !== 0 && (
              <FormItem label='供应商' className='button-radio'>
                {
                  getFieldDecorator('supplier_id',{
                    initialValue: null,
                  })(
                    <RadioGroup onChange={this.outSupplierId}>
                      {
                        supplierList.map(list =>
                          <RadioButton className='radio' key={list.supplier_id} value={list.supplier_id}>{list.name}</RadioButton>
                        )
                      }
                    </RadioGroup>
                  )
                }
              </FormItem>
            )
          }
        </div>
        <FormItem style={{ width: 150 }}>
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
          wrapperCol={{ span: 4 }}
        >
          <Button type="primary" size="small" htmlType="submit">搜索</Button>
        </FormItem>
      </Form>
    )
  }
}
const ShoppingListSearch = Form.create()(AppropriationPlans);
export default ShoppingListSearch;

