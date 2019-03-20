import React from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
} from 'antd';
import { erpPost } from '../../../services/ajax';
import Prompt from '../../../components/Prompt';

class EditForm extends React.Component {
  constructor(props) {
    super(props);
    const { detail, params } = props;
    this.state = {
      supplierId: params.Get('supplier_id', 0),
      detail: detail || {
        id: 0,
        product_no: "",
        cost: "0.00",
      },
    };
  };
  componentDidMount = () => {
    const { product_no, cost } = this.state.detail;
    this.props.form.setFieldsValue({
      product_no,
      cost,
    });
  };
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { supplierId, detail } = this.state;
        values.supplier_id = supplierId;

        let url = 'supplier/product/add';
        if(this.props.editMode){
          url = 'supplier/product/edit';
          values.product_supplier_id = detail.id;
        }

        erpPost(url, values, res=>{
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
    const { editMode } = this.props;
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    return(
      <Modal
        title={editMode !== true ? '新增供应产品' : '编辑供应产品'}
        visible
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        maskClosable={false}
      >
        <Form>
          <Form.Item {...formItemLayout} label="产品ID">
            {getFieldDecorator('product_no', {
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入正确的产品ID',
              }],
            })(
              <Input placeholder="请输入" />
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="单价(CNY)">
            {getFieldDecorator('cost')(
              <InputNumber
                step={0.01}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\s?|(,*)/g, '')}
                placeholder="请输入"
                style={{ width: '150px' }}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  };
};

const Edit = Form.create()(EditForm);
export default Edit;
