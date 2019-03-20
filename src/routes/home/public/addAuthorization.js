import React from 'react';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
} from 'antd';
import { erpPost } from 'services/ajax';
import Prompt from '../../../components/Prompt';

const FormItem = Form.Item;
const { Option } = Select;

class Authorization extends React.Component {
  state = {
    marketplaceList: [], // 开户站列表
    loading: false,
  };
  componentDidMount(){
    this.getMarketList();
  }
  getMarketList = () => {
    erpPost('index/dictionary/index', { keyword:'marketplace'},res=>{
      this.setState({
        marketplaceList:res.data.data.children,
      });
    });
  }
  handleSubmit = () => {
    // this.props.onNext(this.props.current,{list:[]});
    this.props.form.validateFields((err,values) => {
      if(!err){
        this.setState({
          loading: true,
        });
        erpPost('store/submit-authorize-info',{...values},res => {
          Prompt.success();
          this.setState({
            loading: false,
          });
          if(this.props.onNext){
            this.props.onNext(this.props.current,{...values,list:res.data.data});
          }
        },() => {
          this.setState({
            loading: false,
          });
        });
      }
    });
  }
  handlePrev = () => {
    if(this.props.onPrev){
      this.props.onPrev(this.props.current);
    }
  }
  render(){
    const {getFieldDecorator} = this.props.form;
    const { marketplaceList, loading } = this.state;
    const formItemLayout = {
      labelCol: { span : 6 },
      wrapperCol: { span: 10},
    };
    return(
      <div>
        <Form style={{minHeight:500}}>
          <FormItem {...formItemLayout} label='开户站'>
            {
              getFieldDecorator('market_place_id',{
                rules:[
                  {
                    required: true,
                    message: '请选择开户行',
                  },
                ],
              })(
                <Select 
                  placeholder="请选择开户行"
                  showSearch
                  optionFilterProp='children'
                >
                  {
                    marketplaceList.length !== 0 && 
                    marketplaceList.map(val => <Option key={val.id} value={val.id}>{val.remark}</Option>)
                  }
                </Select>
              )
            }
          </FormItem>
          <FormItem {...formItemLayout} label='Seller ID'>
            {
              getFieldDecorator('seller_id',{
                rules:[
                  {
                    required: true,
                    message: '请输入sellerID',
                  },
                ],
              })(
                <Input placeholder="请输入买家ID" />
              )
            }
          </FormItem>
          <FormItem {...formItemLayout} label='Access Key ID'>
            {
              getFieldDecorator('access_key',{
                rules:[
                  {
                    required: true,
                    message: '请输入访问秘钥ID',
                  },
                ],
              })(
                <Input placeholder="请输入access key ID" />
              )
            }
          </FormItem>
          <FormItem {...formItemLayout} label='Secret Key'>
            {
              getFieldDecorator('secret_key',{
                rules:[
                  {
                    required: true,
                    message: '请输入秘钥',
                  },
                ],
              })(
                <Input placeholder="请输入secret key" />
              )
            }
          </FormItem>
          <FormItem {...formItemLayout} label="Mws Token">
            {getFieldDecorator('mws_token', {
              rules: [{
                required: true,
                message: '请输入Mws Token',
              }],
            })(
              <Input placeholder="请输入mws token" />
            )}
          </FormItem>
        </Form>
        <Row>
          <Col md={{span: 24}} xl={{span:22}} style={{display:'flex',justifyContent:'flex-end'}}>
            <Button type='primary' onClick={this.handlePrev} style={{margin:5}}>
              上一步
            </Button>
            <Button type='primary' loading={loading} onClick={this.handleSubmit} style={{margin:5}}>
              下一步
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

const AddAuthorization = Form.create()(Authorization);

export default AddAuthorization;
