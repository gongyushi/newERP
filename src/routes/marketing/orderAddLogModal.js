import React from 'react';
import {
  Form,
  Button,
  Modal,
  Icon,
  Input,
  Select,
  message,
} from 'antd';
import { erpPost } from '../../services/ajax';

const FormItem = Form.Item;
const { Option } = Select;

class OrderAddLogModal extends React.Component {
  state = {
    visible: this.props.visible,
    title: this.props.title,
    loading: false,
  };

  componentWillReceiveProps(next){
    this.setState({
      visible: next.visible,
      title: next.title,
    });
  }

  handleClose = () => {
    this.setState({
      loading: false,
    });
    if(this.props.onClose){
      this.props.onClose('modalVisible');
    }
  }

  handleSubmit = () => {
    this.props.form.validateFields((err,values) => {
      if(!err){
        this.setState({
          loading: true,
        });
        erpPost('/logistics-company/add',{...values},() => {
          message.success('新增成功',2);
          this.handleClose();
          if(this.props.onInit){
            this.props.onInit();
          }
        },() => {
          message.error('新增失败，请检查',2);
          this.setState({
            loading: false,
          });
        });
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, title, loading } = this.state;
    const formItemLayout = {
      labelCol: { span :8 },
      wrapCol: {span: 16 },
    };
    return (
      <div>
        <Modal
          visible={visible}
          title={(
            <div>
              <span style={{ opacity: 0.6 }}>{title}</span>
              <Icon
                type='close'
                style={{ fontSize: 30, opacity: 0.6, position: 'absolute', top: 5, right: 5, cursor: 'pointer' }}
                onClick={this.handleClose}
              />
            </div>
          )}
          centered
          closable={false}
          maskClosable={false}
          width='400px'
          footer={[
            <Button
              style={{ borderColor: '#00EC00', marginRight: 5 }}
              onClick={this.handleClose}
            >
              取消
            </Button>,
            <Button type='primary' loading={loading} onClick={this.handleSubmit}>
              确定
            </Button>,
          ]}
        >
          <Form>
            <FormItem {...formItemLayout} label='物流编号' >
              {
                getFieldDecorator('logistics_company_no', {
                  rules: [
                    {
                      required: true,
                      message: '请填写物流编号',
                    },
                  ],
                })(
                  <Input style={{ width: 200 }} />
                )
              }
            </FormItem>
            <FormItem {...formItemLayout} label='物流名称' >
              {
                getFieldDecorator('logistics_company_name', {
                  rules: [
                    {
                      required: true,
                      message: '请填写物流名称',
                    },
                  ],
                })(
                  <Input style={{ width: 200 }} />
                )
              }
            </FormItem>
            <FormItem {...formItemLayout} label='联系人' >
              {
                getFieldDecorator('linkman', {
                  rules: [
                    {
                      required: true,
                      message: '请填写联系人',
                    },
                  ],
                })(
                  <Input style={{ width: 200 }} />
                )
              }
            </FormItem>
            <FormItem {...formItemLayout} label='联系电话' >
              {
                getFieldDecorator('phone', {
                  rules: [
                    {
                      required: true,
                      message: '请填写联系电话',
                    },
                    {
                      pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
                      message: '请检查号码格式',
                    },
                  ],
                })(
                  <Input
                    style={{ width: 200 }} 
                    addonBefore={
                      getFieldDecorator('phone_country_code',{
                        initialValue: '86',
                      })(
                        <Select
                          showSearch
                          optionFilterProp='children'
                        >
                          <Option value='86'>
                            +86
                          </Option>
                          <Option value='87'>
                            +87
                          </Option>
                        </Select>
                      )
                    }
                  />
                )
              }
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(OrderAddLogModal);