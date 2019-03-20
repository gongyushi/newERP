import React from 'react';
import {
  Modal,
  Form,
  Input,
} from 'antd';
import { erpPost } from '../../../services/ajax';
import Prompt from '../../../components/Prompt';

class AddForm extends React.Component {
  constructor(props) {
    super(props);
    const { params } = props;
    this.state = {
      supplierId: params.Get('supplier_id', 0),
    };
  };
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.supplier_id = this.state.supplierId;
        erpPost('supplier/payment/add', values, res=>{
          Prompt.success({ content: res.data.msg });
          if(res.data.code===200){
            this.handleCancel();
          }
        });
      }
    });
  };
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };
  render = () => {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    return(
      <Modal
        title="新增支付信息"
        visible
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        maskClosable={false}
      >
        <Form>
          <Form.Item {...formItemLayout} label="开户行">
            {getFieldDecorator('bank_name', {
              rules: [{
                required: true,
                message: '请正确填写开户行',
                whitespace: true,
              },
                {
                  pattern: /^([\u4E00-\u9FA5]|\w){4,100}$/,
                  message: '开户行不少于4个字符',
                },
              ],
            })(
              <Input placeholder="请输入" />
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="银行账号">
            {getFieldDecorator('bank_no', {
              rules: [{
                required: true,
                message: '请正确填写银行账号',
                whitespace: true,
              },
                {
                  pattern: /^[0-9a-zA-Z]{16,19}$/,
                  message: '请输入正确的银行卡号',
                },
              ],
            })(
              <Input placeholder="请输入" />
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="开户人姓名">
            {getFieldDecorator('account', {
              rules: [
                {
                  required: true,
                  message: '请正确填写开户人姓名',
                  whitespace: true,
                },
                {
                  pattern: /^([\u4E00-\u9FA5]|\w){2,30}$/,
                  message: '开户人姓名不少于2个字符',
                },
              ],
            })(
              <Input placeholder="请输入" />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  };
};

const Add = Form.create()(AddForm);
export default Add;
