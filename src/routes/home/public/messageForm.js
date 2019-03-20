import React from 'react';
import {
  Form,
  Input,
  Cascader,
  Select,
  Button,
  Col,
  Row,
} from 'antd';
import { erpPost } from 'services/ajax';
import UploadFiles from '../../../components/UploadFiles/UploadFiles';
import Prompt from '../../../components/Prompt';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class RegistrationForm extends React.Component {
  state = {
    loading: false,
    address: [], // 地址
    banklist: [], // 银行列表
    logo_image: '', // logo图片路径
    imagePath: undefined, // 详情图片路径
    dialCodeList: [], // 国际电话前缀
  }
  componentDidMount() {
    this.getAddress();
    this.getBankList();
    this.onMessageDetail();
    this.getDialCodeList();
  }
  // 获取详细数据
  onMessageDetail = () => {
    erpPost('enterprise/view', {}, res => {
      if(res.data.data){
        this.props.form.setFieldsValue(res.data.data);
        this.setState({
          imagePath:res.data&&res.data.data&&res.data.data.logo_image,
        });
      }
    });
  }
  getAddress = () => {
    erpPost('index/area/index',{},res => {
      this.setState({
        address: res.data.data,
      });
    });
  }
  getBankList = () => {
    erpPost('index/dictionary/index',{keyword:'BANK_NAME'},res => {
      this.setState({
        banklist: res.data.data.children,
      });
    });
  }
  // 获取国际电话号码前缀
  getDialCodeList = () => {
    erpPost('index/dictionary/index',{keyword: 'DialCode'},res => {
      this.setState({
        dialCodeList: res.data.data.children,
      });
    });
  }
  // 保存
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      console.log(err,values);
      if (!err) {
        this.setState({
          loading: true,
        });
        const { logo_image } = this.state;
        const [country_id,province_id,city_id,area_id] = values.residences;
        values = {...values,country_id,province_id,city_id,area_id};
        values.residences = undefined;
        values.logo_image = logo_image;
        erpPost('person/first-step', { ...values }, () => {
          Prompt.success();
          this.setState({
            loading: false,
          });
          if(this.props.onNext){
            this.props.onNext(this.props.current);
          }
        },() => {
          this.setState({
            loading: false,
          });
        });
      }
    });
  }
  handleUpload = (status,file) => {
    if(status === 'success'){
      this.setState({
        logo_image: file.response.path,
      });
    }else{
      console.log(file);
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { 
        md: { span : 4 },
        xxl: { span : 4 },
      },
      wrapperCol: {
        md: { span: 15 },
        xxl: { span: 12 },
      },
    };
    const formItemDoubleLayout = {
      labelCol: { 
        md: { span : 8 },
        xl: { span : 8 },
      },
      wrapperCol: {
        md: { span: 8 },
        xl: { span: 8 },
      },
    };
    const { address, banklist, loading, imagePath, dialCodeList } = this.state;
    return (
      <div style={{minHeight:500}}>
        <Form>
          <FormItem {...formItemLayout} label="logo图片" extra="仅支持2M以内 jpg、png文件">
            {getFieldDecorator('logo_image', {})(
              <UploadFiles
                type='image'
                url='file/upload-files'
                fileName='upload_file'
                onUpload={this.handleUpload}
                imageUrl={imagePath ? `${global.gconfig.urlHeader}/img?path=${imagePath}&token=${localStorage.getItem('token')}` : undefined}
              />
            )}
          </FormItem>
          
          <FormItem
            {...formItemLayout}
            label="企业名称"
          >
            {
              getFieldDecorator('enter_name', {
                rules: [
                  { 
                    required: true, 
                    message: '请输入企业名称', 
                    whitespace: true ,
                    max: 50,
                  },
                ],
              })(
                <Input />
              )
            }
          </FormItem>
          <FormItem {...formItemLayout} label="企业地址">
            {getFieldDecorator('residences', {
              rules: [
                {
                  required: true,
                  message: '请选择企业地址',
                },
              ],
            })
            (
              <Cascader 
                placeholder='请选择地址'
                fieldNames={{ label: 'area_name', value: 'id' }}
                options={address} 
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="详细地址">
            {getFieldDecorator('address', {
              rules: [
                {
                  required: true,
                  message: '请输入详细地址',
                },
              ],
            })(<TextArea autosize={{ minRows: 2}} />)}
          </FormItem>
          <Row>
            <Col span={12}>
              <FormItem {...formItemDoubleLayout} label="统一信用代码">
                {getFieldDecorator('credit_code', {
                  rules: [
                    {
                      required: true,
                      message: '请输入统一信用代码',
                    },
                    {
                      pattern: /(\d|\w){18}/,
                      message: '请填写18位阿拉伯数字或大写英文字母!',
                    },
                  ],
                })(<Input style={{width:200}} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemDoubleLayout} label="纳税人识别号">
                {getFieldDecorator('tax_no', {
                  rules: [
                    {
                      required: true,
                      message: '请填写正确的纳税人识别号!',
                      pattern: new RegExp(/^([\s\S]{15}|[\s\S]{18}|[\s\S]{20})$/, "g"),
                    },
                  ],
                })(<Input style={{width:200}} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem {...formItemDoubleLayout} label="联系人">
                {getFieldDecorator('contact', {
                  rules: [
                    {
                      required: true,
                      message: '请输入联系人!',
                      max: 50,
                    },
                  ],
                })(<Input style={{width:200}} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemDoubleLayout} label="联系人手机">
                {getFieldDecorator('phone', {
                  rules: [
                    { 
                      required: true, 
                      message: '请输入手机号码',
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
                          style={{width:80}}
                        >
                          {
                            dialCodeList && dialCodeList.map(val => <Option key={val.id} value={val.id}>{val.remark}</Option>)
                          }
                        </Select>
                      )
                    }
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem {...formItemDoubleLayout} label="联系人QQ">
                {getFieldDecorator('qq',{
                  rules: [
                    {
                      message: '请检查填写正确格式',
                      pattern: new RegExp(/^[1-9][0-9]{4,14}$/, "g"),
                    },
                  ],
                })(
                  <Input style={{width:200}} />
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemDoubleLayout} label="联系人邮箱">
                {getFieldDecorator('email', {
                  rules: [
                    {
                      type: 'email',
                      message: '请输入检查邮箱格式',
                    },
                    {
                      required: true,
                      message: '请输入邮箱',
                    },
                  ],
                })(<Input style={{width:200}} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem {...formItemDoubleLayout} label="开户行">
                {
                  getFieldDecorator('bank_name',{
                    rules: [
                      {
                        required: true,
                        message: '请选择开户行',
                      },
                    ],
                  })(
                    <Select
                      placeholder='请选择开户行'
                      style={{width:200}}
                    >
                      {
                        banklist.map(val => <Option value={val.id} key={val.id}>{val.remark}</Option>)
                      }
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemDoubleLayout} label="开户名">
                {getFieldDecorator('account', {
                  rules: [
                    {
                      required: true,
                      message: '请输入银行开户姓名',
                    },
                  ],
                })(<Input style={{width:200}} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem {...formItemDoubleLayout} label="卡号">
                {getFieldDecorator('bank_no', {
                  rules: [
                    {
                      required: true,
                      message: '请输入银行开户账号',
                    },
                  ],
                })(<Input style={{width:200}} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Row>
          <Col md={{span: 24}} xl={{span:22}} style={{display:'flex',justifyContent:'flex-end'}}>
            <Button type='primary' loading={loading} onClick={this.handleSubmit.bind(this)}>
              下一步
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Form.create()(RegistrationForm);
