import React from 'react';
import { Form, Select,  TreeSelect, message } from 'antd';
import { erpPost } from '../../../services/ajax';

const FormItem = Form.Item;
const { Option } = Select;
const { TreeNode } = TreeSelect;


class Demo extends React.Component {
  state = {
    treeData: this.props.treeData,
    personData:[],
    personName:'',
    typeData:[{
      id:'0',
      name:'销售主管',
      key:'主管',
    },{
      id:'1',
      name: '服务人员',
      key: '服务',
    },{
      id:'2',
      name: '销售人员',
      key: '销售',
    }],
  };
  componentDidMount(){
    this.props.onRef(this);
  }
  // 获取人员列表
  getPersons = (children, id) => {
    console.log(children, id)
    if (children && children.length>0){
      return children.filter(item => {
        if (item.id === id) {
          this.setState({
            personData: item.persons,
          });
          this.props.form.setFieldsValue({ person_id:null});
          return item;
        } else {
          return this.getPersons(item.children, id)
        }
      })
    }
  }
  // 添加
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const key = values.station;
        values.position = this.state.typeData[key].key;
        values.real_name = this.state.personName;
        if (values.station === '1'){
          erpPost('commission/person/select', { person_id: values.person_id},()=>{
            this.props.personAdd(values, 1);
          },()=>{
            message.error('此销售人员已被占用，请重新添加',2);
            this.props.personAdd(values, 0);
          })
        }else{
          this.props.personAdd(values, 1);
        }
      }else{
        this.props.personAdd(values, 0);
      }
    });
  };
  personList=()=>{
    erpPost('organization/person/index', {}, res => {
      console.log(res)
      this.setState({
        personData: res.data.data,
      });
    });
  }
  
 
  JudgePerson =(selectPerson,val) => {
    const tmp = selectPerson.filter(sel => sel.person_id === val.id);
    if(tmp.length){
      return false;
    }
    return true;
  }
   // 组织架构-结构
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
  render() {
    const { treeData, typeData } = this.state;
    let { personData } = this.state;
    const { selectPerson } = this.props;
    personData = ( personData.length && selectPerson.length ) 
      ? personData.filter(val => this.JudgePerson(selectPerson,val)) 
      : personData;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Form>
        <FormItem {...formItemLayout} label="部门">
          {getFieldDecorator(`org_id`, {
            rules: [
              {
                required: true,
                message: '请选择部门部门',
              },
            ],
          })(
            <TreeSelect
              style={{ width: 200 }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择部门"
              treeDefaultExpandAll
              onChange={(key) => {
                this.getPersons(treeData,key)
              }}
            >
              {this.renderTreeNodes(treeData)}
            </TreeSelect>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="人员"
          hasFeedback
        >
          {getFieldDecorator('person_id', {
            rules: [
              { required: true, message: '请选择人员' },
            ],
          })(
            <Select 
              onChange={(val, name) => { 
              this.setState({ personName: name.props.children})
              }} 
              className='width200' 
              placeholder="请选择人员"
              showSearch
              optionFilterProp='children'
            >
              {personData && personData.length>0 && personData.map((val)=>{
                return (
                  <Option key={val.id} value={val.id}>{val.real_name}</Option>
                )
              })} 
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="岗位类型"
          hasFeedback
        >
          {getFieldDecorator('station', {
            rules: [
              { required: true, message: '请选择岗位类型' },
            ],
          })(
            <Select 
              className='width200' 
              placeholder="请选择类型"
              showSearch
              optionFilterProp='children'
            >
              {typeData.map(val=>{
                return(
                  <Option key={val.id} value={val.id}>{val.name}</Option>
                )
              })}
            </Select>
          )}
        </FormItem>
      </Form>

    );
  }
}
const BonusAddPerson = Form.create()(Demo);
export default BonusAddPerson;
