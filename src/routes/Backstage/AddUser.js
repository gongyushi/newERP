import React from 'react';
import { Form, Input, Button, Checkbox } from 'antd';

require('../FormStyle.less');

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 6 },
};
const formTailLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 6, offset: 4 },
};
function onChange(checkedValues) {
  console.log('checked = ', checkedValues);
}

const options = [
  { label: '运营专员', value: '运营专员' },
  { label: '仓库专员', value: '仓库专员' },
  { label: '采购专员', value: '采购专员' },
  { label: '财务专员', value: '财务专员' },
  { label: '系统维护', value: '系统维护' },
  { label: '超级管理员', value: '超级管理员' },
];
class AddNewUserRule extends React.Component {
  state = {
    checkNick: false,
  };
  check = () => {
    this.props.form.validateFields(err => {
      if (!err) {
        console.info('success');
      }
    });
  };
  handleChange = e => {
    this.setState(
      {
        checkNick: e.target.checked,
      },
      () => {
        this.props.form.validateFields(['nickname'], { force: true });
      }
    );
  };
  render() {
    const { getFieldDecorator } = this.props.form;
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
        <FormItem {...formItemLayout} label="密码">
          {getFieldDecorator('username', {
            rules: [
              {
                required: true,
                message: '',
              },
            ],
          })(<Input placeholder="" className="input-Width200" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="确认密码">
          {getFieldDecorator('username', {
            rules: [
              {
                required: true,
                message: '',
              },
            ],
          })(<Input placeholder="" className="input-Width200" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="真实姓名">
          {getFieldDecorator('nickname', {
            rules: [
              {
                required: this.state.checkNick,
                message: '',
              },
            ],
          })(<Input placeholder="" className="input-Width200" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="联系方式">
          {getFieldDecorator('nickname', {
            rules: [
              {
                required: this.state.checkNick,
                message: '请输入你的联系方式',
              },
            ],
          })(<Input placeholder="" className="input-Width200" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="邮箱">
          {getFieldDecorator('nickname', {
            rules: [
              {
                required: this.state.checkNick,
                message: '请输入你的邮箱',
              },
            ],
          })(<Input placeholder="" className="input-Width200" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="微信">
          {getFieldDecorator('nickname', {
            rules: [
              {
                required: this.state.checkNick,
                message: '请输入你的微信',
              },
            ],
          })(<Input placeholder="" className="input-Width200" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="QQ">
          {getFieldDecorator('nickname', {
            rules: [
              {
                required: this.state.checkNick,
                message: '请输入你的QQ',
              },
            ],
          })(<Input placeholder="" className="input-Width200" />)}
        </FormItem>
        <div className="module-title"> 角色分配 </div>
        <div className="form-content">
          <CheckboxGroup options={options} onChange={onChange} />
        </div>

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
const AddUser = Form.create()(AddNewUserRule);
export default AddUser;
