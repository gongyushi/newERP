import React from 'react';
import { Form, Input} from 'antd';

require('../appropriationPlan.less')

const FormItem = Form.Item;
const { TextArea } = Input;

class Demo extends React.Component {
  state = {
   
  }
 
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6  },
      wrapperCol: { span: 16 },
    };
    return (
      <div className='planAddLogistics'>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="物流编号">
            {getFieldDecorator('username', {
              rules: [{
                required: true,
                message: 'Please input your name',
              }],
            })(
              <Input placeholder="请输入" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="物流名称">
            {getFieldDecorator('username', {
              rules: [{
                required: true,
                message: 'Please input your name',
              }],
            })(
              <Input placeholder="请输入" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="联系人">
            {getFieldDecorator('username', {
              rules: [{
                required: true,
                message: 'Please input your name',
              }],
            })(
              <Input placeholder="请输入" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="协议客户">
            {getFieldDecorator('username', {
              rules: [{
                required: true,
                message: 'Please input your name',
              }],
            })(
              <Input placeholder="请输入" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="联系电话">
            {getFieldDecorator('username', {
              rules: [{
                required: true,
                message: 'Please input your name',
              }],
            })(
              <Input placeholder="请输入" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="发货地址"
            hasFeedback
          >
            {getFieldDecorator('remak', {
              rules: [
                { message: '请输入' },
              ],
            })(
              <TextArea
                autosize={{ minRows: 4, maxRows: 4 }}
              />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="退货地址"
            hasFeedback
          >
            {getFieldDecorator('remak', {
              rules: [
                { message: '请输入' },
              ],
            })(
              <TextArea
                autosize={{ minRows: 4, maxRows: 4 }}
              />
            )}
          </FormItem>
        </Form>
      </div>

    )
  }
}

const PlanAddLogistics = Form.create()(Demo);
export default PlanAddLogistics;