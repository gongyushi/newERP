import React from 'react';
import {
  Form,
  Input,
  Button,
  // Checkbox,
  AutoComplete,
  Select,
  Radio,
  message,
} from 'antd';
import { erpPost } from '../../services/ajax';

require('../FormStyle.less');

const FormItem = Form.Item;
// const CheckboxGroup = Checkbox.Group;
const { Option } = AutoComplete;
const RadioGroup = Radio.Group;
// const {OptGroup} = AutoComplete;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 6 },
};
const formTailLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 6, offset: 4 },
};
// function onChange(checkedValues) {
//   console.log('checked = ', checkedValues);
// }

// function getRandomInt(max, min = 0) {
//   return Math.floor(Math.random() * (max - min + 1)) + min; // eslint-disable-line no-mixed-operators
// }

// function searchResult(query) {
//   return (new Array(getRandomInt(5))).join('.').split('.')
//     .map((item, idx) => ({
//       query,
//       category: `${query}${idx}`,
//       count: getRandomInt(200, 100),
//     }));
// }

class AddNewUserRule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perNoList: [],
      options: [],
      // checkNick: false,
      // dataSource: [],
    };
  }
  componentDidMount() {
    this.getPerNo(); // 获取员工编号
    if (this.props.userId !== 0) {
      this.getPerDetail(); // 获取子账户详情
    }
  }
  // 获取员工编号
  getPerNo = () => {
    erpPost('person/index', { per_no: '' }, res => {
      this.setState({
        perNoList: res.data.data,
      });
      this.getRole(); // 获取角色分配
    });
  };
  // 获取角色分配
  getRole = () => {
    erpPost('role/index', {}, res => {
      this.setState({
        options: res.data.data,
      });
    });
  };
  // 获取子账户详情
  getPerDetail = () => {
    console.log(this.props.userId);
    erpPost('user/view', { user_id: this.props.userId }, res => {
      this.props.form.setFieldsValue(res.data.data);
    });
  };
  // 保存
  check = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.props.userId === 0) {
          erpPost('user/add', values, res => {
            message.success(res.data.msg);
            this.props.onuser();
          });
        } else {
          [values.user_id] = [this.props.userId];
          erpPost('user/edit', values, res => {
            message.success(res.data.msg);
            this.props.onuser();
          });
        }
      }
    });
  };
  // 确认密码
  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  // // 员工编码查询
  // handleSearch = (value) => {
  //   this.setState({
  //     dataSource: value ? searchResult(value) : [],
  //   });
  // }
  render() {
    const { getFieldDecorator } = this.props.form;
    // const { dataSource } = this.state;
    return (
      <div className="tabs-form-wrapper">
        <div className="module-title"> 基本信息 </div>
        <FormItem {...formItemLayout} label="账号">
          {getFieldDecorator('username', {
            rules: [
              {
                required: true,
                message: '请输入你的账号',
              },
            ],
          })(<Input placeholder="" className="input-Width200" />)}
        </FormItem>
        {this.props.userId === 0 ? (
          <FormItem {...formItemLayout} label="密码">
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: '请输入密码!',
                },
                {
                  validator: this.validateToNextPassword,
                },
              ],
            })(<Input type="password" className="input-Width200" />)}
          </FormItem>
        ) : null}
        {this.props.userId === 0 ? (
          <FormItem {...formItemLayout} label="确认密码">
            {getFieldDecorator('confirm', {
              rules: [
                {
                  required: true,
                  message: 'Please confirm your password!',
                },
                {
                  validator: this.compareToFirstPassword,
                },
              ],
            })(
              <Input type="password" onBlur={this.handleConfirmBlur} className="input-Width200" />
            )}
          </FormItem>
        ) : null}
        <FormItem {...formItemLayout} label="员工编号" hasFeedback>
          {getFieldDecorator('person_id', {
            rules: [{ required: true, message: 'Please select your favourite colors!' }],
          })(
            <Select className="input-Width200" placeholder="Please select favourite colors">
              {this.state.perNoList.map(res => {
                return (
                  <Option key={res.person_id} value={res.person_id}>
                    {res.show_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <div className="module-title">角色分配 </div>
        <FormItem {...formItemLayout} label="角色分组">
          {getFieldDecorator('role_id')(
            <RadioGroup style={{ marginLeft: '200px' }}>
              {this.state.options.map(res => {
                return (
                  <Radio key={res.id} value={res.id}>
                    {res.role_name}
                  </Radio>
                );
              })}
            </RadioGroup>
          )}
        </FormItem>
        {/* <div className="privilegeInfo">
          {' '}
          <strong>权限：</strong>产品管理{' '}
        </div> */}
        <FormItem {...formTailLayout} style={{ marginLeft: '900px', marginTop: '50px' }}>
          <Button type="primary" onClick={this.check} style={{ marginRight: '20px' }}>
            保存
          </Button>
          <Button type="primary" onClick={this.check}>
            关闭
          </Button>
        </FormItem>
      </div>
    );
  }
}
const AddNewUser = Form.create()(AddNewUserRule);
export default AddNewUser;
