import React from 'react';
import {
  Modal,
  Form,
  Input,
} from 'antd';
import { erpPost } from '../../services/ajax';
import Prompt from '../../components/Prompt';
import styles from './add.less';

class EditAuthorizeForm extends React.Component {
  constructor(props) {
    super(props);
    const { detail } = props;
    this.state = {
      loading: false,
      detail: detail || {
        seller_id: '',
        access_key: '',
        secret_key: '',
        mws_token: '',
      },
    };
  };
  componentDidMount = () => {
    const { seller_id, access_key, secret_key, mws_token } = this.state.detail;
    this.props.form.setFieldsValue({
      seller_id,
      access_key,
      secret_key,
      mws_token,
    });
  };
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        erpPost('store/authorize-store', values, res=>{
          Prompt.success({ content: res.data.msg });
          this.setState({
            loading: false,
          });
          if(res.data.code===200){
            this.handleCancel();
          }
        }, ()=>{ this.setState({ loading: false }) });
      }
    });
  };
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };
  render = () => {
    const { getFieldDecorator } = this.props.form;
    const { loading }=this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    return(
      <Modal
        title="修改店铺"
        visible
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        confirmLoading={loading}
        maskClosable={false}
      >
        <Form className={styles.formList}>
          <div style={{borderBottom:'1px solid #dcdcdc'}}>
            <Form.Item {...formItemLayout} label="Seller ID">
              {getFieldDecorator('seller_id', {
                rules: [{
                  required: true,
                  message: '请输入Seller ID',
                }],
              })(
                <Input placeholder="请输入" disabled />
              )}
            </Form.Item>
            <Form.Item {...formItemLayout} label="Access Key ID">
              {getFieldDecorator('access_key', {
                rules: [{
                  required: true,
                  message: '请输入Access Key ID',
                }],
              })(
                <Input placeholder="请输入" />
              )}
            </Form.Item>
            <Form.Item {...formItemLayout} label="Secret Key">
              {getFieldDecorator('secret_key', {
                rules: [{
                  required: true,
                  message: '请输入Secret Key',
                }],
              })(
                <Input placeholder="请输入" />
              )}
            </Form.Item>
            <Form.Item {...formItemLayout} label="Mws Token">
              {getFieldDecorator('mws_token', {
                rules: [{
                  required: true,
                  message: '请输入Mws Token',
                }],
              })(
                <Input placeholder="请输入" />
              )}
            </Form.Item>
            <p style={{ color: '#1890ff' }}>如何配置？</p>
          </div>
        </Form>
      </Modal>
    );
  };
};

const EditAuthorize = Form.create()(EditAuthorizeForm);

export default EditAuthorize;
