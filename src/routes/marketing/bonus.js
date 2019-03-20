import React from 'react';
import { Tabs, 
  Button, 
  Table, 
  Form, 
  message, 
  Icon, 
  Modal,
  Col, 
} from 'antd';
import moment from 'moment';
import styles from './tablepage.less';
import { erpPost } from '../../services/ajax';
import BonusDetail from './public/bonusDetail';
import EditableRow from '../../components/EditableRow';
import BonusAddPerson from './public/bonusAddPerson';
import ShopDeploy from './public/shopDeploy';
import DeleteConfirmModal from '../../components/DeleteConfirm';


require('./tablepage.less');

const { TabPane } = Tabs;
class WrappedApp extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      treeData: [],
      panes: [{ title: '业绩目标', content: '', key: '1', closable: false }],
      activeKey:'1',
      bonusIds: [],
      editingKey: '',
      start_at: (new Date()).toLocaleDateString(), // 开始时间选择
      end_at: (new Date()).toLocaleDateString(), // 结束时间选择
      editDisabled: true,
      loadingTable:true,
      commissionData:[],
      addPersonVisible:false,
      editLoading: false,
      page: {
        pageSize: 10, // 每页显示条数
        total: 0, // 总页数
        current: 1, // 当前页数
        showSizeChanger: true,
      },
      better_target: '',
      target: '',
      selectPerson: [], // 已选中的成员
    };
  }
  componentDidMount() {
    this.getBonusList(this.state.page, this.state.orders);
    this.getOrgnizationList();
  }
  // 页码
  onTableChange = (pageNumber, filters, sorte) => {
    const order = [];
    order.push({ field: sorte.field, order: sorte.order });
    this.getBonusList(pageNumber, order);
  };
  onRef = (ref) => {
    this.child = ref
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };
  // 控制行
  onCellChange = (key, dataIndex, data) => {
    // key 表示哪一行 dataIndex 表示哪一个  data表示值
    const dataSource = [...this.state.commissionData];
    const target = dataSource.find(item => {
      return item.id === key;
    });
    if (target) {
      target[dataIndex] = data;
      this.setState({ commissionData: dataSource });
    }
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  // 业绩目标的列表
  getBonusList = (pageNumber, orders) => {
    // console.log(orders)
    const can = {
      // org_id: this.state.order_id,
      // start_at: this.state.start_at,
      // end_at: this.state.end_at,
      page: pageNumber,
      order: orders,
    };
    erpPost('commission/index', can, res => {
      res.data.data.map(value => {
        value.editable = false;
        return value;
      });
      this.setState({
        commissionData: res.data.data,
        orders: res.data.order,
        loadingTable: false,
        page: res.data.page,
      });
    }, () => {
      this.setState({
        loadingTable: false,
      })
    });
  };
  
  // 获取组织结构列表
  getOrgnizationList = () => {
    erpPost('organization/index',{},res=>{
      const list=res.data.data;
      list[0].id=0;
      list[0].org_name = list[0].enter_name;
      this.setState({
        treeData:list,
      });
    })
  }
  
  
  // 弹框
  showModal = (e,selectPerson) => {
    if (e === 0) {
      this.setState({
        addPersonVisible: true,
        selectPerson,
      });
    }
  }
  
  handleOk = (e) => { // 0 添加第一表单 2 添加第二表单 3 编辑
    this.setState({
      editLoading: true,
    });
    if (e === 0) {
      this.child.handleSubmit();
    }
  }

  handleCancel = (e) => {
    this.setState({
      editLoading: false,
    });
    if (e === 0) {
      this.setState({
        addPersonVisible: false,
      });
    }
  }

  
 
  
  // 发布目标
  bonusCommit = (key) => {
    erpPost('commission/publish', { id:key}, res => {
      message.success(res.data.msg);
      this.getBonusList(this.state.page, this.state.orders);
    });
  };
  // tabs删除
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
  };

  // 新增目标提成
  addBonusList = () => {
    const { commissionData}=this.state;
    const obj = {
      name: '',
      person_number: 0,
      start_at: this.state.start_at,
      end_at: this.state.end_at,
      advert_ratio: 0,
      min_ratio: 0,
      max_ratio: 0,
      ratio: 0,
      target: 0,
      persons:[],
      better_target: 0,
      status: 0,
      finishRate:0,
      editable: true,
    };
    commissionData.unshift(obj);
    this.setState({
      commissionData,
    });
    this.state.editDisabled = !this.state.editDisabled;
  };

  handleChange = (key,value) => {
    this.setState({
      [key]: value,
    });
  };
  // 编辑
  isEditing = record => {
    return record.key === this.state.editingKey;
  };

  edit = value => {
    const { commissionData } = this.state;
    // console.log(value)
    this.state.editDisabled = !this.state.editDisabled;
    commissionData.map(val => {
      if (value.id === val.id) {
        val.editable = true;
      }
      return value;
    });
    this.setState({...value});
  };
  // 行小组的删除
  personDelete=(id,key)=>{
    const list = this.state.commissionData;
    list.map(val=>{
      if(val.id===id){
        val.persons.map((value,index)=>{
          if(index===key){
            val.persons.splice(index,1)
          }
          return value
        });
      }
      return val
    })
    this.setState({
      commissionData:list,
      selectPerson:list,
    });
  }

  // 行小组的添加
  personAdd=(e,a)=>{
    if(a===1){
      const { id } = this.state;
      const list = this.state.commissionData;
      list.map(val => {
        if (val.id === id) {
          val.persons.push(e)
        }
        return val
      })
      this.setState({
        addPersonVisible: false,
        commissionData: list,
        editLoading: false,
      });
    }else{
      this.setState({
        editLoading: false,
      });
    }
    

  }
  // 保存
  save = () => {
    const {org_id,id,name,advert_ratio,min_ratio,ratio,
      max_ratio, target, better_target, commissionData} = this.state;
    let {start_at,end_at} = this.state;
    start_at = moment(start_at).format('YYYY-MM-DD');
    end_at = moment(end_at).format('YYYY-MM-DD');
    const list=commissionData.filter(val=>{
      return val.id===id;
    })
    console.log(list[0].persons)
    const obj = {
      org_id,
      id,
      start_at,
      end_at,
      advert_ratio,
      min_ratio,
      ratio,
      max_ratio,
      target,
      better_target,
      persons: list[0].persons || [],
      name};
    if (id) {
      erpPost('commission/edit', obj, res => {
        message.success(res.data.msg);
        this.setState({
          editDisabled: !this.state.editDisabled,
        });
        this.getBonusList(this.state.page, this.state.orders);
      });
    } else {
      erpPost('commission/add', obj, res => {
        message.success(res.data.msg);
        this.setState({
          editDisabled: !this.state.editDisabled,
        });
        this.getBonusList(this.state.page, this.state.orders);
      });
    }
  };

  cancel = (value) => {
    value.editable = false;
    this.state.editDisabled = !this.state.editDisabled;
    this.state.commissionData.map((res, index) => {
      // console.log(res)
      if (res.id === 0) {
        this.state.commissionData.splice(index, 1);
      }
      return res;
    });
    this.getBonusList(this.state.page, this.state.orders);
  };
  // 业绩提成删除
  bonusDelete = () => {
    if (this.state.bonusIds.length > 0) {
      erpPost('commission/delete', { ids: this.state.bonusIds }, res => {
        message.success(res.data.msg);
        this.getBonusList(this.state.page, this.state.orders);
      });
    } else {
      message.warning('请选择删除行');
    }
  };
  timeChange = (name, e, val) => {
    if (name === 'start_at') {
      this.setState({
        start_at: val,
      });
    } else {
      this.setState({
        end_at: val,
      });
    }
  };
  // 搜索
  searchList = () => {
    this.getBonusList(this.state.page, this.state.orders);
  };
  renderProInfo = () => {
    const { loadingTable, 
      page, 
      editDisabled, 
      commissionData,
      selectPerson,
     } = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRowKeys,selectedRows);
        this.setState({
          bonusIds: selectedRowKeys.join(','),
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    const columns = [
      {
        title: '小组',
        dataIndex: 'org_name',
        className: 'width100',
        render: (text, record) => (
          <EditableRow
            value={record.name}
            type="input"
            onCellChange={this.onCellChange}
            editable={record.editable}
            name='name'
            id={record.id}
            onChange={this.handleChange}
          />
        ),
      },
      {
        title: '成员',
        dataIndex: 'person_count',
        className: 'width100',
        render:(text,record)=>(
          <div style={{maxHeight:120,overflowY:'auto'}}>
            {record.persons&&record.persons.length>0?(
              record.persons.map((val,key)=>{
                return (
                  <div key={String(key)} style={{ marginBottom: 10 }}>
                    <span style={{ width: 72, display: 'inline-block' }}>{`${val.real_name}(${val.position})`}</span>
                    {record.editable?(
                      <Icon
                        style={{ color: '#4ca5ff', cursor: 'pointer' }}
                        type="delete"
                        onClick={this.personDelete.bind(this, record.id, key)}
                      />
                    ):null}
                  </div>
                )
              })
            ):null}
            {record.editable ? (
              <div>
                <b style={{ width: 72, display: 'inline-block' }} />
                <Icon onClick={this.showModal.bind(this, 0,record.persons)} style={{ color: '#4ca5ff', cursor: 'pointer' }} type="plus" />
              </div>
            ) : null}
           
          </div>
        ),
      },
      {
        title: '目标周期',
        dataIndex: 'targetCycle',
        className: 'width230',
        render: (text, record) => (
          <div>
            <Col span={11}>
              <EditableRow
                onCellChange={this.onCellChange}
                value={record.start_at}
                type="time"
                name="start_at"
                editable={record.editable}
                onChange={this.handleChange}
              />
            </Col>
            <Col span={2}>
              <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>-</span>
            </Col>
            <Col span={11}>
              <EditableRow
                onCellChange={this.onCellChange}
                value={record.end_at}
                type="time"
                name="end_at"
                editable={record.editable}
                onChange={this.handleChange}
              />
            </Col>
          </div>
        ),
      },
      {
        title: '目标销售额($)',
        dataIndex: 'targetSales',
        className: 'width120',
        render: (text, record) => (
          <div className="tableLi">
            <div>
              <p style={{width:50}}>目标</p>
              <div>
                <EditableRow
                  value={record.target}
                  type="input"
                  onCellChange={this.onCellChange}
                  name="target"
                  editable={record.editable}
                  id={record.id}
                  onChange={this.handleChange}
                />
              </div>
            </div>
            <div>
              <p style={{width:50}}>超标</p>
              <div>
                <EditableRow
                  value={record.better_target}
                  type="input"
                  onCellChange={this.onCellChange}
                  name="better_target"
                  editable={record.editable}
                  id={record.id}
                  onChange={this.handleChange}
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        title: '提成比例(%)',
        dataIndex: 'commissionRate',
        className: 'width160',
        render: (text, record) => (
          <div className="tableLi">
            <div>
              {
                record.editable ? (
                  <p className='tableLi-p'>
                    最少
                  </p>
                ) : (
                  <p>&lt;{record.target}</p>
                )
              }
              <div>
                <EditableRow
                  value={record.min_ratio}
                  type="input"
                  onCellChange={this.onCellChange}
                  name="min_ratio"
                  editable={record.editable}
                  id={record.id}
                  onChange={this.handleChange}
                />
              </div>
            </div>
            <div>
              {
                record.editable ? (
                  <p  className='tableLi-p'>
                    正常
                  </p>
                ) : (
                  <p>${record.target}-${record.better_target}</p>
                )
              }
              <div>
                <EditableRow
                  value={record.ratio}
                  type="input"
                  onCellChange={this.onCellChange}
                  name="ratio"
                  editable={record.editable}
                  id={record.id}
                  onChange={this.handleChange}
                />
              </div>
            </div>
            <div>
              {
                record.editable ? (
                  <p className='tableLi-p'>
                    超标
                  </p>
                ) : (
                  <p>&gt;{record.better_target}</p>
                )
              }
              <div>
                <EditableRow
                  value={record.max_ratio}
                  type="input"
                  onCellChange={this.onCellChange}
                  name="max_ratio"
                  editable={record.editable}
                  id={record.id}
                  onChange={this.handleChange}
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        title: '广告比例（%）',
        dataIndex: 'advert_ratio',
        className: 'width80',
        render: (text, record) => (
          <EditableRow
            value={text}
            type="input"
            className="width80"
            name="advert_ratio"
            editable={record.editable}
            id={record.id}
            onCellChange={this.onCellChange}
            onChange={this.handleChange}
          />
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        className: 'width80',
        render: (text, record) => (
          <div>
            {text === 0
              ? '待发布'
              : record.status === 1 ? '已发布' : record.status === 2 ? '执行中' : '完结'}
          </div>
        ),
      },
      {
        title: '完成情况',
        dataIndex: 'finishRate',
        className: 'width80',
        render: (text, record)=>(
          <div>{`${record.finishRate.toFixed(2)}%`}</div>
        ),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        className: 'width80',
        render: (text, record) => {
          return (
            <div>
              {record.editable ? (
                <div>
                  <div>
                    <Button
                      onClick={this.save}
                      size="small"
                      type="primary"
                      className="buttonBul"
                      ghost
                    >
                      保存
                    </Button>
                  </div>
                  <div>
                    <DeleteConfirmModal
                      title='系统提示'
                      content='确认取消？'
                      okText='确 定'
                      onOk={this.cancel.bind(this, record)}
                      cancelText='取 消'
                      onCancel={() => true}
                    >
                      <Button size="small" type="primary" className="buttonBul" ghost>
                        取消
                      </Button>
                    </DeleteConfirmModal>
                  </div>
                </div>
              ) : (
                <div>
                  {record.status === 0 ? (
                    <div>
                      <div>
                        {editDisabled ? (
                          <Button
                            onClick={this.edit.bind(this, record)}
                            size="small"
                            type="primary"
                            className="buttonBul"
                            ghost
                          >
                            编辑
                          </Button>
                        ) : (
                          <Button disabled size="small" type="primary" ghost>
                            编辑
                          </Button>
                        )}
                      </div>
                      <div>
                        <Button
                          size="small"
                          type="primary"
                          className="buttonBul"
                          ghost
                          onClick={this.bonusCommit.bind(this, record.id)}
                        >
                          发布
                        </Button>
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              )}
              <div
                onClick={() => {
                  // console.log(record)
                  const { panes } = this.state;
                  const activeKey = `newTab${this.newTabIndex++}`;
                  panes.push({
                    title: '成员提成',
                    content: <BonusDetail commissionid={record.id} />,
                    key: activeKey,
                  });
                  this.setState({ panes, activeKey });
                }}
              >
                {(record.status !== 3 && !record.editable ) ? (
                  <Button size="small" type="primary" className="buttonBul" ghost>
                    成员提成
                  </Button>
                ) : (
                  ''
                )}
              </div>

              {record.status === 3 ? <div>--</div> : ''}
            </div>
          );
        },
      },
    ];
    // const dateFormat = 'YYYY-MM-DD';
    return (
      <div className="proDataWrap">
        <div style={{ margin: '10px 0' }}>
          {editDisabled ? (
            <Button type="primary" size="small" onClick={this.addBonusList}>
              新增目标提成
            </Button>
          ) : (
            <Button type="primary" size="small" disabled>
              新增目标提成
            </Button>
          )}
          <DeleteConfirmModal
            title='系统提示'
            content='确认删除？'
            okText='确 定'
            onOk={this.bonusDelete}
            cancelText='取 消'
            onCancel={() => true}
          >
            <Button
              type="primary"
              style={{ margin: '0 10px' }}
              size="small"
              className="marginR"
            >
              删除
            </Button>
          </DeleteConfirmModal>
          {/* <Time /> */}
          <div style={{float:'right'}}>
            <Button 
              type="primary" 
              size="small"
              onClick={()=>{
                const {panes} = this.state;
                const activeKey = `newTab${this.newTabIndex++}`;
                panes.push({
                  title: '商品调配', content: <ShopDeploy />, key: activeKey });
                this.setState({ panes, activeKey });
              }}
            >
              商品调配
            </Button>
          </div>
        </div>
        <Table
          onChange={this.onTableChange}
          loading={loadingTable}
          pagination={page}
          rowKey="id"
          dataSource={commissionData}
          columns={columns}
          rowSelection={rowSelection}
          className='management table-three-line'
        />
        <Modal
          title='新增成员'
          destroyOnClose='true'
          visible={this.state.addPersonVisible}
          confirmLoading={this.state.editLoading}
          onOk={this.handleOk.bind(this, 0)}
          maskClosable={false}
          onCancel={this.handleCancel.bind(this, 0)}
        >
          <BonusAddPerson
            personAdd={this.personAdd.bind(this)}
            treeData={this.state.treeData}
            selectPerson={selectPerson}
            onRef={this.onRef}
          />
        </Modal>
      </div>
    );
  };
  render() {
    const { panes }=this.state;
    panes[0].content = this.renderProInfo();
    return (
      <div className={styles.competition}>
        <Tabs
          hideAdd
          className="productVariants"
          onChange={this.onChange}
          activeKey={this.state.activeKey}
          type="editable-card"
          onEdit={this.onEdit}
        >
          {this.state.panes.map(pane => (
            <TabPane
              tab={pane.title}
              key={pane.key}
              closable={pane.closable}
              className="proTabs"
              style={{ marginBottom: '0px' }}
            >
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
      </div>
    );
  }
}

const Bonus = Form.create()(WrappedApp);
export default Bonus;
