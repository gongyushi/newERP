import React from 'react';
import { InputNumber, Form,  Modal, Checkbox, Row, Col } from 'antd';
import styles from './StoreList.less';
import { erpPost } from '../../services/ajax';
import Prompt from '../../components/Prompt';

const FormItem = Form.Item;
@Form.create()
class StoreModal extends React.Component {
  constructor(props){
    super(props)
    this.state={
      checked: 0,
    }
  }

  componentDidMount() {
    this.onSetForm()
  }

  // 获取初始值
  onSetForm = () => {
    const {warehouse_product_id} = this.props;
    erpPost('/warehouse-product/stocking-parameter', {warehouse_product_id}, res => {
      const {data} = res.data;
      const formatData = {
        three_sale_ratio:Number(data.three_sale_ratio),
        seven_sale_ratio:Number(data.seven_sale_ratio),
        fifteen_sale_ratio:Number(data.fifteen_sale_ratio),
        thirty_sale_ratio:Number(data.thirty_sale_ratio),
        requisition_safe_days:Number(data.requisition_safe_days),
        requisition_interval_days:Number(data.requisition_interval_days),
        purchase_safe_days:Number(data.purchase_safe_days),
        purchase_interval_days:Number(data.purchase_interval_days),
        monitor_enable:Number(data.monitor_enable),
      }
      this.setState({
        checked: Number(data.monitor_enable),
      })
      this.props.form.setFieldsValue(formatData);
    });
  }

  // 编辑保存参数配置
  onSubmitForm = () => {
    const {onCancel,warehouse_product_id} = this.props; 
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.warehouse_product_id = warehouse_product_id;
        if(values.monitor_enable){
          values.monitor_enable = 1;
        } else {
          values.monitor_enable = 0;
        }
        erpPost('/warehouse-product/update-stocking-parameter', values, () => {
          onCancel();
          Prompt.success();
        });
      }
    });
  }

  // 复选框
  onChange = (e) => {
    this.setState({
      checked: e.target.checked,
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { onCancel, visible } = this.props;
    const { checked } = this.state;
    return (
      <Modal
        visible={visible}
        title="备货参数设置"
        onCancel={onCancel}
        maskClosable={false}
        width={930}
        onOk={this.onSubmitForm}
      > 
        <Form layout='inline'>
          <div>
            <div>
              <FormItem> 
                <span style={{marginRight:5}}>日均销量 =</span>        
                {getFieldDecorator('three_sale_ratio', {
                  rules:[
                    {
                      required: true,
                      pattern: new RegExp(/^(?:0|[1-9][0-9]?|100)$/, "g"),
                      message: '请输入0到100的正整数',
                    }],
                  })(<InputNumber className={styles.input} />
                )} 
                <span>% X 3日均量 +</span>  
              </FormItem>
              <FormItem>
                {getFieldDecorator('seven_sale_ratio', {
                  rules:[
                    {
                      required: true,
                      pattern: new RegExp(/^(?:0|[1-9][0-9]?|100)$/, "g"),
                      message: '请输入0到100的正整数',
                    }],
                  })(<InputNumber className={styles.input} />
                )}   
                 % X 7日均量 +    
              </FormItem>           
              <FormItem>
                {getFieldDecorator('fifteen_sale_ratio', {
                  rules:[
                    {
                      required: true,
                      pattern: new RegExp(/^(?:0|[1-9][0-9]?|100)$/, "g"),
                      message: '请输入0到100的正整数',
                    }],
                  }
                )(
                  <InputNumber className={styles.input} />
                )}
                % X 15日均量 + 
              </FormItem>
              <FormItem>
                {getFieldDecorator('thirty_sale_ratio', {
                  rules:[
                    {
                      required: true,
                      pattern: new RegExp(/^(?:0|[1-9][0-9]?|100)$/, "g"),
                      message: '请输入0到100的正整数',
                    }],
                  }
                )(
                  <InputNumber className={styles.input} />
                )}
                % X 30日均量
              </FormItem>
            </div>
            <Row>
              <Col span='12'>
                <FormItem label='调拨安全天数'>
                  {getFieldDecorator('requisition_safe_days', {
                    rules:[
                      {
                        required: true,
                        pattern: new RegExp(/^(?:0|[1-9]|[1-9][0-9]|[1-3][0-6][0-5]?|365)$/, "g"),
                        message: '请输入0到365的正整数',
                      }],
                    }
                  )(
                    <InputNumber style={{width:150}} />
                  )}
                </FormItem>
              </Col>
              <Col span='12'>
                <FormItem label='调拨间隔天数'>
                  {getFieldDecorator('requisition_interval_days', {
                    rules:[
                      { 
                        required: true,
                        pattern: new RegExp(/^(?:0|[1-9]|[1-9][0-9]|[1-3][0-6][0-5]?|365)$/, "g"),
                        message: '请输入0到365的正整数',
                      }],
                    }
                  )(
                    <InputNumber style={{width:150}} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <div>
              <Col span='12'>
                <FormItem label='采购安全天数'>
                  {getFieldDecorator('purchase_safe_days', {
                    rules:[
                      {
                        required: true,
                        pattern: new RegExp(/^(?:0|[1-9]|[1-9][0-9]|[1-3][0-6][0-5]?|365)$/, "g"),
                        message: '请输入0到365的正整数',
                      }],
                    }
                  )(
                    <InputNumber style={{width:150}} />
                  )}
                </FormItem>
              </Col>
              <Col span='12'>
                <FormItem label='采购间隔天数'>
                  {getFieldDecorator('purchase_interval_days', {
                    rules:[
                      {
                        required: true,
                        pattern: new RegExp(/^(?:0|[1-9]|[1-9][0-9]|[1-3][0-6][0-5]?|365)$/, "g"),
                        message: '请输入0到365的正整数',
                      }],
                    }
                  )(
                    <InputNumber style={{width:150}} />
                  )}
                </FormItem>
              </Col>
            </div>
            <div style={{marginTop:20}}>            
              <FormItem>
                {getFieldDecorator('monitor_enable')(
                  <span>库存监控: <Checkbox checked={checked} onChange={this.onChange} /></span>
                )}
              </FormItem> 
            </div>
          </div>
        </Form>
      </Modal>  
    )
  }
}

export default StoreModal;