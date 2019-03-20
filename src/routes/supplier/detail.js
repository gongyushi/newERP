import React from 'react';
import {
  Form,
  Input,
  Cascader,
  Select,
  Button,
  Row,
  Col,
} from 'antd';
import { getPageState, getOrderState } from '../../utils/utils';
import Prompt from '../../components/Prompt';
import PermissionButton from '../../components/PermissionButton';
import { erpPost } from '../../services/ajax';
import PaymentIndex from './payment/index';
import ProductIndex from './product/index';
import styles from './detail.less';

require('../ListStyle.less');

const { Option } = Select;
const { TextArea } = Input;

class EditForm extends React.Component {
  constructor(props) {
    super(props);
    const { activeKey, params } = props;
    this.newTabIndex = 0;
    this.state = {
      activeKey,
      id: params.Get('id', 0),
      productPageCurrent: params.Get('product_page_current', 0),
      editable: false,
      detail: '',
      area: [],
      paymentList: [],
    };
  };
  componentDidMount() {
    this.refresh();
  };
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.refresh();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };
  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextState.id) !== JSON.stringify(this.state.id)
    ){
      this.refresh();
    }
  };
  refresh = () => {
    const { id } = this.state;
    const params={
      id,
    };
    erpPost('supplier/detail', params, res => {
      const item=res.data.data;
      const areaData = [];
      const area = [];
      if(item.area){
        item.area.map(addre=>{
          area.push(addre.name);
          return areaData.push(addre.id)
        })
      }
      this.setState({
        paymentList: item.supplier_payments,
        detail: item,
        area,
      });
      this.props.form.setFieldsValue({
        supplier_no: item.supplier_no,
        name: item.name,
        type: String(item.type),
        contact: item.contact,
        phone: item.phone,
        email: item.email,
        pay_type: String(item.pay_type),
        address: item.address,
        residence:areaData,
        english_address: item.english_address,
        remark: item.remark,
      });
    });
  };
  handleEdit = () => {
    this.setState({
      editable: true,
    });
  };
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          supplier_id: this.state.id,
          country_id: values&&values.residence[0],
          province_id: values&&values.residence[1],
          city_id: values&&values.residence[2],
          ...values,
        };
        delete params.residence;
        erpPost('supplier/edit', params, res => {
          this.setState({
            editable: false,
          });
          Prompt.success({ content: res.data.msg });
          this.refresh();
        });
      }
    });
  };


  render = () => {
    const { getFieldDecorator } = this.props.form;
    const { id, editable, detail, area, paymentList, productPageCurrent } = this.state;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
    };
    const formItemLayoutName = {
      labelCol: { span: 2 },
      wrapperCol: { span: 20 },
    };
    const formItemLayout2 = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const formItemLayout3 = {
      labelCol: { span: 1 },
      wrapperCol: { span: 21 },
    };
    const typeData = {
      '0':'l688供应商',
      '1':'其他供应商',
    };
    const payData = {
      '0':'货到付款',
      '1':'分期付款',
    };
    const prefixSelector = getFieldDecorator('phone_country_code', {
      initialValue: '86',
    })(
      <Select style={{ width: 70 }}>
        <Option value="86">+86</Option>
        <Option value="87">+87</Option>
      </Select>
    );

    return (
      <div className={ styles.rootDiv }>
        <Form>
          <div className="moduleTitle">
            <h3 style={{ float: 'left' }}>基本资料</h3>
            <span style={{float:'right'}}>
              <PermissionButton
                type="primary"
                size='small'
                action="supplier/edit"
                onClick={editable===false?this.handleEdit:this.handleSubmit}
              >
                { editable === false ? '编辑' : '保存' }
              </PermissionButton>
            </span>
          </div>
          <div>
            <Row>
              <Col>
                <Form.Item label="供应商名称" {...formItemLayoutName}>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入供应商名称!' }],
                  })(editable?<Input />:<span>{detail&&detail.name}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Form.Item label="供应商编号" {...formItemLayout}>
                  {getFieldDecorator('supplier_no', {
                    rules: [{ required: true, message: '请输入供应商编号!' }],
                  })(editable?<Input />:<span>{detail&&detail.supplier_no}</span>)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="供应商类型" {...formItemLayout}>
                  {getFieldDecorator('type', {
                    rules: [{ required: true, message: '请选择供应商名称!' }],
                  })(
                    editable?(
                      <Select placeholder="请选择供应商类型" >
                        <Option value="0">l688供应商</Option>
                        <Option value="1">其他供应商</Option>
                      </Select>
                    ):<span>{detail&&typeData[detail.type]}</span>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="付款方式" {...formItemLayout}>
                  {getFieldDecorator('pay_type', {
                    rules: [{ required: true, message: '请选择付款方式!' }],
                  })(
                    editable?(
                      <Select placeholder="请选择付款方式" >
                        <Option value="0">货到付款</Option>
                        <Option value="1">分期付款</Option>
                      </Select>
                    ):<span>{detail&&payData[detail.pay_type]}</span>
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={8}>
                <Form.Item label="联系人" {...formItemLayout}>
                  {getFieldDecorator('contact', {
                    rules: [{ required: true, message: '请输入联系人!' }],
                  })( editable?<Input />:<span>{detail&&detail.contact}</span>)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="联系电话" {...formItemLayout}>
                  {getFieldDecorator('phone', {
                    rules: [{ required: true, message: '请输入联系电话!' }],
                  })( editable?
                    <Input addonBefore={prefixSelector}  />
                    :(
                      <div>
                        <span>+{detail&&detail.phone_country_code}</span>
                        <span style={{marginLeft:6}} >{detail&&detail.phone}</span>
                      </div>
                    ))}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="邮箱" {...formItemLayout}>
                  {getFieldDecorator('email', {
                    rules: [{
                      type: 'email', message: 'The input is not valid E-mail!',
                    }],
                  })(editable?<Input />:<span>{detail&&detail.email}</span>)}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={8}>
                <Form.Item label="地区" {...formItemLayout2}>
                  {getFieldDecorator('residence', {
                    initialValue: detail.area,
                    rules: [{ type: 'array' }],
                  })(editable?<Cascader options={this.state.residences} />:<div><span style={{marginRight:10}}>{area.join('/')}</span><span>{detail&&detail.address}</span></div>)}
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item label="" {...formItemLayout3}>
                  {getFieldDecorator('address')(editable?<Input  />:<span />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Item label="备注" {...formItemLayoutName}>
                  {getFieldDecorator('remark')(editable?<TextArea autosize={{ minRows: 2, maxRows: 6 }} style={{ width: '100%' }} />:<span>{detail&&detail.remark}</span>)}
                </Form.Item>
              </Col>
              <Col span={8} />
            </Row>
          </div>
          <PaymentIndex
            params={new URLSearchParams({supplier_id: id })}
            dataSource={paymentList}
            refresh={this.refresh}
          />
          <ProductIndex
            params={new URLSearchParams({supplier_id: id, current: productPageCurrent })}
            refresh={this.refresh}
          />
        </Form>
      </div>
    );
  };
};

const Edit = Form.create()(EditForm);
export default Edit;
