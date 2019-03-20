import React from 'react';
import moment from 'moment';
import {
  Form,
  Input,
  Radio,
  DatePicker,
  Select,
  Row,
  InputNumber,
  Col,
  Cascader,
  Button,
  TreeSelect,
  message,
  Icon,
} from 'antd';
import { connect } from 'dva';
import { erpPost } from '../../services/ajax';
import { qqVerify, phoneVerify, emailVerify, basicsVerify} from '../../utils/regular';

require('../ZuZiStyle.less');

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { Option } = Select;
const {TreeNode} = TreeSelect;

let count = 1;

class Demo extends React.Component {
  state = {
    supplierId: this.props.id,
    // value: 3,
    residences: [],
    roleList:[],
    treeData:[],
    org_role: [],  // 组织信息
    showPwd: false, // 是否显示密码
    dialCodeList: [], // 电话号码前缀
  };
  componentDidMount(){
    // this.props.form.setFieldsValue(this.state.detailData);
    this.personDetailFun(this.state.supplierId);
    this.getAddress();
    this.getRole();
    this.getOrganization();
    this.getDialCodeList();
  }
  // 获取国际电话号码前缀
  getDialCodeList = () => {
    erpPost('index/dictionary/lists',{keyword: 'DialCode'},res => {
      this.setState({
        dialCodeList: res.data.data.children,
      });
    });
  }
  // 获取地址
  getAddress = () => {
    erpPost('index/area/lists',{},res => {
      this.setState({
        residences: res.data.data,
      });
    });
  }
  // 获取角色列表
  getRole = () => {
    erpPost('role/index',{},res => {
      this.setState({
        roleList: res.data.data,
      });
    });
  }
  // 获取组织架构
  getOrganization=()=>{
    erpPost('organization/lists',{},res => {
      this.setState({
        treeData: res.data.data,
      });
    });
  }
  handleData = ({enable,sex,married,birthdate,entry_date,education,graduate_date,
    buyer,type,pay_method,skill,...data}) => {
      enable = Number(enable);
      sex = Number(sex);
      married = Number(married);
      birthdate = birthdate ? moment(birthdate, 'YYYY/MM/DD') : null;
      entry_date = entry_date ? moment(entry_date, 'YYYY/MM/DD') : null;
      graduate_date = graduate_date ? moment(graduate_date, 'YYYY/MM/DD') : null;
      education = Number(education);
      return({enable,sex,married,birthdate,entry_date,education,graduate_date,...data});
  }
  // 员工详情
  personDetailFun=(id)=>{
    if(id){
      erpPost('organization/person/detail', { person_id: id},res=>{
        const list = this.handleData({...res.data.data});
        this.setState({
          org_role: list.org_role,
        });
        const keys = [];
        for( let i = 0; i < list.org_role.length; i ++ ){
          keys.push(i);
        }
        this.props.form.setFieldsValue({...list});
        this.props.form.getFieldDecorator('keys', { initialValue: keys });
      });
    }else{
      this.props.form.getFieldDecorator('keys', { initialValue: [0] });
    }
  }
  
  // 组织信息-数组删除
  handleRemoveItem = (key) => {
    const { form } = this.props;
    let keys = form.getFieldValue('keys');
    if(keys.length === 1){
      return;
    }else{
      keys = keys.filter(val => val !== key);
    }
    form.setFieldsValue({
      keys,
    });
  }
  handleAddItem = () => {
    const { form } = this.props;
    if( count === 0 ){
      count = this.state.org_role.length;
    }
    const keys = form.getFieldValue('keys');
    const nextkeys = keys.concat(count);
    count ++;
    form.setFieldsValue({
      keys: nextkeys,
    });
  }

