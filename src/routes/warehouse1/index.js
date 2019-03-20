import React from 'react';
import {
  Button,
  Table,
  Form,
  Modal,
  Input,
  Select,
  Icon,
  Tabs,
  Cascader,
  TreeSelect,
} from 'antd';
import { erpPost } from '../../services/ajax';
import Prompt from '../../components/Prompt';
import DeleteConfirmModal from '../../components/DeleteConfirm';
import PermissionButton from '../../components/PermissionButton';
import { Urls, getPageState, getOrderState } from '../../utils/utils';

require('./list.less');

const FormItem = Form.Item;
const { Option } = Select;
const { TreeNode } = TreeSelect;
const { TextArea } = Input;
const { TabPane } = Tabs;
let count = 0;

// 仓库类型对照表
const storeType = ['自有仓库','FBA仓库'];

class WareHouse extends React.Component {
  state = {
    columns: [],
    list: [],
    storeVisible: false,
    title: '',
    transfers:[],
    defaultShow: [], // 默认按钮是否显示
    loading: false,
    id: '', // 编辑时对应仓库id
    areaList: [], // 国家省市列表
    orgList: [], // 组织列表
    dialCodeList: [], // 国际电话号码前缀
    page: getPageState(this.props),
    orders: getOrderState(this.props),
    activeKey: this.props.activeKey,
  };
  componentDidMount() {
    this.initColumns();
    this.getList();
  }
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.getList();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };
  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextState.search) !== JSON.stringify(this.state.search) ||
      JSON.stringify(nextState.orders) !== JSON.stringify(this.state.orders) ||
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    ){
      this.getList();
    }
  };
  getList = () => {
    const { page, orders } = this.state;
    erpPost('warehouse/index',{page,orders},res => {
      this.setState({
        list: res.data.data,
        page: res.data.page,
      });
    });
  }
  // 获取仓库详细信息
  getStoreMessage = (id) => {
    if( id !== 0 ){
      erpPost('warehouse/detail',{warehouse_id: id},res=>{
        // 对象转数组过滤
        let tmp = [res.data.data];
        tmp = tmp.map(data => this.setMessageData({...data}));
        this.props.form.setFieldsValue({...tmp[0]});
      });
    }
  }
  // 获取仓库调拨周期列表
  getWarehouseRequisition = (id) => {
    if(id !== 0){
      erpPost('warehouse/get-warehouse-requisition',{warehouse_id: id},res=>{
        const transfer = res.data.data.map(data => this.handleRequisitionData({...data}));
        const keys = [];
        const { defaultShow } = this.state;
        for(let i = 0; i < transfer.length; i ++){
          keys.push(i);
          if(transfer[i].is_default_requisition_warehouse === 0){
            defaultShow.push(false);
          }else{
            defaultShow.push(true);
          }
        }
        this.setState({
          transfers: transfer,
          defaultShow,
        });
        console.log('keys',keys)
        this.props.form.getFieldDecorator('keys', { initialValue: keys });
      });
    }else{
      this.props.form.getFieldDecorator('keys', { initialValue: [] });
    }
  }
  // 获取级联国家省市列表
  getAreaList = () => {
    erpPost('index/area/index',{},res => {
      this.setState({
        areaList: res.data.data,
      });
    });
  }

  // 获取组织列表
  getOrgByList = () => {
    erpPost('organization/index',{},res => {
      this.setState({
        orgList: res.data.data,
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
  // 过滤仓库详情信息数据
  setMessageData = ({warehouse_no,warehouse_name,type,linkman,phone,country_id,province_id,org_id,
    city_id,area_id,address,en_address,capacity,cost,air_transport_days,shipping_days,remark,...data}) => {
    const area = [];
    area.push(country_id);
    area.push(province_id);
    area.push(city_id);
    area.push(area_id);
    type = String(type);
    org_id = String(org_id);
    return ({warehouse_no,warehouse_name,type,linkman,phone,area,address,en_address,capacity,
      cost,air_transport_days,shipping_days,remark,org_id});
  }
  // 生成树
  setTreeNodes = (data) => {
    return data.map(item => {
      if(item.children){
        return(
          <TreeNode title={item.org_name} value={String(item.id)} key={item.id} dataRef={item}>
            {this.setTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.org_name} value={String(item.id)} key={item.id} dataRef={item} />;
    });
  }
  // 处理仓库调拨周期数据（过滤）
  handleRequisitionData = ({requisition_warehouse_id,requisition_days,is_default_requisition_warehouse,...data}) => {
    return ({requisition_warehouse_id,requisition_days,is_default_requisition_warehouse});
  }
  initColumns = () => {
    const columns = [
      {
        title: '仓库编号',
        dataIndex: 'warehouse_no',
        key: 'warehouse_no',
        width: 150,
      },
      {
        title: '仓库名称',
        dataIndex: 'warehouse_name',
        key: 'warehouse_name',
        width: 200,
      },
      {
        title: '仓库类型',
        dataIndex: 'type',
        key: 'type',
        width: 150,
        render: value => (storeType[value]),
      },
      {
        title: '负责人',
        dataIndex: 'linkman',
        key: 'linkman',
        width: 150,
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
        key: 'phone',
        width: 200,
        render: (value,record) => record.phone_country_code ? value : `+${record.phone_country_code} ${value}`,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 200,
        render: (value, record) => (
          <div style={{display:'flex',justifyContent:'center'}}>
            <PermissionButton 
              type='primary' 
              size='small'
              onClick={this.handleOpenModal.bind(this, '编辑仓库', record.warehouse_id)}
              // action='warehouse/update'
              ghost
              style={{marginRight:10}}
            >
              编辑
            </PermissionButton>
            <DeleteConfirmModal
              onOk={this.handleRemove.bind(this, record.warehouse_id)}
            >
              <PermissionButton 
                type='primary' 
                size='small'
                // action='warehouse/delete'
                ghost
              >
                编辑
              </PermissionButton>
            </DeleteConfirmModal>
          </div>
        ),
      },
    ];
    this.setState({ columns });
  }
  // 删除仓库列表数据
  handleRemove = (id) => {
    erpPost('warehouse/delete',{warehouse_id: id},()=>{
      Prompt.success();
      this.getList();
    },()=>{
      // message.error('删除失败',1);
    });
  }
  
  // 开模态框
  handleOpenModal = (title, id) => {
    this.setState({
      storeVisible: true,
      title,
    });
    this.setState({ id });
    this.getStoreMessage(id);
    this.getWarehouseRequisition(id);
    this.getAreaList();
    this.getOrgByList();
    this.getDialCodeList();
  }
  // 关闭模态框
  handleClose = () => {
    this.setState({ 
      storeVisible: false,
      transfers: [],
    });
    this.getList();
    this.props.form.resetFields();
  }
  // 处理提交数据
  handleSubmitData = ({area,transfer,keys,...data}) => {
    const [country_id, province_id, city_id, area_id] = area;
    const requisition = transfer ? transfer.filter(val => val !== null) : [];
    return ({country_id, province_id, city_id, area_id,requisition,...data});
  }
  // 模态框提交
  handleSubmitModal = (id) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({
          loading: true,
        });
        const data = this.handleSubmitData({...values});
        if(id !== 0){
          data.warehouse_id = id;
          // console.log(data);
          erpPost('warehouse/update',data,() => {
            Prompt.success();
            this.setState({
              loading: false,
            });
            this.handleClose();
          },() => {
            // message.error('保存失败',1);
            this.setState({
              loading: false,
            });
          });
        }else{
          erpPost('warehouse/add',data,()=>{
            Prompt.success();
            this.setState({
              loading: false,
            });
            this.handleClose();
          },() => {
            // message.error('保存失败',1);
            this.setState({
              loading: false,
            });
          });
        }
        // console.log('Received values of form: ', values);
      }
    });
  }
  // 删除仓库项
  handleRemoveItem = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    if (keys.length === 1) {
      keys = [];
    }else{
      keys = keys.filter(key => key !== k);
    }
    form.setFieldsValue({
      keys,
    });
  }
  // 新增仓库项
  handleAddItem = () => {
    const { form } = this.props;
    const { defaultShow } = this.state;
    if(count === 0 ){
      count = this.state.transfers.length;
    }
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(count);
    count++;
    form.setFieldsValue({
      keys: nextKeys,
    });
    defaultShow.push(false);
    this.setState({defaultShow});
  }
  handleDefaultWarehouse = (k) => {
    let { defaultShow } = this.state;
    const { form } = this.props;
    defaultShow = defaultShow.map(() => false);
    defaultShow[k] = true;
    this.setState({defaultShow});
    let transfer = form.getFieldValue('transfer');
    transfer = transfer.map(val => {
      val.is_default_requisition_warehouse = 0;
      return val;
    });
    transfer[k].is_default_requisition_warehouse = 1;
    form.setFieldsValue({transfer});
  }
  // 分页
  handleTableChange = (page,filter,sorter) => {
    this.setState({
      orders: {field: sorter.field,order: sorter.order},
      page,
    });
  }
  // 国家省市级联框选择后生成中文地址
  handleCascaderChange = (value,options) => {
    let str = '';
    options.map(val => {
      str += val.area_name;
      return val;
    });
    this.props.form.setFieldsValue({address: str});
  }
  render() {
    const { columns, list, page, storeVisible, id, title, orgList, areaList, defaultShow, loading,transfers, dialCodeList } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    // *********千万不要动***********
    // getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
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
    const formItemSelectLayout = {
      labelCol: {
        xs: { span: 0 },
        sm: { span: 0 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
    };
    
    // 国家过滤
    const filter = (inputValue, path) => {
      return (path.some(option => option.area_name&&option.area_name.indexOf(inputValue) > -1));
    }
    
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
          <PermissionButton 
            type='primary' 
            onClick={this.handleOpenModal.bind(this, '新增仓库',0)}
            // action='warehouse/add'
          >
            新增仓库
          </PermissionButton>
        </div>
        <div>
          <Table 
            columns={columns} 
            dataSource={list} 
            pagination={page} 
            rowKey='warehouse_id' 
            onChange={this.handleTableChange}
          />
        </div>

        {/* 模态框 */}
        <Modal
          visible={storeVisible}
          title={title}
          centered
          onCancel={this.handleClose}
          maskClosable={false}
          className='modal'
          footer={[
            <Button key='2' onClick={this.handleClose} style={{ marginRight: 20 }}>
              取消
            </Button>,
            <Button key='1' loading={loading} type='primary' onClick={this.handleSubmitModal.bind(this,id)}>
              确定
            </Button>,
          ]}
        >
          <Form>
            <Tabs defaultActiveKey='1' tabBarStyle={{marginBottom:0}}>
              {/* 基本信息 */}
              <TabPane tab='基本信息' key='1'>
                <FormItem {...formItemLayout} label="仓库编号">
                  {getFieldDecorator('warehouse_no', {
                    rules: [{
                      required: true,
                      message: '请输入仓库编号',
                    }],
                  })(
                    <Input style={{ width: 250 }} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="仓库名称">
                  {getFieldDecorator('warehouse_name', {
                    rules: [{
                      required: true,
                      message: '请输入仓库名称',
                    }],
                  })(
                    <Input style={{ width: 250 }} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="仓库类型">
                  {getFieldDecorator('type', {
                    rules: [{
                      required: true,
                      message: '请选择仓库类型',
                    }],
                  })(
                    <Select 
                      style={{ width: 250 }}
                      showSearch
                      optionFilterProp='children'
                    >
                      <Option value='0'>自有仓库</Option>
                      <Option value='1'>FBA仓库</Option>
                    </Select>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="归属组织">
                  {getFieldDecorator('org_id', {
                    rules: [{
                      required: true,
                      message: '请选择归属组织',
                    }],
                  })(
                    <TreeSelect
                      showSearch
                      style={{ width: 250 }}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      // placeholder="Please select"
                      // treeDefaultExpandAll
                    >
                      {
                        this.setTreeNodes(orgList)
                      }
                    </TreeSelect>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="联系人">
                  {getFieldDecorator('linkman', {
                    rules: [{
                      required: true,
                      message: '请输入联系人',
                    }],
                  })(
                    <Input style={{ width: 250 }} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="联系电话">
                  {getFieldDecorator('phone', {
                    rules: [
                      {
                        required: true,
                        message: '请输入联系电话',
                      },
                      {
                        pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
                        message: '请检查号码格式',
                      },
                    ],
                  })(
                    <Input
                      style={{ width: 250 }}
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
                              dialCodeList.map(val => <Option key={val.id} value={val.remark}>{val.remark}</Option>)
                            }
                          </Select>
                        )
                      }
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="国家/省份/城市">
                  {getFieldDecorator('area', {
                    rules: [{
                      required: true,
                      message: '请选择国家/省份/城市',
                    }],
                  })(
                    <Cascader 
                      options={areaList} 
                      style={{width:250}} 
                      onChange={this.handleCascaderChange}
                      placeholder='请下拉选择'
                      fieldNames={{label:'area_name', value: 'id' }}
                      showSearch={{filter}}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="中文详址">
                  {getFieldDecorator('address', {
                    rules: [{
                      required: true,
                      message: '请输入中文详址',
                    }],
                  })(
                    <TextArea style={{ width: 200 }} autosize={{minRows: 2}} />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="英文详址">
                  {getFieldDecorator('en_address', {})(
                    <TextArea style={{ width: 250 }} autosize={{minRows: 2}} />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('keys', {})}
                </FormItem>
              </TabPane>
              {/* 调拨仓库 */}
              <TabPane tab='调拨仓库' key='2'>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom:10 }}>
                  <div style={{width: 150, textAlign:'center'}}>调拨仓库</div>
                  <div style={{width: 130, textAlign:'center'}}>调拨周期（天）</div>
                  <div style={{width: 50, textAlign:'center'}} />
                  <div style={{width: 40}} />
                </div>
                { keys && 
                  keys.map((k) => (
                    <div
                      key={k}
                      style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0px,5px', margin: '-25px 5px' }}
                    >
                      <div style={{display:'flex',alignItems:'center'}}>
                        <FormItem {...formItemSelectLayout}>
                          {getFieldDecorator(`transfer[${k}][requisition_warehouse_id]`, {
                            initialValue: k >= transfers.length ? '' : transfers[k].requisition_warehouse_id,
                            rules: [{
                              required: true,
                              message: '请选择仓库',
                            }],
                          })(
                            <Select 
                              style={{ width: 150 }}
                              showSearch
                              optionFilterProp='children'
                            >
                              {
                                list.filter(ops => {
                                  return ops.warehouse_id !== id;
                                }).map(ops => (
                                  <Option value={ops.warehouse_id} key={ops.warehouse_id}>
                                    {ops.warehouse_name}
                                  </Option>
                                ))
                              }
                            </Select>
                          )}
                        </FormItem>
                      </div>
                      <div  style={{display:'flex',alignItems:'center'}}>
                        <FormItem {...formItemSelectLayout}>
                          {getFieldDecorator(`transfer[${k}][requisition_days]`, {
                            initialValue: k >= transfers.length ? '' : transfers[k].requisition_days,
                            rules: [
                              {
                                pattern: /^\d+$/,
                                message: '请输入整数',
                              },
                            ],
                          })(
                            <Input style={{ width: 100 }} />
                          )}
                        </FormItem>
                      </div>
                      <div style={{display:'flex',alignItems:'center'}}>
                        <FormItem {...formItemSelectLayout} >
                          {getFieldDecorator(`transfer[${k}][is_default_requisition_warehouse]`, {
                            initialValue: k >= transfers.length ? 0 : transfers[k].is_default_requisition_warehouse,
                            rules: [
                              {
                                pattern: /^\d+(\.\d+)?$/,
                                message: '请输入数字类型',
                              },
                            ],
                          })(
                            <div style={{display:'flex',alignItems:'center'}}>
                              {
                                defaultShow && defaultShow[k] ? (
                                  <Button size='small' type='primary' style={{backgroundColor:'rgb(255, 153, 0)',color:'#fff'}}>
                                    默认仓库
                                  </Button>
                                ) :(
                                  <Button size='small' type='primary' ghost onClick={this.handleDefaultWarehouse.bind(this,k)}>
                                    设为默认
                                  </Button>
                                ) 
                              }
                              {/* <Input style={{display:'none'}} /> */}
                            </div>
                          )}
                        </FormItem>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-around',alignItems:'center'}}>
                        {/* {
                          transfer && transfer[k].is_default_requisition_warehouse === 0 ?(
                            <Button type='primary' ghost onClick={this.handleDefaultWarehouse.bind(this,k)}>
                              设为默认
                            </Button>
                          ) :(
                            <Button style={{backgroundColor:'rgb(255, 153, 0)',color:'#fff'}}>
                              默认仓库
                            </Button>
                          ) 
                        } */}
                        <Icon
                          type="minus-circle-o"
                          theme="outlined"
                          style={{ color: 'red', fontSize: 20,cursor:'pointer', position: 'relative', top: -5 }}
                          onClick={this.handleRemoveItem.bind(this, k)}
                        />
                      </div>
                    </div>
                  ))
                }
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button type='dashed' style={{ width: '100%' }} onClick={this.handleAddItem}>
                    添加
                  </Button>
                </div>
              </TabPane>
              {/* 其他信息 */}
              <TabPane tab='其他信息' key='3'>
                <FormItem {...formItemLayout} label="仓库容量">
                  {getFieldDecorator('capacity', {
                    rules:[
                      {
                        pattern: /^\d+(\.\d+)?$/,
                        message: '请输入数字类型',
                      },
                    ],
                  })(
                    <Input
                      addonAfter={
                        <div>
                          m<sup>3</sup>
                        </div>
                      }
                      style={{ width: 200 }}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="仓库费用">
                  {getFieldDecorator('cost', {
                    rules: [
                      {
                        pattern: /^\d+(\.\d+)?$/,
                        message: '请输入数字类型',
                      },
                    ],
                  })(
                    <Input
                      addonAfter={
                        <div>
                          元/m<sup>3</sup>/月
                        </div>
                      }
                      style={{ width: 200 }}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="空运周期">
                  {getFieldDecorator('air_transport_days', {
                   rules: [
                    {
                      pattern: /^\d+$/,
                      message: '请输入整数',
                    },
                  ],
                  })(
                    <Input
                      addonAfter='天'
                      style={{ width: 200 }}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="海运周期">
                  {getFieldDecorator('shipping_days', {
                    rules: [
                      {
                        pattern: /^\d+$/,
                        message: '请输入整数',
                      },
                    ],
                  })(
                    <Input
                      addonAfter='天'
                      style={{ width: 200 }}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="备注">
                  {getFieldDecorator('remark',{})(
                    <TextArea style={{ width: 200 }} autosize={{minRows: 2}} />
                  )}
                </FormItem>
              </TabPane>
            </Tabs>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(WareHouse);