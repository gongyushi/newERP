import React from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  TreeSelect,
} from 'antd';
import { erpPost } from '../../services/ajax';
import Prompt from '../../components/Prompt';
import styles from './add.less';

const {Option} = Select;
const { TreeNode } = TreeSelect;

class EditForm extends React.Component {
  constructor(props) {
    super(props);
    const { detail } = props;
    this.state = {
      loading: false,
      detail: detail || {
        store_id: 0,
        store_no: '',
        store_name: '',
        enable: '',
        org_id: 0,
        warehouse_id: 0,
      },
    };
  };
  componentDidMount = () => {
    const { store_no, store_name, enable, org_id, warehouse_id } = this.state.detail;
    this.props.form.setFieldsValue({
      store_no,
      store_name,
      enable: String(enable),
      org_id,
      warehouse_id: Number(warehouse_id),
    });
  };
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { detail } = this.state;
        values.store_id = detail.store_id;

        this.setState({ loading: true });
        erpPost('store/update', values, res=>{
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
  renderTreeNodes = data => {
    return data.map((item) => {
      return (
        <TreeNode
          title={`${item.org_name} ${item.id}`}
          value={item.id}
          key={item.enter_no ? item.enter_no : item.org_no}
        >
          {item.children ? this.renderTreeNodes(item.children) : null}
        </TreeNode>
      );
    });
  };
  render = () => {
    const { warehouseList, orgList }=this.props;
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
            <Form.Item {...formItemLayout} label="店铺编号">
              {getFieldDecorator('store_no', {
                rules: [{
                  required: true,
                  message: '请输入店铺编号',
                }],
              })(
                <Input placeholder="请输入" />
              )}
            </Form.Item>
            <Form.Item {...formItemLayout} label="店铺名称">
              {getFieldDecorator(`store_name`, {
                rules: [{
                  required: true,
                  message: '请输入店铺名称',
                }],
              })(
                <Input placeholder="请输入" />
              )}
            </Form.Item>
            <Form.Item {...formItemLayout} label="所属组织">
              {getFieldDecorator(`org_id`, {
                rules: [
                  {
                    required: true,
                    message: '所属组织',
                  },
                ],
              })(
                <TreeSelect
                  style={{ width: 200 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  // fieldNames={{ label: 'org_name', value: 'id' }}
                  placeholder="请选择所属组织"
                  treeDefaultExpandAll
                >
                  {this.renderTreeNodes(orgList)}
                </TreeSelect>
              )}
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label="发货仓库"
              hasFeedback
            >
              {getFieldDecorator('warehouse_id', {
                rules: [
                  { required: true, message: '请选择发货仓库!' },
                ],
              })(
                <Select
                  className='width180'
                  placeholder="请选择发货仓库"
                  showSearch
                  optionFilterProp='children'
                >
                  {warehouseList.map(val=>{
                    return(
                      <Option value={val.warehouse_id}>{val.warehouse_name}</Option>
                    )
                  })}
                </Select>
              )}
            </Form.Item>
          </div>
        </Form>
      </Modal>
    );
  };
};

const Edit = Form.create()(EditForm);

export default Edit;
