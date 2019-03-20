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
  { label: '出入库权限', value: '出入库权限' },
  { label: '采购退换权限', value: '采购退换权限' },
  { label: '运营权限', value: '运营权限' },
  { label: '产品基础权限', value: '产品基础权限' },
  { label: '数据权限', value: '数据权限' },
  { label: '物流权限', value: '物流权限' },
  { label: '营销权限', value: '营销权限' },
  { label: '财务权限', value: '财务权限' },
  { label: '客服权限', value: '客服权限' },
];
class AddNewRoleRule extends React.Component {
  // state = {
  //   checkNick: false,
  // };
  check = () => {
    this.props.form.validateFields(err => {
      if (!err) {
        console.info('success');
      }
    });
  };
  // handleChange = (e) => {
  //   this.setState({
  //     checkNick: e.target.checked,
  //   }, () => {
  //     this.props.form.validateFields(['nickname'], { force: true });
  //   });
  // }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="tabs-form-wrapper">
        <div className="module-title"> 基本信息 </div>
        <FormItem {...formItemLayout} label="角色名称">
          {getFieldDecorator('username', {
            rules: [
              {
                required: true,
                message: '请输入你的角色名称',
              },
            ],
          })(<Input placeholder="" className="input-Width200" />)}
        </FormItem>
        <div className="module-title"> 权限分配 </div>
        <div className="form-content">
          <CheckboxGroup options={options} onChange={onChange} />
          <br />
          <br />
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
const AddRole = Form.create()(AddNewRoleRule);
export default AddRole;
