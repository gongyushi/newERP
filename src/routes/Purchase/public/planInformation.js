import React from 'react';
import { Form, Input, Upload, Button, Icon } from 'antd';

require('../appropriationPlan.less')

const FormItem = Form.Item;

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
  // 文件上传
  normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  render() {

    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 16 },
    };
    return (
      <div className='planInformation'>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="运单号">
            {getFieldDecorator('username', {
              rules: [{
                required: true,
                message: 'Please input your name',
              }],
            })(
              <Input placeholder="Please input your name" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="运费">
            {getFieldDecorator('username', {
              rules: [{
                required: true,
                message: 'Please input your name',
              }],
            })(
              <Input placeholder="Please input your name" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="上传相关文件"
            extra="支持扩展名：.rar .zip .doc .docx .pdf .jpg..."
          >
            {getFieldDecorator('upload', {
              valuePropName: 'fileList',
              getValueFromEvent: this.normFile,
            })(
              <Upload name="logo" action="/upload.do" listType="picture">
                <Button>
                  <Icon type="upload" /> Click to upload
                </Button>
              </Upload>
            )}
          </FormItem>
        </Form>
      </div>

    )
  }
}

const PlanInformation = Form.create()(Demo);
export default PlanInformation;