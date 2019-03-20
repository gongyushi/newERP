import React from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
} from 'antd';
import { erpPost } from '../../services/ajax';
import Prompt from '../../components/Prompt';

const {Option} = Select;

class AddForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  };
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.phone = Number(values.phone)

        erpPost('supplier/add', values, (res)=>{
          Prompt.success({ content: res.data.msg });
          this.handleCancel();
        })
      }
    });
  };
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };
  renderPhonePerfix = (fieldDecorator, fieldName) => {
    return fieldDecorator(fieldName, {
      initialValue: '86',
    })(
      <Select style={{ width: 70 }}>
        <Option value="86">+86</Option>
      </Select>
    );
  };
  render = () => {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    return(
      <Modal
        title="新增供应商"
        visible
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        maskClosable={false}
      >
        <Form>
          <Form.Item {...formItemLayout} label="供应商编号">
            {getFieldDecorator('supplier_no', {
              rules: [{
                required: true,
                message: '请输入供应商编号',
              }],
            })(
              <Input placeholder="请输入" />
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="供应商名称">
            {getFieldDecorator('name', {
              rules: [{
                required: true,
                message: '请输入供应商名称',
              }],
            })(
              <Input placeholder="请输入" />
            )}
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="供应商类型"
            hasFeedback
          >
            {getFieldDecorator('type', {
              rules: [
                { required: true, message: '请选择供应商类型!' },
              ],
            })(
              <Select className='width180' placeholder="请选择">
                <Option value="0">1688供应商</Option>
                <Option value="1">普通供应商</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="联系人">
            {getFieldDecorator('contact')(
              <Input placeholder="请输入" />
            )}
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="联系电话"
          >
            {getFieldDecorator('phone',{
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
            })(
              <Input addonBefore={this.renderPhonePerfix(getFieldDecorator, 'phone_country_code')} />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  };
};

const Add = Form.create()(AddForm);
export default Add;
