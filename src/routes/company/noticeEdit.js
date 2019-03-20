import React from 'react';
import { Form, Input, Button, Radio, Select } from 'antd';
import { erpPost } from '../../services/ajax';

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;

class CreateNote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      children: [],
    }
  }

  componentDidMount() {
    const { noticeId, editable } = this.props;
    if(editable){
      this.setEditForm(noticeId);
    }
    this.onSelectMan()
  }
  
  // 保存数据
  onSubmit = () => {
    const page = {
      pageSize: 10, 
      total: 0, 
      current: 1,
      showSizeChanger: true,
    };
    const { editable, noticeId, getNoticeList, remove, index } = this.props;
    if(editable){
      this.props.form.validateFieldsAndScroll((err, values) => {
        values.id = noticeId;
        if(values&&values.receivers) {
          const receivers = values.receivers.join(',')
          values.receivers = receivers
        } 
        erpPost('/message/update', values, () => {
          getNoticeList(page);
          remove(index);
        });    
      })         
    } else {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if(values&&values.receivers) {
          const receivers = values.receivers.join(',')
          values.receivers = receivers
        } 
        erpPost('/message/add', values, () => {
          getNoticeList(page);
          remove(index);
        }); 
      })      
    }
  }
  
  // 获取人员下拉
  onSelectMan = () => {
    erpPost('/organization/person/index', {}, res => {
      const { data } = res.data;
      const children = [];
      if(data) {
        data.map( list => 
          children.push(<Option key={list.id} value={list.id.toString()}>{list.real_name}</Option>)
        )
      }
      this.setState({
        children,
      })
    });    
  }

  // 编辑的数据获取
  setEditForm = (message_id ) => {
    erpPost('/message/detail', { message_id  }, res => {   
      const { data } = res.data;  
      const newReceive = [];
      if(data&&data.receivers) {
        data.receivers.map(val=>
          newReceive.push(val.toString())
        )
      }
      data.receivers = newReceive;
      this.props.form.setFieldsValue(data);
    }); 
  }

  render(){
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { remove, activeKey } = this.props;
    const { children } = this.state;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 4 },
    };
    const formItemLayout2 = {
      labelCol: { span: 9 },
      wrapperCol: { span: 4 },
    };
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
      marginLeft: '-140px',
    };
    const radioStyle1 = {
      height: '30px',
      lineHeight: '30px',
      marginLeft: '-100px',
    };
    const radioStyle2 = {
      height: '30px',
      lineHeight: '30px',
    };
    const posi = {
      position: 'absolute',
      minWidth: '370px',
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: '0px',
      marginLeft: '115px',
      marginTop: '-27px',
    }
    return (
      <div style={{textAlign: 'center', minHeight:600, marginTop:40, absolute:'relative'}}>
        <div>
          <Form>
            <FormItem {...formItemLayout} label="标题" >
              {getFieldDecorator('title', {
                rules: [{ required: true, message: '请输入标题！' }],
              })(<Input style={{width:500}} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="内容" >
              {getFieldDecorator('content', {
                rules: [{ required: true, message: '请输入内容！' }],
              })(
                <textarea
                  style={{
                    width: '500px',
                    height: '164px',
                    borderColor: '#DEDEDE',
                    borderRadius: '5px',
                  }}
                />
              )}
            </FormItem>          
            <FormItem {...formItemLayout} label="署名" >
              {getFieldDecorator('author', {
                rules: [{ required: true, message: '请输入署名！' }],
              })(
                <Input style={{width:500}} />
              )}
            </FormItem>
            <FormItem {...formItemLayout2} label="类型" >
              {getFieldDecorator('status', {
                rules: [{ required: true, message: '请选择类型！' }],
                initialValue: 0,
              })(
                <RadioGroup>
                  <Radio value={0} style={radioStyle1}>上线</Radio>
                  <Radio value={1} style={radioStyle2}>下线</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout2} label="接收范围" >
              {getFieldDecorator('type', {
                rules: [{ required: true, message: '请选择接收范围！' }],
                initialValue: 0,
              })(
                <RadioGroup>
                  <Radio value={0} style={radioStyle}>所有人员</Radio>
                  <Radio value={1} style={radioStyle}>指定人员</Radio>
                </RadioGroup>
              )}
              <div>
                {getFieldDecorator('receivers')(    
                  <Select
                    mode="tags"
                    disabled={!getFieldValue('type')}
                    placeholder="请下拉选择"
                    style={posi}
                    optionFilterProp='children'
                    showSearch
                  >
                    {children}
                  </Select>
                )}
              </div>
            </FormItem>
          </Form>
        </div>
        <div>
          <Button onClick={()=>remove(activeKey)} style={{marginRight:10, marginTop:30,height:28}}>取消</Button><Button onClick={this.onSubmit} type="primary">保存</Button>
        </div>
      </div>
    )
  }
}

const CreateNotice = Form.create()(CreateNote);
export default CreateNotice;

