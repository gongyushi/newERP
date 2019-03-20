import React from 'react';
import {Modal, Form, Input} from 'antd';

const FormItem = Form.Item;

@Form.create()
class ProductImag extends React.Component {
  onChange = () => {
    const {onAddImag} = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      console.log('values',values)
      if(values){
        onAddImag(values.imge_url);
      }      
    })
  }
  render() {
    const { visible, onImgCancle }=this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    return (
      <Modal
        title='添加图片'
        visible={visible}
        onOk={this.onChange}
        onCancel={onImgCancle}
        maskClosable={false}
      >
        <Form>
          <FormItem  {...formItemLayout} label='图片URL'>
            {getFieldDecorator('imge_url')(<Input placeholder='请输入图片的URL地址' />)}
          </FormItem>
        </Form>
        <p style={{marginLeft:15}}>您可以先在amazon上上传图片，然后将图片地址复制于此</p>
      </Modal>
    )
  }
}
export default ProductImag;