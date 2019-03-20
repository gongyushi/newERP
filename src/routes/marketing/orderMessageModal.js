import React from 'react';
import {
  Form,
  Button,
  Modal,
  Icon,
  Input,
  message,
  Select,
} from 'antd';
import UploadFiles from '../../components/UploadFiles/UploadFiles';
import { erpPost } from '../../services/ajax';

const FormItem = Form.Item;
const { Option } = Select;

class OrderMessageModal extends React.Component {
  state = {
    visible: this.props.visible,
    loading: false,
    title: this.props.title,
    currencys: [],
    docData: {}, 
  };

  componentDidMount(){
    this.getCurrencyList();
  }

  componentWillReceiveProps(next){
    this.setState({
      visible: next.visible,
      title: next.title,
    });
  }
  
  // 获取数字字典
  getCurrencyList = () => {
    erpPost('index/dictionary/lists', {keyword:'currency'}, res => {
      this.setState({
        currencys: res.data.data.children,
      });
    });
  }

  // 关闭模态框
  handleClose = () => {
    this.setState({
      loading: false,
    });
    if(this.props.onClose){
      this.props.onClose('msgVisible');
    }
  }

  // 保存数据
  handleSubmit = () => {
    this.setState({
      loading: true,
    });
    const { docData } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        message.success('选择成功',2);
        if(docData){
          values = {...values,...docData};
        }
        if(this.props.onSubmit){
          this.props.onSubmit(values);
        }
        this.handleClose();
      }
    });
  }

  // 上传成功回调
  handleUpload = (type,file) => {
    const url = file.response.path;
    const doc_name = file.response.originName;
    const docData = {url,doc_name};
    this.setState({docData});
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, title, loading, currencys } = this.state;
    const { order_id } = this.props;
    const formItemLayout = {
      labelCol: { span : 8 },
      wrapCol: { span: 16 },
    };
    return (
      <div>
        <Modal
          visible={visible}
          closable={false}
          maskClosable={false}
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
            <FormItem {...formItemLayout} label='运号单' >
              {
                getFieldDecorator('fulfillment_no', {
                  rules: [
                    {
                      required: true,
                      message: '请填写运单号',
                    },
                  ],
                })(
                  <Input style={{ width: 200 }} />
                )
              }
            </FormItem>
            <FormItem {...formItemLayout} label='运费' >
              {
                getFieldDecorator('shipping_price', {
                  rules: [
                    {
                      required: true,
                      message: '请填写运费',
                    },
                    {
                      pattern: /^\d+(\.\d+)?$/,
                      message: '请输入数字类型',
                    },
                  ],
                })(
                  <Input 
                    style={{ width: 200 }} 
                    addonAfter={
                      getFieldDecorator('shipping_price_currency_code',{
                        initialValue: 133,
                      })(
                        <Select
                          showSearch
                          optionFilterProp='children'
                        >
                          {
                            currencys && currencys.map(cur => (
                              <Option key={cur.id} value={cur.id}>{cur.remark}</Option>
                            ))
                          }
                        </Select>
                      )
                    }
                  />
                )
              }
            </FormItem>
            {          
              <FormItem {...formItemLayout} label='上传文件' extra='支持.rar .zip .doc .dox .jpg...'>
                <UploadFiles 
                  title='上传文件' 
                  url='/order/file/upload'
                  fileName='upload_file'
                  data={{order_id}}
                />
              </FormItem>          
            }
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(OrderMessageModal);