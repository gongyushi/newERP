import React from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  TreeSelect,
  Button,
} from 'antd';
import { erpPost } from '../../services/ajax';
import Prompt from '../../components/Prompt';
import styles from './add.less';

const {Option} = Select;
const { TreeNode } = TreeSelect;

class AddForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      step: 0,
      storeList: [],
    };
  };
  componentDidMount = () => {
    this.props.form.setFieldsValue({
      market_place_id: 55,
      seller_id: 'A1TVK9W4UM80AB',
      access_key: 'AKIAIKV6HN4AQKAJQDVQ',
      secret_key: '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',
      mws_token: 'amzn.mws.28ae4546-e241-2346-34d7-a83e8338c4d1',
    });
  };
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        if(this.state.step === 0){
          // 步骤一
          erpPost('store/submit-authorize-info', values, res=>{
            const storeList = res.data.data;
            const arr=[];
            storeList.map(val=>{
              const newObj=Object.assign(val, values);
              arr.push(newObj);
              return val;
            });
            this.setState({
              loading: false,
              step: 1,
              storeList,
            });
          }, ()=>{
            this.setState({ loading: false });
          });
          return;
        }
        // 步骤二
        const { storeList } = this.state;
        storeList.filter(val=>{
          values.addData.map(list=>{
            if (list.marketplace === val.marketplace){
              val.org_id = list.org_id;
              val.store_name = list.store_name;
              val.store_no = list.store_no;
              delete val.marketplace_name;
              delete val.market_place_id;
            }
            return list;
          });
          return val;
        });

        erpPost('store/add', {store_list: storeList}, res=>{
          Prompt.success({ content: res.data.msg });
          this.handleCancel();
        }, ()=>{
          this.setState({ loading: false });
        });
      }
    });
  };
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };
  handleDeleteStore = (e) => {
    const list = this.state.storeList;
    list.map((val, key)=>{
      if(key===e){
        list.splice(key, 1)
      }
      return val;
    });
    this.setState({
      storeList: list,
    })
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
    const { marketplaceList, orgList }=this.props;
    const { getFieldDecorator } = this.props.form;
    const { loading, step, storeList }=this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    return(
      <Modal
        title="新增店铺"
        visible
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        confirmLoading={loading}
        maskClosable={false}
      >
        { step === 0 ?
          (
            <Form className={styles.formList}>
              <Form.Item
                {...formItemLayout}
                label="开户站"
                hasFeedback
              >
                {getFieldDecorator('market_place_id', {
                  rules: [
                    { required: true, message: '请选择开户行!' },
                  ],
                })(
                  <Select
                    placeholder="请选择开户行"
                    showSearch
                    optionFilterProp='children'
                  >
                    {marketplaceList instanceof Array && marketplaceList.map((val)=>{
                      return (<Option key={val.id} value={val.id}>{val.remark}</Option>)
                    })}
                  </Select>
                )}
              </Form.Item>
              <Form.Item {...formItemLayout} label="Seller ID">
                {getFieldDecorator('seller_id', {
                  rules: [{
                    required: true,
                    message: '请输入Seller ID',
                  }],
                })(
                  <Input placeholder="请输入" />
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
              <Form.Item {...formItemLayout} label="MWS Token">
                {getFieldDecorator('mws_token', {
                  rules: [{
                    required: true,
                    message: '请输入 MWS Token',
                  }],
                })(
                  <Input placeholder="请输入" />
                )}
              </Form.Item>
              <a style={{ color:'#1890ff'}}>如何配置？</a>
            </Form>
          ) :
          (
            <Form className={styles.formList}>
              {storeList.map((val,key)=>{
                return (
                  <div style={{borderBottom:'1px solid #dcdcdc'}}>
                    <Form.Item {...formItemLayout} label="开户站">
                      {getFieldDecorator(`addData[${key}]marketplace`,{
                        initialValue: val.marketplace,
                      })(
                        <div>
                          <div style={{ float: 'left' }}>
                            {val.marketplace_name}
                          </div>
                          <div style={{ float: 'right' }}>
                            { storeList.length <= 1 ? "" : (
                              <Button
                                size='small'
                                type="primary"
                                ghost
                                onClick={this.handleDeleteStore.bind(this, key)}
                              >
                                移除
                              </Button>
                            ) }
                          </div>
                        </div>
                      )}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="店铺编号">
                      {getFieldDecorator(`addData[${key}]store_no`, {
                        initialValue: val.store_no,
                        rules: [{
                          required: true,
                          message: '请输入店铺编号',
                        }],
                      })(
                        <Input placeholder="请输入" />
                      )}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="店铺名称">
                      {getFieldDecorator(`addData[${key}]store_name`, {
                        initialValue: val.store_name,
                        rules: [{
                          required: true,
                          message: '请输入店铺名称',
                        }],
                      })(
                        <Input placeholder="请输入" />
                      )}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="所属组织">
                      {getFieldDecorator(`addData[${key}]org_id`, {
                        initialValue: [val.org_id],
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
                          placeholder="Please select"
                          treeDefaultExpandAll
                        >
                          {this.renderTreeNodes(orgList)}
                        </TreeSelect>
                      )}
                    </Form.Item>
                  </div>
                )
              })}
            </Form>
          ) }
      </Modal>
    );
  };
};

const Add = Form.create()(AddForm);

export default Add;
