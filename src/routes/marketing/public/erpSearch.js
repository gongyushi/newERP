import React from 'react';
import { Select, Input, TreeSelect, Button, Form, Radio} from 'antd';
import { erpPost } from '../../../services/ajax';

require('../onlineProducts.less')

const { Option } = Select;
const FormItem = Form.Item;
const { TreeNode } = TreeSelect;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData:[],
      storeData: [],
      checkedStore:undefined,
    };
  }
  componentDidMount() {
    this.storeList();
  }


  // 店铺切换
  getStoreChange = (e) => {
    const {value} = e.target;
    if(value === 0){
      this.setState({
        checkedStore: undefined,
        treeData: [],
      });
      this.props.search({});
      this.props.form.setFieldsValue({
        category:null,
      });
      this.storeList();
    }else{
      const [id,marketplace] = String(value).split('-');
      this.setState({
        checkedStore: id,
      });
      this.props.form.setFieldsValue({
        category:null,
      });
      this.props.search({store_id:Number(id)});
      this.shopClassify(Number(marketplace));
    }
  }
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.store_id =this.state.checkedStore;
        this.props.search(values);
      }
    });
  }
  // 店铺列表
  storeList = () => {
    erpPost('store/has-permission-store', {}, res => {
      const { data } = res.data;
      this.setState({
        storeData: data,
      });
    });
  }
  // 商品分类
  shopClassify = (id) => {
    erpPost('listing-product-category/index', { marketplace: id }, res => {
      this.setState({
        treeData: res.data.data,
      });
    });
  }
  // 组织架构-结构
  renderTreeNodes = data => {
    return data&&data.map((item) => {
      return (
        <TreeNode
          title={item.name}
          value={item.id}
          key={item.id}
        >
          {item.children ? this.renderTreeNodes(item.children) : null}
        </TreeNode>
      );
    });
  };
  render() {
    const {storeData}=this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    return (
      <div>
        <div className='store'>
          <p>店铺:</p>
          {
            storeData.length > 0 && (
              <RadioGroup className='radio' onChange={this.getStoreChange} defaultValue={0}>
                <RadioButton value={0} key={0}>全部</RadioButton>
                {storeData.map(val => <RadioButton value={`${val.id}-${val.marketplace}`} key={`${val.id}-${val.marketplace}`}>{val.store_name}</RadioButton>)}
              </RadioGroup>
            )
          }
        </div>
        <Form style={{ overflow: 'hidden',margin:0 ,height:40}} className="login-form">
          <FormItem style={{ width: 150, float: 'left' }}>
            {getFieldDecorator('type',{
              initialValue: 'asin',
            })(
              <Select 
                placeholder="请选择筛选类型"
                showSearch
                optionFilterProp='children'
              >
                <Option value="asin">ASIN</Option>
                <Option value="seller_sku">SellerSKU</Option>
                <Option value="title">商品名称</Option>
              </Select>
            )}
          </FormItem>
          <FormItem style={{ width: 180, float: 'left', marginLeft: 10 }}>
            {getFieldDecorator('content')(
              <Input placeholder="请输入关键字" />
            )}
          </FormItem>
          <FormItem
            style={{ width: 300, float: 'left', marginRight: 10 }}
            {...formItemLayout}
            label="商品分类"
          >
            {getFieldDecorator('category')(
              <TreeSelect
                style={{ width: '100%' }}
                size='small'
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="请选择商品类型"
                treeDefaultExpandAll
                onChange={(value) => {
                  console.log(value)
                }}
              >
                {this.renderTreeNodes(this.state.treeData ? this.state.treeData : [])}
              </TreeSelect>
            )}
          </FormItem>
          <FormItem
            style={{ width: 180, float: 'left' }}
          >
            <Button size='small' type="primary" onClick={this.handleSubmit}>搜索</Button>
          </FormItem>

        </Form>
      </div>

    )
  }
}
const ErpSearch = Form.create()(Demo);
export default ErpSearch;