  // 保存提交
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.area){
          values.country_id = values.area[0];
          values.province_id = values.area[1];
          values.city_id = values.area[2];
          values.area_id = values.area[3];
        }else{
          values.country_id = '';
          values.province_id ='';
          values.city_id = '';
          values.area_id = '';
        }
        if (values.current_area){
          values.current_country_id = values.current_area[0]
          values.current_province_id = values.current_area[1]
          values.current_city_id = values.current_area[2]
          values.current_area_id = values.current_area[3]
        }else{
          values.current_country_id = '';
          values.current_province_id = '';
          values.current_city_id = '';
          values.current_area_id = '';
        }
        delete values.area;
        delete values.current_area;
        if (this.state.supplierId) {
          values.person_id = this.state.supplierId;
          erpPost('organization/person/edit', values, res => {
            message.success(res.data.msg);
            this.props.handleCancel(this.props.activeKey);
          });
        } else {
          erpPost('organization/person/add', values, res => {
            message.success(res.data.msg);
            this.props.handleCancel(this.props.activeKey);
          });
        }
      }
    });
  };
  
  handleHidePwd = () => {
    this.setState({
      showPwd: false,
    });
  }
  handleShowPwd = () => {
    this.setState({
      showPwd: true,
    });
  }
  // 组织架构-结构
  renderTreeNodes = data => {
    return data.map((item) => {
      return (
        <TreeNode
          title={`${item.org_name} ${item.id}`}
          value={item.id}
          key={item.enter_no ? item.enter_no : item.org_no}
        >
          {item.children ? this.renderTreeNodes(item.children) : null}
        </TreeNode>
      );
    });
  };
  render() {
    const { residences, roleList, treeData, org_role, showPwd, dialCodeList } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { handleCancel, activeKey } = this.props;
    const keys = getFieldValue('keys');
    const prefixSelector = getFieldDecorator('phone_country_code', {
      initialValue: '86',
    })(
      <Select
        showSearch
        optionFilterProp='children'
        style={{width:80}}
      >
        {
          dialCodeList.map(val => <Option key={val.id} value={val.id}>{val.remark}</Option>)
        }
      </Select>
    );
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const formItemLayouts = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    return (
      <div className="contentWrap organizationDetail">
        <Form className="ant-advanced-search-form">
          <h3
            style={{ borderBottom: '1px solid #dcdcdc', paddingBottom: 20}}
          >
          账户信息
          </h3>
          <div
            style={{
              overflow: 'hidden',
              margin:'0 auto',
              width:800,
            }}
          >
            <FormItem style={{display:'none'}}>
              {getFieldDecorator('keys', {})}
            </FormItem>
            <FormItem {...formItemLayout} label="账户名">
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: '请输入账号！',
                  },
                ],
              })(<Input placeholder="请输入账号!" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="密码">
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: this.props.id === 0,
                    message: '请输入密码',
                  },
                ],
              })(
                <div>
                  {
                    this.props.id === 0 ? (
                      <Input type='password' placeholder="请输入密码！" style={{ width: 150 }} />
                    ) : (
                      <div>
                        {
                          showPwd ? (
                            <div>
                              <Input type='password' placeholder="请输入密码！" style={{ width: 150 }} />
                              <Button type='primary' size='small' ghost onClick={this.handleHidePwd} style={{marginLeft:5}}>
                                取消
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <span>***************</span>
                              <Button type='primary' size='small' ghost onClick={this.handleShowPwd} style={{marginLeft:5}}>
                                修改密码
                              </Button>
                            </div>
                          )
                        }
                      </div>
                    )
                  }
                </div>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="姓名">
              {getFieldDecorator('real_name', {
                rules: [
                  {
                    required: true,
                    message: '请输入姓名！',
                  },
                ],
              })(<Input placeholder="请输入姓名！" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="员工编号">
              {getFieldDecorator('per_no')(<Input placeholder="请输入员工编号!" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="联系电话">
              {getFieldDecorator('phone', {
                rules: [
                  { 
                    required: true, 
                    message: '请输入手机号码',
                  },
                  {
                    pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
                    message: '请检查号码格式',
                  },
                ],
              })(<Input addonBefore={prefixSelector} placeholder="请输入联系电话！" style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="Email">
              {getFieldDecorator('email', {
                rules: [
                  {
                    type: 'email',
                    message: '请输入检查邮箱格式',
                  },
                  {
                    required: true,
                    message: '请输入邮箱',
                  },
                ],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="微信">
              {getFieldDecorator('wechat', {})(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="QQ">
              {getFieldDecorator('qq', {
                rules: [
                  {
                    message: '请填写联系人QQ!',
                    pattern: new RegExp(/^[1-9][0-9]{4,14}$/, "g"),
                  },
                ],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="账户状态"
            >
              {getFieldDecorator('enable', {
                initialValue:0,
                rules: [
                  { required: true, message: '请选择状态' },
                ],
              })(
                <Select style={{ width: 200 }} placeholder="请选择启用禁用">
                  <Option value={0}>启用</Option>
                  <Option value={1}>禁用</Option>
                </Select>
              )}
            </FormItem>
          </div>
          {/* <h3 style={{ borderBottom: '1px solid #dcdcdc', paddingBottom: 20 }}>角色信息</h3> */}
          {/* 暂存 */}
          <div
            style={{
              borderBottom: '1px solid #dcdcdc',
              marginBottom: 20,
              padding: '20px 0',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{border:0}}>角色信息</h3>
           
            <div>
              <Button
                type="primary"
                onClick={this.handleAddItem}
              >
                新增角色
              </Button>
            </div>
          </div>
          <ul
            style={{
              // overflow: 'hidden',
              margin: '0 auto',
              padding:0,
              width: 800,
            }}
          >
            {keys && keys.map((k) => {

              return (
                <li style={{ overflow: 'hidden',height:60 }}>
                  <FormItem {...formItemLayout} label="所属组织">
                    {getFieldDecorator(`org_role[${k}]org_id`, {
                      initialValue: k >= org_role.length ? null : org_role[k].org_id,
                      rules: [
                        {
                          required: true,
                          message: '请选择组织',
                        },
                      ],
                    })(
                      <TreeSelect
                        style={{ width: 200 }}
                        value={[1]}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        // fieldNames={{ label: 'org_name', value: 'id' }}
                        placeholder="请选择组织"
                        treeDefaultExpandAll
                        onChange={(value) => {
                          console.log(value)
                        }}
                      >
                        {this.renderTreeNodes(treeData)}
                      </TreeSelect>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="角色名称">
                    {getFieldDecorator(`org_role[${k}]roles`, {
                      initialValue: k >= org_role.length ? [] : org_role[k].roles,
                      rules: [
                        {
                          required: true,
                          message: '请选择角色名称',
                        },
                      ],
                    })(
                      <Select
                        mode="multiple"
                        placeholder='请选择角色名称'
                      >
                        {roleList.map((value) => {
                          return <Option value={value.id}>{value.role_name}</Option>
                        })}
                      </Select>
                    )}
                  </FormItem>
                  {/* 暂存 */}
                  <Icon
                    style={{ color: 'red', marginTop: 10, marginLeft:10, fontSize:20, cursor: 'pointer' }}
                    type="minus-circle"
                    onClick={this.handleRemoveItem.bind(this, k)}
                  />
                </li>
              )
            })}

          </ul>
          <h3
            style={{ borderBottom: '1px solid #dcdcdc', paddingBottom: 20 }}
          >
          详细信息
          </h3>
          <div 
            style={{ 
              overflow: 'hidden',
              margin: '0 auto',
              width: 800, 
            }}
              
          >
            <FormItem {...formItemLayout} label="性别">
              {getFieldDecorator('sex', {
                initialValue: 0,
              })(
                <RadioGroup>
                  <Radio value={0}>男</Radio>
                  <Radio value={1}>女</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="婚姻状况">
              {getFieldDecorator('married', {
                initialValue: 0,
              })(
                <RadioGroup>
                  <Radio value={0}>未婚</Radio>
                  <Radio value={1}>已婚</Radio>
                  <Radio value={2}>离异</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="出生年月日">
              {getFieldDecorator('birthdate')(
                // <DatePicker />
                <DatePicker style={{width:200}} /> 
                // <span>{value}</span>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="入职日期">
              {getFieldDecorator('entry_date')(
                <DatePicker style={{ width: 200 }} />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="社保账号">
              {getFieldDecorator('social_security_no', {
                // rules: [
                //   {
                //     validator: basicsVerify,
                //   },
                // ],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="公积金账号">
              {getFieldDecorator('house_fund_no', {
                // rules: [
                //   {
                //     validator: basicsVerify,
                //   },
                // ],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="个人所得税">
              {getFieldDecorator('tax_no', {
                // rules: [
                //   {
                //     validator: basicsVerify,
                //   },
                // ],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="工资卡号">
              {getFieldDecorator('salary_bank_no', {
                // rules: [
                //   {
                //     validator: basicsVerify,
                //   },
                // ],
              })(<Input style={{ width:200}} />)}
            </FormItem>
          </div>
          <div 
            style={{ 
              overflow: 'hidden', 
              margin: '0 auto',
              width: 800,
            }}
          >
            <FormItem style={{ width: 700 }} {...formItemLayouts} label="户籍地址">
              <Row gutter={8}>
                <Col span={10}>
                  {getFieldDecorator('area')(<Cascader placeholder="请选择地址" fieldNames={{ label: 'area_name', value: 'id' }} style={{ width: 200 }} options={residences} />)}
                </Col>
                <Col span={12}>
                  {getFieldDecorator('permannet_address')(<Input style={{ width: '100%', left: 10 }} />)}
                </Col>
              </Row>
            </FormItem>
          </div>
          <div 
            style={{ 
              overflow: 'hidden',
              margin: '0 auto',
              width: 800,
            }}
          >
            <FormItem style={{ width: 700 }} {...formItemLayouts} label="现住地址">
              <Row gutter={8}>
                <Col span={10}>
                  {getFieldDecorator('current_area')(<Cascader placeholder="请选择地址" fieldNames={{ label: 'area_name', value: 'id' }} style={{ width: 200 }} options={residences} />)}
                </Col>
                <Col span={12}>
                  {getFieldDecorator('address')(<Input style={{ width: '100%', left: 10 }} />)}
                </Col>
              </Row>
            </FormItem>
          </div>
          <h3
            style={{ borderBottom: '1px solid #dcdcdc', paddingBottom: 20 }}
          >
          文化程度
          </h3>
          <div 
            style={{ 
              overflow: 'hidden',
              margin: '0 auto',
              width: 800,
            }}
          >
            <FormItem 
              style={{ width: 700 }} 
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }} 
              label="学历"
            >
              {getFieldDecorator('education', {
                initialValue:4,
              })(
                <RadioGroup>
                  <Radio value={0}>小学</Radio>
                  <Radio value={1}>初中</Radio>
                  <Radio value={2}>中专/高中</Radio>
                  <Radio value={3}>专科</Radio>
                  <Radio value={4}>本科</Radio>
                  <Radio value={5}>研究生</Radio>
                  <Radio value={6}>硕士</Radio>
                  <Radio value={7}>博士</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </div>
          <div
            style={{
              overflow: 'hidden',
              margin: '0 auto',
              width: 800,
            }}
          >
            <FormItem {...formItemLayout} label="毕业学校">
              {getFieldDecorator('graduate_school')(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="学制">
              {getFieldDecorator('years_of_school')(<InputNumber min={1} max={10} style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="专业">
              {getFieldDecorator('major')(<Input style={{ width: 200 }} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="毕业日期">
              {getFieldDecorator('graduate_date')(
                <DatePicker style={{ width: 200 }} /> )}
            </FormItem>

          </div>
          <div
            style={{width:500,margin:'50px auto'}}
          >
            <Button
              style={{ marginRight:50}}
              type="primary"
              onClick={() => handleCancel(activeKey)}
            >
              取消
            </Button>
            <Button
              // style={{ float: 'right', right: 150 }}
              type="primary"
              onClick={this.handleSubmit}
            >
              保存
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}
// const organizationDetail = Form.create()(Demo);
export default Form.create()(Demo);
