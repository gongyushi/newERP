import React from 'react';
import { Form, Input, Icon, Upload, Cascader, Select, Button, message, Divider } from 'antd';
import { connect } from 'dva';
import { erpPost } from 'services/ajax';
import styles from '../message.less';
import UploadFiles from '../../../components/UploadFiles/UploadFiles';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { Option } = Select;
const { TextArea } = Input;

class RegistrationForm extends React.Component {
  state = {
    residences: [],
    bankData:[],
    logo_image:'',
  };

  componentDidMount() {
    this.getAddress()
    this.onGetUnitCode()
    this.onMessageDetail()
  }

  componentWillReceiveProps(next){
    if(next.addressList){
      this.setState({
        residences:next.addressList,
      })
    }  
  }

  onGetUnitCode = () => {
    erpPost('/index/dictionary/lists', {keyword :'BANK_NAME'}, res => {
      this.setState({bankData :res.data.data.children})
    })
  }
  
  // 获取详细数据
  onMessageDetail = () => {
    erpPost('enterprise/view', {}, res => {
      this.props.form.setFieldsValue(res.data.data);
      this.setState({
        imagePath:res.data&&res.data.data&&res.data.data.logo_image,
      })
    });
  }
  // 地址树
  getAddress=()=>{
    this.props.dispatch({
      type: 'commonUse/fetchAddress',
    });
  }

  // 保存
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {     
      if (!err) {
        const { logo_image } = this.state;
        values.country_id = values.residences&&values.residences[0];
        values.province_id = values.residences&&values.residences[1];
        values.city_id = values.residences&&values.residences[2];
        values.area_id = values.residences&&values.residences[3];
        values.logo_image = logo_image;
        delete values.residences; 
        erpPost('enterprise/edit', values, res => {
          message.success(res.data.msg);
          this.onMessageDetail()
        });
      }
    });
  };

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
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
    
    const { bankData, imagePath } = this.state;
    const prefixSelector = getFieldDecorator('phone_country_code', {
      initialValue: '86',
    })(
      <Select 
        style={{ width: 70 }}
        showSearch
        optionFilterProp='children'
      >
        <Option value="86">+86</Option>
        <Option value="87">+87</Option>
      </Select>
    );
    return (
      <Form onSubmit={this.handleSubmit} className={styles.messageForm}>
        <p className={styles.moduleTitle}>基本信息</p>
        <hr className={styles.hrTitle} />
        <FormItem {...formItemLayout} label="logo图片" extra="仅支持2M以内 jpg、png文件">
          {getFieldDecorator('logo_image')(
            <div>
              {
                <UploadFiles
                  type='image'
                  url='file/upload-files'
                  fileName='upload_file'
                  onUpload={this.handleUpload}
                  imageUrl={`${global.gconfig.urlHeader}/img?path=${imagePath}&token=${localStorage.getItem('token')}`}
                />
              }
            </div>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="企业名称"
        >
          {getFieldDecorator('enter_name', {
            rules: [
              { 
                required: true, 
                message: '请输入企业名称!', 
                whitespace: true,
                max: 50,
              },
            ],
          })(<Input placeholder='请填写相关信息' />)}
        </FormItem>
        <FormItem {...formItemLayout} label="企业地址">
          {getFieldDecorator('residences', {
            initialValue: [1, 2, 3, 4],
            rules: [{ type: 'array', required: true, message: '请选择企业地址!' }],
          })(<Cascader fieldNames={{ label: 'area_name', value: 'id'}} options={this.state.residences} />)}
        </FormItem>
        <FormItem {...formItemLayout} label="详细地址">
          {getFieldDecorator('address', {
            rules: [
              {
                required: true,
                message: '请填写地址!',
              },
            ],
          })(<TextArea placeholder='请填写相关信息' />)}
        </FormItem>
        <FormItem {...formItemLayout} label="统一信用代码">
          {getFieldDecorator('credit_code', {
            rules: [
              {
                required: true,
                message: '请填写18位阿拉伯数字或大写英文字母!',
                len: 18,
              },
            ],
          })(<Input placeholder='请填写相关信息' />)}
        </FormItem>
        <FormItem {...formItemLayout} label="纳税人识别号">
          {getFieldDecorator('tax_no', {
            rules: [
              {
                required: true,
                message: '请填写正确的纳税人识别号!',
                pattern: new RegExp(/^([\s\S]{15}|[\s\S]{18}|[\s\S]{20})$/, "g"),
              },
            ],
          })(<Input placeholder='请填写纳税人识别号' />)}
        </FormItem>
        <FormItem {...formItemLayout} label="联系人">
          {getFieldDecorator('contact', {
            rules: [
              {
                required: true,
                message: '请输入联系人!',
                max: 50,
              },
            ],
          })(<Input placeholder='请填写相关信息' />)}
        </FormItem>
        <FormItem {...formItemLayout} label="联系人邮箱">
          {getFieldDecorator('email', {
            rules: [
              {
                type: 'email',
                message: '请填写联系人邮箱!',
              },
              {
                required: true,
                message: '请填写联系人邮箱!',
              },
            ],
          })(<Input placeholder='请填写邮箱' />)}
        </FormItem>
        <FormItem {...formItemLayout} label="联系人QQ">
          {getFieldDecorator('qq', {
            rules: [
              {
                message: '请填写联系人QQ!',
                pattern: new RegExp(/^[1-9][0-9]{4,14}$/, "g"),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="联系人手机">
          <InputGroup>
            {getFieldDecorator('phone', {
              rules: [
                { 
                  required: true, 
                  max: 20,
                  message: '只能输入最多20位数字!', 
                },
              ],
            })(<Input addonBefore={prefixSelector} style={{ width: '100%' }}   placeholder="请填写联系电话" />)
            }
          </InputGroup>         
        </FormItem>
        <p className={styles.moduleTitle}>财务信息</p>
        <hr className={styles.hrTitle} />
        <FormItem {...formItemLayout} label="开户行" hasFeedback>
          {getFieldDecorator('bank_name')(
            <Select 
              placeholder="请选择开户行!"
              showSearch
              optionFilterProp='children'
            >
              {bankData.map(bank=>{
                return (<Option value={bank.id}>{bank.remark}</Option>)
                })  
              }         
            </Select>          
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="开户名">
          {getFieldDecorator('account')(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="卡号">
          {getFieldDecorator('bank_no')(<Input />)}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const MessageForm = Form.create()(RegistrationForm);
const mapStateToProps = state => {
  return {
    addressList: state.commonUse&&state.commonUse.addressList,
  };
};
export default connect(mapStateToProps)(MessageForm);
