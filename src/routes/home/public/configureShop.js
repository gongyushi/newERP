import React from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Button,
} from 'antd';
import { erpPost } from 'services/ajax';
import Prompt from '../../../components/Prompt';

require('./message.less');

const FormItem = Form.Item;

class ConfigureTheShop extends React.Component {
  state = {
    data: this.props.data,
    loading: false,
  };
  componentWillReceiveProps(next){
    this.setState({
      data: next.data,
    });
  }
  handleRemove = (idx) => {
    const { data } = this.state;
    const { list } = data;
    list.map((val,key) => {
      if(idx === key){
        list.splice(key,1);
      }
      return val;
    });
    this.setState({data});
  }
  handleSubmit = () => {
    this.props.form.validateFields((err,values) => {
      if(!err){
        this.setState({
          loading: true,
        });
        const { data } = this.state;
        const { list,...common } = data;
        values.store_list = values.store_list.map((val,key) => {
          const { marketplace_name, ...tmp } = list[key];
          val = {...tmp,...common,...val};
          val.market_place_id = undefined;
          return val;
        });
        erpPost('person/second-step',{...values},() => {
          Prompt.success();
          if(this.props.onNext){
            this.props.onNext(this.props.current);
          }
          this.setState({
            loading: false,
          });
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
    const { data, loading } = this.state;
    const { list } = data;
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: { span : 6 },
      wrapperCol: { span: 18},
    };
    return(
      <Row style={{minHeight:500}}>
        <Col span='12'>
          {
            list.map((val,idx) => (
              <div key={val.id} style={{borderBottom: '1px solid #ddd'}}>
                <Form className='messageForm'>
                  <FormItem {...formItemLayout} label='开户站：'>
                    {
                      getFieldDecorator(`store_list[${idx}]marketplace`,{
                        initialValue: val.marketplace,
                      })(
                        <div style={{display:'flex',justifyContent:'space-between'}}>
                          <span>
                            {val.marketplace_name}
                          </span>
                          <Button type='primary' style={{top:6}} size='small' onClick={this.handleRemove.bind(this,idx)}>
                            移除
                          </Button>
                        </div>
                      )
                    }
                  </FormItem>
                  <FormItem {...formItemLayout} label='店铺编号：'>
                    {
                      getFieldDecorator(`store_list[${idx}]store_no`,{
                        rules: [
                          {
                            required: true,
                            message: `请输入${val.name}店铺编号`,
                          },
                        ],
                        initialValue: val.store_no,
                      })(
                        <Input style={{width: 200}} />
                      )
                    }
                  </FormItem>
                  <FormItem {...formItemLayout} label='店铺名称：'>
                    {
                      getFieldDecorator(`store_list[${idx}]store_name`,{
                        rules: [
                          {
                            required: true,
                            message: `请输入店铺名称`,
                          },
                        ],
                        initialValue: val.store_name,
                      })(
                        <Input style={{width: 200}} />
                      )
                    }
                  </FormItem>
                </Form>
              </div>
            ))
          }
        </Col>
        <Col span='24' style={{display:'flex',justifyContent:'flex-end'}}>
          <Button type='primary' onClick={this.handlePrev} style={{margin:5}}>
            上一步
          </Button>
          <Button type='primary' loading={loading} onClick={this.handleSubmit} style={{margin:5}}>
            下一步
          </Button>
        </Col>
      </Row>

    )
  }
}

const ConfigureShop = Form.create()(ConfigureTheShop);

export default ConfigureShop;
