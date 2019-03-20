import React from 'react';
import { Form, Select, Button, Input } from 'antd';
import { erpPost } from '../../../services/ajax';

require('../organization.less')

const FormItem = Form.Item;
const { Option } = Select;

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      roleList:[],
    }
  }
  componentDidMount(){
    this.roleList();
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
  // 角色列表
  roleList=()=>{
    erpPost('role/index',{},res=>{
      this.setState({
        roleList:res.data.data,
      })
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { roleList}=this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    return (
      <Form className='organzitionSearch' onSubmit={this.handleSubmit}>
        <FormItem style={{width:100}}>
          {getFieldDecorator('key',{
            initialValue: 'per_no',
          })(
            <Select 
              style={{ width: '100%' }} 
              placeholder="请选择"
              showSearch
              optionFilterProp='children'
              defaultActiveFirstOption
            >
              <Option value="per_no">员工编号</Option>
              <Option value="username">用户名</Option>
              <Option value="real_name">姓名</Option>
              <Option value="phone">联系电话</Option>
            </Select>
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('value')(
            <Input style={{ width: '100%' }} placeholder="请输入搜索" />
          )}
        </FormItem>
        <FormItem 
          {...formItemLayout}
          label="账户状态"
          style={{ width: 200 }}
        >
          {getFieldDecorator('enable',{
            initialValue:'0',
          })(
            <Select 
              style={{ width: '100%' }} 
              placeholder="请选择"
              showSearch
              optionFilterProp='children'
            >
              {/* <Option value="">全部</Option> */}
              <Option value="0">启用</Option>
              <Option value="1">禁用</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="角色"
          style={{ width: 200 }}
        >
          {getFieldDecorator('role_id')(
            <Select 
              style={{ width: '100%' }} 
              placeholder="请选择"
              showSearch
              optionFilterProp='children'
              defaultActiveFirstOption
            >
              {roleList&&roleList.map(val=>{
                return(
                  <Option key={val.id} value={val.id}>{val.role_name}</Option>
                )
              })}
              
            </Select>
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
const Search = Form.create()(Demo);
export default Search;

