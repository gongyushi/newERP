import React from 'react';
import {
  Tabs,
  Input,
  Button,
  Modal,
  Icon,
  message,
  Table,
  Radio,
  Tree,
  Form,
  Select,
} from 'antd';
import { connect } from 'dva';
import { erpPost } from '../../services/ajax';
import Search from './public/organzitionSearch';
import styles from './organization.less';
import OrganizationDetail from './organizationDetail';
import DeleteConfirmModal from '../../components/DeleteConfirm';

const { TabPane } = Tabs;
const { TreeNode } = Tree;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { Option } = Select;
// 渲染到页面
class TimeRelatedForm extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      organEdit: false, // 修改判断
      orgId: '', // 组织架构列表获取id
      organKey: '', // 组织架构选中key
      orgGetAll: [],
      parent_name: '',
      title: '',
      personList: [], // 所属机构人员
      addOrEdit:0,
      panes: [{ title: '组织架构', content:'', key: '1', closable: false }],
      activeKey:'1',
      page: {
        // defaultCurrent: 1,  // 默认的当前页数
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
        // showQuickJumper:true,
      },
      keyword:{
        key:'',
        value:'',
        enable:'',
        role_id:'',
      },
      visible: false,
      organAdd: {
        name: '新增人员',
        key: '3',
        organName: '公司编码',
        organNameVal: '',
        organCode: '公司名称',
        organCodeVal: '',
      },
      data: [],
      columns: [
        {
          title: '用户名',
          dataIndex: 'username',
          key: 'username',
          className: 'width180',
        },
        {
          title: '姓名',
          dataIndex: 'real_name',
          key: 'real_name',
          className: 'width180',
          // render: text => <a href="#">{text}</a>,
        },

        {
          title: '部门角色',
          dataIndex: 'department',
          key: 'department',
          className: 'width180',
          render: (text, record) => {
            const orgRole=[];
            if (record.org_role_arr) {
              record.org_role_arr.map(val => {
                const arr=[];
                if (val.role_arr) {
                  val.role_arr.map(value => {
                    if (value.role_name){
                      arr.push(value.role_name)
                    }
                    return value
                  })
                }
                if (val.org_name){
                  orgRole.push(`${val.org_name}:${arr.join('、')}`)
                }
                return val
              })
            }
            
            return(
              <div>
                {orgRole ? orgRole.join('; '):null}
              </div>
            )
          },
        },
        {
          title: '联系电话',
          dataIndex: 'phone',
          key: 'phone',
          className: 'width180',
          render: (text, record) => {
            return this.state.organEdit ? (
              <Input
                defaultValue={text}
                name="phone"
                onChange={this.organTableIndex.bind(this, record.person_id)}
              />
            ) : (
                text
              );
          },
        },
        {
          title: '账户状态',
          dataIndex: 'account_status',
          key: 'account_status',
          className: 'width180',
          render: (text, val) => {
            return (
              <p
                onClick={() => {
                  if (val.ENABLE_NO === 1) {
                    erpPost('enable', { enable: val.enable, ENABLE_NO: 0 }, res => {
                      this.organTableList(this.state.orgId, this.state.page, this.state.orders, this.state.keyword)
                      message.success(res.data.msg);
                    });
                  } else if (val.ENABLE_YES === 0) {
                    erpPost('enable', { enable: val.enable, ENABLE_YES: 1 }, res => {
                      message.success(res.data.msg);
                      this.organTableList(this.state.orgId, this.state.page, this.state.orders, this.state.keyword)
                    });
                  }
                }}
              >
                {val.enable === 0 ? '启用' : '禁用'}
                {/* <Button size='small' type="primary" className='buttonBul' ghost>
                  
                </Button> */}
              </p>
            );
          },
        },
        {
          title: '操作',
          key: 'action',
          className: 'width180',
          render: (text, val) => {
            return (
              <p onClick={this.addPersonDetail.bind(this, val.id)}>
                <Button size="small" type="primary">
                  编辑
                </Button>
              </p>
            );
          },
        },
      ],
    };
  }
  componentDidMount() {
    this.getPerson(); // 获取组织架构图
    this.organTableList(this.state.orgId, this.state.page, this.state.orders, this.state.keyword); // 组织架构列表获取
  }
  componentWillReceiveProps(nextProps){
    if (nextProps.organList){
      this.setState({
        orgGetAll: nextProps.organList,
      })
    }
    if (nextProps.personList){
        this.setState({
          orders: nextProps.personList.order,
          page: nextProps.personList.page,
          data: nextProps.personList.data,
        });
    }
   
  }
  
  // 组织架构-选择 树形控件
  onSelect = async (selectedKeys, info) => {
    if (info.selectedNodes[0]) {
      if (info.selectedNodes[0].props.dataRef) {
        // this.setState({
        //   parentId: info.selectedNodes[0].props.dataRef.org_id,
        // });
        // this.organTableList(info.selectedNodes[0].props.dataRef.org_id); // 组织架构列表获取
      }
      
    }
    if (selectedKeys.length!==0){
      this.organTableList(Number(selectedKeys[0]) === 0 ? '' : selectedKeys[0], this.state.page, this.state.orders, this.state.keyword); // 组织架构列表获取
      await this.setState({
        organKey: Number(selectedKeys),
        // panes: [{ title: '组织架构', content: this.organList(), key: '1', closable: false }],
      });
    }
    
  };
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.organTableList(this.state.orgId, pageNumber, order,this.state.keyword); // 组织架构列表获取
  };
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
   // 获取组织名称
  getOrgParentName = (id,name) => {
    erpPost('organization/detail', { id }, res => {
      this.setState({
        parent_name: res.data.data.org_name,
      });
      this.props.form.setFieldsValue({parent:res.data.data.org_name,org_name:name});
    });
  }
  // 获取组织架构图
  getPerson = () => {
    this.props.dispatch({
      type: 'company/fetchOrganList',
    });
  };
  // 组织架构列表
  organTableList = (id, pageNumber, orders,key) => {
    const can = {
      page: pageNumber,
      order: orders,
      org_id: id,
      key: key.key,
      value: key.value,
      enable: key.enable,
      role_id: key.role_id,
    };
    this.props.dispatch({
      type: 'company/fetchPersonList',
      payload: can,
    });
  };

  // 添加人员/查看人员详情
  addPersonDetail = (id, e) => {
    e.preventDefault();
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({
      title: id ? '编辑用户信息' : '新增用户信息',
      content: (
        <OrganizationDetail id={id} handleCancel={this.remove} activeKey={activeKey} />
      ),
      key: activeKey,
    });
    this.setState({ panes, activeKey });
  };
  add = () => {
    const { panes } = this.state.panes;
    const activeKey = `newTab${this.newTabIndex++}`;
    panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
    this.setState({ panes, activeKey });
  };

  remove = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey });
    this.organTableList(this.state.orgId, this.state.page, this.state.orders, this.state.keyword); // 组织架构列表获取
  };
  // 保存
  organKeep = () => {
    erpPost('person/edit', { attribute: JSON.stringify(this.state.data) }, res => {
      if (res.data.code === 1) {
        message.success('保存成功');
        this.organTableList(this.state.orgId, this.state.page, this.state.order); // 组织架构列表获取
        this.setState({
          organEdit: false,
        });
      }
    });
    this.setState(
      {
        organEdit: false,
      },
      () => {
        this.setState({
          panes: [{ title: '组织架构', content: this.organList(), key: '1', closable: false }],
        });
      }
    );
  };
  // 取消
  organCance = () => {
    this.setState(
      {
        organEdit: false,
      },
      () => {
        this.setState({
          panes: [{ title: '组织架构', content: this.organList(), key: '1', closable: false }],
        });
      }
    );
  };
  // 搜索
  handleSearch = (value) => {
    console.log(value,'valuevaluevalue')
    this.organTableList(this.state.orgId, this.state.page, this.state.orders,value); // 组织架构列表获取
  };

  // 组织架构列表修改
  organTableIndex = (record, event) => {
    const obj = this.state.data.map(val => {
      const item = { ...val };
      if (item.person_id === record) {
        item[event.target.name] = event.target.value;
      }
      return item;
    });
    this.setState({
      data: obj,
    });
  };

  // 组织架构列表   //触碰下拉列表
  organList = () => {
    const { data, page, columns, orgGetAll } = this.state;
    const { tableLoading}=this.props;
    const hiddenFirst=true;
    const hiddenSecond = true;
    return (
      <div className={styles.organization}>
        <div className={styles.organTop}>
          <div className={styles.organFun}>
            <div style={{ float:"left" }}>
              <Search
                hiddenFirst={hiddenFirst}
                hiddenSecond={hiddenSecond}
                prompt="请输入搜索"
                search={this.handleSearch}
              />
            </div>
            <p style={{float:'right'}}>
              <Button type="primary" onClick={this.addPersonDetail.bind(this, 0)}>
                <Icon type="plus" style={{ fontSize: 18 }} />
                新增人员
              </Button>
            </p>
          </div>
        </div>
        <div className={styles.organContent}>
          <div className={styles.organLeft}>
            {/* <OrganLeft orgGetAll={this.state.orgGetAll} /> */}
            <div className={styles.organLeftBox}>
              <p className={styles.organLeftTitle}>组织架构关系</p>
              <div className={styles.organTree} style={{ height: 546, overflow: 'auto' }}>
                {
                  orgGetAll.length !== 0 && (
                    <Tree
                      showIcon
                      defaultExpandAll
                      style={{ marginTop: 50 }}
                      showLine
                      onSelect={this.onSelect}
                      // autoExpandParent
                      // defaultExpandParent
                    >
                      {this.renderTreeNodes(orgGetAll)}
                    </Tree>
                  )
                }
              </div>
            </div>
          </div>
          <div className={styles.organRight}>
            {/* <OrganRight /> */}
            <Table
              rowKey="id"
              columns={columns}
              dataSource={data}
              onChange={this.onTableChange}
              loading={tableLoading}
              pagination={page}
            />
          </div>
        </div>
      </div>
    );
  };
 
  // 添加组织显示按钮
  showModal = (parent_name,org_id,editType,title,personList,parent_id,type,leader_id) => {    // type=0 新增  type=1 编辑
    this.setState({
      visible: true,
      org_id,
      addOrEdit: editType,
      title,
      personList,
    });
    console.log('parent_name','org_id','editType','title','personList','parent_id','type','leader_id')
    console.log(parent_name,org_id,editType,title,personList,parent_id,type,leader_id)
    if(editType === 1){
      console.log(1)
      if(parent_id === 0){
        this.props.form.setFieldsValue({type,parent: this.state.orgGetAll[0].enter_name,org_name:parent_name,leader_id});
        this.setState({
          parent_name: this.state.orgGetAll[0].enter_name,
        });
      }else{
        this.getOrgParentName(parent_id,parent_name);
      }
    }else{
      console.log(0)
      this.props.form.setFieldsValue({parent:parent_name,org_name:'',type:0,leader_id:''});
      this.setState({
        parent_name,
      });
    }
  };
  handleCancel = () => {
    this.setState({
      visible: false,
      org_id: '',
      parent_name: '',
    });
    this.props.form.resetFields(['parent','org_name','type','leader_id',[]]);
  };

  // 弹框提交
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.state.addOrEdit === 0){
          values.parent = undefined;
          values.parent_id = this.state.org_id ? this.state.org_id : undefined;
          erpPost('organization/add', values, res => {
            message.success(res.data.msg);
            this.getPerson();
            this.handleCancel();
          });
        } else if (this.state.addOrEdit === 1){
          // 编辑
          values.parent = undefined;
          values.org_id = this.state.org_id;
          erpPost('organization/edit',{...values},()=>{
            message.success('修改成功',2);
            this.getPerson();
            this.handleCancel();
          });
        }
      }
    });
  };
  // onChange事件
  organAddChange = (filed, value) => {
    const organAdd = { ...this.state.organAdd };
    organAdd[filed] = value;
    this.setState({ organAdd });
  };
  // 提交
  check = () => {
    this.props.form.validateFields(err => {
      if (!err) {
        console.info('success');
      }
    });
  };
  // 组织架构-结构
  renderTreeNodes = data => {
    return data.map((item) => {
      return (
        <TreeNode
          // icon={<Icon type="smile-o" />}
          style={{ position: 'relative' }}
          title={
            item.enter_name
              ? `${item.enter_name}  ${item.enter_no}`
              : `${item.org_name} ${item.org_no}`
          }
          key={item.id}
          dataRef={item}
          onClick={() => {
            console.log(item.id);
          }}
          icon={
            item.id === this.state.organKey ? (
              <div>
                <div>
                  {/* 启用禁用 */}
                  {item.id===0 ? null : (
                    <DeleteConfirmModal
                      title='系统提示'
                      content='确认删除？'
                      okText='确 定'
                      onOk={() => {
                        erpPost('organization/delete', { id: item.id}, res => {
                          this.getPerson();
                          message.success(res.data.msg);
                        });
                      }}
                      cancelText='取 消'
                      onCancel={() => true}
                    >
                      <Icon
                        className='disable'
                        type='minus-circle-o'
                        style={{
                          position: 'absolute',
                          right: 15,
                          top: 10,
                          fontSize: 18,
                          borderRadius: '50%',
                        }}
                      />
                    </DeleteConfirmModal>
                  )}
                                
                  {/* 编辑 */}
                  {item.id===0?null:(
                    <Icon
                      // type="usergroup-add"
                      type="form"
                      style={{ position: 'absolute', right: 48, top: 10, fontSize: 18 }}
                      onClick={this.showModal.bind(
                        this,
                        item.org_name,
                        item.id,
                        1,
                        '编辑',
                        item.persons ? item.persons : [],
                        item.parent_id,
                        item.type,
                        String(item.leader_id),
                      )}
                    />
                  )}
                  
                  {/* 添加 */}
                  <Icon
                    type="usergroup-add"
                    onClick={this.showModal.bind(
                      this,
                      item.org_name ? item.org_name : item.enter_name,
                      item.id,
                      0,
                      '新增',
                      item.persons ? item.persons : [],
                      item.id,
                      item.type,
                      String(item.leader_id),
                    )}
                    style={{ position: 'absolute', right: 80, top: 10, fontSize: 18 }}
                  />
                </div>
              </div>
            ) : null
          }
        >
          {item.children ? this.renderTreeNodes(item.children) : null}
        </TreeNode>
      );
    });
  };

  render() {
    const {panes, title, parent_name, personList} = this.state;
    panes[0].content = this.organList();
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 17 },
    };
    const { getFieldDecorator } = this.props.form;
    // const config = {
    //   rules: [{ type: 'object', required: true, message: 'Please select time!' }],
    // };
    return (
      <div className={styles.organ}>
        <Tabs
          hideAdd
          onChange={this.onChange}
          activeKey={this.state.activeKey}
          type="editable-card"
          onEdit={this.onEdit}
        >
          {this.state.panes.map(pane => (
            <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
        <Modal
          title={title}
          visible={this.state.visible}
          onOk={this.handleSubmit}
          maskClosable={false}
          onCancel={this.handleCancel}
          className="organModal"
        >
          <Form>
            <FormItem {...formItemLayout} label="上级组织">
              {getFieldDecorator('parent')(<div style={{fontSize:15}}>{parent_name}</div>)}
            </FormItem>
            <FormItem {...formItemLayout} label="组织名称">
              {getFieldDecorator('org_name', {
                rules: [
                  {
                    required: true,
                    message: '请输入你的组织名称',
                  },
                ],
              })(<Input style={{ width: 200 }} placeholder="请输入你的组织名称" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="性质">
              {getFieldDecorator('type', {
                rules: [
                  {
                    required: true,
                    message: '请选择你的性质!',
                  },
                ],
                initialValue: 0,
              })(
                <RadioGroup>
                  <Radio value={1}>财务</Radio>
                  <Radio value={0}>其他</Radio>
                </RadioGroup>
              )}
            </FormItem>
            {
              this.state.editType === 1 && (
                <FormItem {...formItemLayout} label="负责人">
                  {getFieldDecorator('leader_id')(
                    <Select
                      style={{width:200}}
                      showSearch
                      optionFilterProp='children'
                    >
                      {
                        personList && personList.map( list => <Option key={list.id}>{list.real_name}</Option>)
                      }
                    </Select>
                  )}
                </FormItem>
              )
            }
          </Form>
        </Modal>
      </div>
    );
  }
}
const Organization = Form.create()(TimeRelatedForm);
const mapStateToProps = state => {
  return {
    organList: state.company.organList,
    personList: state.company.personList,
    tableLoading: state.loading.effects['company/fetchPersonList'],
  };
};
export default connect(mapStateToProps)(Organization);
