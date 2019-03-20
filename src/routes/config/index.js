import React from 'react';
import {
  Table,
  Steps,
  Button,
  Divider,
  Input,
  InputNumber,
  Select,
  Modal,
  Icon,
  Row,
  Col,
} from 'antd';
import { erpPost } from '../../services/ajax';
import EditableItem from '../../components/EditableItem';
import Prompt from '../../components/Prompt';
import PermissionButton from '../../components/PermissionButton';

const { Option } = Select;
const { Step } = Steps;

class Configuration extends React.Component {

  state = {
    lists1: [], // 单号规则列表
    lists2: [], // 审核流程列表
    currency: '', // 货币
    timeZone: '', // 时区
    currencys: [], // 货币列表
    timeZones: [], // 时区列表
    columns1: [],
    three_sale_ratio: '', // 三日比率
    seven_sale_ratio: '', // 七日比率
    fifteen_sale_ratio: '', // 十五日比率
    thirty_sale_ratio: '', // 三十天比率
    requisition_interval_days: '', // 提前采购天数
    requisition_safe_days: '', // 调拨提前天数
    purchase_safe_days: '', // 采购备货天数
    purchase_interval_days: '', // 采购安全系数
    loading: false,
    visible: false,
    editList: [], // 步骤流程列表
    noType: [], // 类型对照表
    personList: [], // 人员列表
    name: '', // 审核流程名称
    type: 0, // 审核流程类型
    id: '', // 审核流程ID
    buttonShow: 0, // 1、2时分别显示保存和取消按钮
    buttonLoading: false, // 加载
  }
  componentDidMount() {
    // 加载表头
    this.getTableColumns();
    // 加载审核流程数据
    this.getAuditFlowList();
    // 加载全局配置列表
    this.getGlobalConfigList();
    // 字典加载
    this.getDictionary();
  }
  // 保存编辑单元格
  onChange = (odd_rule_id, filed, value) => {
    // 保存坐标的值
    if (value) {
      const data = { odd_rule_id, filed, value };
      erpPost('config/edit-odd-rule', data, () => {
        Prompt.success();
      });
    }
    // 获取列表，刷新
  }
  getGlobalConfigList = () => {
    erpPost('config/index', {}, res => {
      const { three_sale_ratio, seven_sale_ratio, requisition_interval_days,
        requisition_safe_days, purchase_safe_days, purchase_interval_days,
        fifteen_sale_ratio, thirty_sale_ratio } = res.data.data.sale_setting;
      this.setState({
        timeZone: res.data.data.base.local_time_zone,
        currency: res.data.data.base.purchase_currency,
        lists1: res.data.data.oddRule.map(data => this.handleConfigData({ ...data })),
        three_sale_ratio,
        seven_sale_ratio,
        fifteen_sale_ratio,
        thirty_sale_ratio,
        requisition_interval_days,
        requisition_safe_days,
        purchase_safe_days,
        purchase_interval_days,
      });
    });
  }
  getDictionary = () => {
    erpPost('index/dictionary/index', { keyword: 'currency' }, res => {
      this.setState({
        currencys: res.data.data.children,
      });
    });
    erpPost('index/dictionary/index', { keyword: 'time_zone' }, res => {
      this.setState({
        timeZones: res.data.data.children,
      });
    });
  }
  // 获取审核列表
  getAuditFlowList = () => {
    erpPost('audit-flow/index', {}, res => {
      this.setState({
        lists2: res.data.data.map(data => this.handleStepData({ ...data })),
      });
    });
  }
  getPersonList = () => {
    erpPost('organization/person/index', {}, res => {
      this.setState({
        personList: res.data.data.map(data => this.handlePersonData({ ...data })),
      });
    });
  }
  // 获取审核流程详情
  getAuditFlowDetailList = (id) => {
    erpPost('audit-flow/detail', { audit_flow_id: id }, res => {
      this.setState({
        type: res.data.data.type,
        name: res.data.data.name,
        editList: res.data.data.content.map(val => this.handleAuditDetailData({ ...val })),
      });
    });
  }
  getTableColumns() {
    const columns1 = [
      {
        title: '编号类型',
        dataIndex: 'type',
        key: 'type',
        width: 200,
      },
      {
        title: '固定前缀',
        dataIndex: 'prefix',
        key: 'prefix',
        width: 200,
        render: (value, record) => (
          <EditableItem
            value={value}
            onChange={this.onChange.bind(this, record.id, 'prefix')}
            width='150'
          />
        ),
      },
      {
        title: '固定后缀',
        dataIndex: 'suffix',
        key: 'suffix',
        width: 200,
        render: (value, record) => (
          <EditableItem
            value={value}
            onChange={this.onChange.bind(this, record.id, 'suffix')}
            width='150'
          />
        ),
      },
      {
        title: '起始编号',
        dataIndex: 'start_no',
        key: 'start_no',
        width: 200,
        render: (value, record) => (
          <EditableItem
            value={value}
            onChange={this.onChange.bind(this, record.id, 'start_no')}
            width='150'
          />
        ),
      },
      {
        title: '结束编号',
        dataIndex: 'end_no',
        key: 'end_no',
        width: 200,
        render: (value, record) => (
          <EditableItem
            value={value}
            onChange={this.onChange.bind(this, record.id, 'end_no')}
            width='150'
          />
        ),
      },
    ];
    const noType = [
      {
        type: 0,
        name: '产品ID',
      },
      {
        type: 1,
        name: '调拨单号',
      },
      {
        type: 2,
        name: '采购单号',
      },
      {
        type: 3,
        name: '入库单号',
      },
      {
        type: 4,
        name: '出库单号',
      },
    ];
    this.setState({ columns1, noType });
  }
  handleConfigData = ({ type, perfix, suffix, ...data }) => {
    const { noType } = this.state;
    type = noType[type].name;
    suffix = suffix || '---';
    perfix = perfix || '---';
    return ({ type, perfix, suffix, ...data });
  }
  // 获取人员列表值处理
  handlePersonData = ({ real_name, id, ...data }) => {
    return ({ real_name, id });
  }
  // 处理步骤条数据
  handleStepData = ({ content, ...data }) => {
    content[content.length] = {
      id: content.length,
      node_name: '终结',
      actor: '',
      condition: '',
    };
    return ({ content, ...data });
  }
  // 提交新建审核流程值处理 
  handleNewAuditData = ({ keyword, formula, amount, idx, person_ids, ...data }) => {
    let condition = { keyword, formula, amount };
    const id = idx + 1;
    person_ids = person_ids.join(',');
    if (idx === 0) {
      condition = {
        keyword: '',
        formula: '',
        amount: '',
      };
    }
    return ({ condition, id, person_ids, ...data });
  }
  // 审核流程详情数据处理
  handleAuditDetailData = ({ condition, ...data }) => {
    const { formula, amount, keyword } = condition;
    return ({ formula, amount, keyword, ...data });
  }

  // 根据id获取name 时区货币
  handleExchange = (array, id) => {
    for (const key of array) {
      if (key.id === id) {
        return key.remark;
      }
    }
  }
  handleSave = (num) => {
    // 顺序由上到下（0...）
    const { currency, timeZone, three_sale_ratio, seven_sale_ratio, requisition_safe_days,
      fifteen_sale_ratio, thirty_sale_ratio, requisition_interval_days, purchase_safe_days,
      purchase_interval_days } = this.state;
    this.setState({
      buttonLoading: true,
    });
    if (num === 1) {
      if (currency && timeZone) {
        const data = {
          purchase_currency: currency,
          local_time_zone: timeZone,
        };
        erpPost('config/edit-base-setting', data, () => {
          Prompt.success();
          this.setState({
            buttonLoading: false,
            buttonShow: 0,
          });
        }, () => {
          this.setState({
            buttonLoading: false,
          });
        });
      }
    } else {
      const data = {
        three_sale_ratio: Number(three_sale_ratio),
        seven_sale_ratio: Number(seven_sale_ratio),
        fifteen_sale_ratio: Number(fifteen_sale_ratio),
        thirty_sale_ratio: Number(thirty_sale_ratio),
        requisition_safe_days: Number(requisition_safe_days),
        requisition_interval_days: Number(requisition_interval_days),
        purchase_safe_days: Number(purchase_safe_days),
        purchase_interval_days: Number(purchase_interval_days),
      };
      if ((data.three_sale_ratio + data.seven_sale_ratio + data.fifteen_sale_ratio + data.thirty_sale_ratio) !== 100) {
        Prompt.error({content:'日均销量比率之和必须等于100%'});
        this.setState({
          buttonLoading: false,
        });
        return;
      }
      erpPost('config/edit-daily-sale', data, () => {
        Prompt.success();
        this.setState({
          buttonLoading: false,
          buttonShow: 0,
        });
      }, () => {
        this.setState({
          buttonLoading: false,
        });
      });
    }
  }
  handleClose = () => {
    this.setState({
      buttonShow: 0,
    });
    this.getGlobalConfigList();
  }
  handleEdit = (num) => {
    this.setState({
      buttonShow: num,
    });
  }

  handleChange = (key, value) => {
    this.setState({
      [key]: value,
    });
  }
  // 新增审核流程-编辑弹框
  handleOpen = (id) => {
    this.setState({
      visible: true,
    });
    this.getPersonList();
    // 判断新增还是编辑，然后加载数据
    this.setState({ id });
    if (id !== 0) {
      this.getAuditFlowDetailList(id);
    } else {
      const editList = [
        {
          node_name: '已提交',
          person_ids: this.state.personList,
        },
        {
          node_name: '主管审核',
          keyword: 'amount',
          formula: '2',
          amount: '0',
          person_ids: this.state.personList,
        },
        {
          node_name: 'BOSS审核',
          keyword: 'amount',
          formula: '2',
          amount: '0',
          person_ids: this.state.personList,
        },
      ];
      this.setState({ editList });
    }
  }



  handleCancel = () => {
    this.setState({
      loading: false,
      visible: false,
    });
    // 清除数据
    this.setState({
      personList: [],
      editList: [],
      name: '',
      id: '',
    });
    this.getAuditFlowList();
  }


  // 新增审核流程--编辑--保存
  handleOk = () => {
    this.setState({
      loading: true,
    });
    const editList = this.state.editList.map((data, idx) => this.handleNewAuditData({ idx, ...data }));
    const { name, type, id } = this.state;
    if (editList.length > 0 && name) {
      const data = {
        name,
        content: editList,
        type,
      };
      if (id !== 0) {
        data.id = id;
        erpPost('audit-flow/edit', data, () => {
          Prompt.success();
          this.handleCancel();
        }, () => {
          this.setState({
            loading: false,
          });
        });
      } else {
        erpPost('audit-flow/create', data, () => {
          Prompt.success();
          this.handleCancel();
        }, () => {
          this.setState({
            loading: false,
          });
        });
      }
    } else {
      Prompt.warning({content:'请填写名称'});
      this.setState({
        loading: false,
      });
    }
  }

  handleRemove = (audit_flow_id) => {
    erpPost('audit-flow/delete', { audit_flow_id }, () => {
      Prompt.success();
      this.getAuditFlowList();
    });
  }
  //  新增审核流程--编辑--输入框change事件
  handleModalChange = (key, idx, e) => {
    console.log(e);
    const { editList } = this.state;
    if (e instanceof Array || typeof e === 'number' || typeof e === 'string') {
      editList[idx][key] = e;
    } else {
      editList[idx][key] = e.target.value;
    }
    this.setState({ editList });
  }

  handleNameChange = (key, e) => {
    this.setState({
      [key]: e.target.value,
    });
  }
  //  新增审核流程--编辑-添加
  handleAddModal = () => {
    const { editList } = this.state;
    editList.push({
      node_name: '主管审核',
      condition: {
        keyword: 'amount',
        formula: '2',
        amount: '0',
      },
      person_ids: [],
    });
    this.setState({ editList });
  }
  //  新增审核流程--编辑-移除
  handleRemoveModal = (idx) => {
    const { editList } = this.state;
    editList.splice(idx, 1);
    this.setState({ editList });
  }
  // 删除提示框
  handleConfirm = (id) => {
    const self = this;
    Modal.confirm({
      centered: true,
      title: '警告',
      content: '请确定是否要删除',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        self.handleRemove(id);
      },
    });
  }
  render() {
    const { currency, timeZone, currencys, timeZones, lists1, columns1, three_sale_ratio,
      seven_sale_ratio, fifteen_sale_ratio, thirty_sale_ratio, personList, name,
      lists2, visible, loading, editList, requisition_interval_days, buttonShow, buttonLoading,
      requisition_safe_days, purchase_safe_days, purchase_interval_days } = this.state;
    return (
      <div>
        {/* 基础设置 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0 10px 0' }}>
            <div>
              <span style={{ textAlign: 'center', lineHeight: '32px' }}>
                基础配置
              </span>
            </div>
            <div>
              {
                buttonShow === 1 ? (
                  <div>
                    <Button style={{ marginRight: 5 }} onClick={this.handleClose}>
                      取消
                    </Button>
                    <Button loading={buttonLoading} type='primary' onClick={this.handleSave.bind(this, 1)}>
                      保存
                    </Button>
                  </div>
                ) : (
                  <PermissionButton
                    type='primary'
                    disabled={buttonShow === 2}
                    onClick={this.handleEdit.bind(this, 1)}
                    // action='config/edit-odd-rule'
                  >
                    编辑
                  </PermissionButton>
                )
              }
            </div>
          </div>
          <Divider style={{ margin: 5 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ margin: 20 }}>
              <span style={{ marginRight: 5 }}>
                采购结算货币：
              </span>
              <span>
                {
                  buttonShow === 1 ? (
                    <Select
                      showSearch
                      style={{ width: 200 }}
                      placeholder="请选择货币"
                      optionFilterProp="children"
                      value={currency}
                      onChange={this.handleChange.bind(this, 'currency')}
                      // onFocus={handleFocus}
                      // onBlur={handleBlur}
                      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {
                        currencys && currencys.map(cur => (
                          <Option key={cur.id} value={cur.id}>{cur.remark}</Option>
                        ))
                      }
                    </Select>
                  ) : (
                      this.handleExchange(currencys, currency)
                    )
                }
              </span>
            </div>
            <div style={{ margin: 20 }}>
              <span style={{ marginRight: 5 }}>
                本地时区：
              </span>
              <span>
                {
                  buttonShow === 1 ? (
                    <Select
                      showSearch
                      style={{ width: 200 }}
                      placeholder="请选择时区"
                      optionFilterProp="children"
                      onChange={this.handleChange.bind(this, 'timeZone')}
                      value={timeZone}
                      // onFocus={handleFocus}
                      // onBlur={handleBlur}
                      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {
                        timeZones && timeZones.map(tz => (
                          <Option key={tz.id} value={tz.id}>{tz.remark}</Option>
                        ))
                      }
                    </Select>
                  ) : (
                      this.handleExchange(timeZones, timeZone)
                    )
                }
              </span>
            </div>
          </div>
        </div>
        {/* 单号规则 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0 10px 0' }}>
            <div>
              <span>
                单号规则
              </span>
            </div>
          </div>
          <Divider style={{ margin: 5 }} />
          <Table rowKey='id' dataSource={lists1} columns={columns1} pagination={false} />
        </div>
        {/* 备货参数 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0 10px 0' }}>
            <div>
              <span style={{ textAlign: 'center', lineHeight: '32px' }}>
                备货参数
              </span>
            </div>
            <div>
              {
                buttonShow === 2 ? (
                  <div>
                    <Button style={{ marginRight: 5 }} onClick={this.handleClose}>
                      取消
                    </Button>
                    <Button loading={buttonLoading} type='primary' onClick={this.handleSave.bind(this, 2)}>
                      保存
                    </Button>
                  </div>
                ) : (
                  <PermissionButton
                    type='primary'
                    disabled={buttonShow === 1}
                    onClick={this.handleEdit.bind(this, 2)}
                    // action='config/edit-odd-rule'
                  >
                    编辑
                  </PermissionButton>
                )
              }
            </div>
          </div>
          <Divider style={{ margin: 5 }} />
          <div>
            <span style={{ marginRight: 5 }}>日均销量 = </span>
            <span>
              {
                buttonShow === 2 ? (
                  <InputNumber
                    min={0}
                    max={100}
                    value={three_sale_ratio}
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')}
                    onChange={this.handleChange.bind(this, 'three_sale_ratio')}
                  />
                ) : (
                    three_sale_ratio
                  )
              }
            </span>
            <span style={{ marginRight: 5 }}> X 3日均量 + </span>
            <span>
              {
                buttonShow === 2 ? (
                  <InputNumber
                    min={0}
                    max={100}
                    value={seven_sale_ratio}
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')}
                    onChange={this.handleChange.bind(this, 'seven_sale_ratio')}
                  />
                ) : (
                    seven_sale_ratio
                  )
              }
            </span>
            <span style={{ marginRight: 5 }}> X 7日均量 + </span>
            <span>
              {
                buttonShow === 2 ? (
                  <InputNumber
                    min={0}
                    max={100}
                    value={fifteen_sale_ratio}
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')}
                    onChange={this.handleChange.bind(this, 'fifteen_sale_ratio')}
                  />
                ) : (
                    fifteen_sale_ratio
                  )
              }
            </span>
            <span style={{ marginRight: 5 }}> X 15日均量 + </span>
            <span>
              {
                buttonShow === 2 ? (
                  <InputNumber
                    min={0}
                    max={100}
                    value={thirty_sale_ratio}
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')}
                    onChange={this.handleChange.bind(this, 'thirty_sale_ratio')}
                  />
                ) : (
                    thirty_sale_ratio
                  )
              }
            </span>
            <span style={{ marginRight: 5 }}> X 30日均量 </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, width: '80%', minWidth: 992 }}>
            <div>
              <span style={{ marginRight: 5 }}>调拨安全天数：</span>
              <span>
                {
                  buttonShow === 2 ? (
                    <InputNumber
                      min={0}
                      max={999}
                      value={requisition_safe_days}
                      onChange={this.handleChange.bind(this, 'requisition_safe_days')}
                    />
                  ) : (
                      requisition_safe_days
                    )
                }
              </span>
            </div>
            <div>
              <span style={{ marginRight: 5 }}>调拨间隔天数：</span>
              <span>
                {
                  buttonShow === 2 ? (
                    <InputNumber
                      min={0}
                      max={999}
                      value={requisition_interval_days}
                      onChange={this.handleChange.bind(this, 'requisition_interval_days')}
                    />
                  ) : (
                      requisition_interval_days
                    )
                }
              </span>
            </div>
            <div>
              <span style={{ marginRight: 5 }}>采购安全天数：</span>
              <span>
                {
                  buttonShow === 2 ? (
                    <InputNumber
                      min={0}
                      max={999}
                      value={purchase_safe_days}
                      onChange={this.handleChange.bind(this, 'purchase_safe_days')}
                    />
                  ) : (
                      purchase_safe_days
                    )
                }
              </span>
            </div>
            <div>
              <span style={{ marginRight: 5 }}>采购间隔天数：</span>
              <span>
                {
                  buttonShow === 2 ? (
                    <InputNumber
                      min={0}
                      max={999}
                      value={purchase_interval_days}
                      onChange={this.handleChange.bind(this, 'purchase_interval_days')}
                    />
                  ) : (
                      purchase_interval_days
                    )
                }
              </span>
            </div>
          </div>
        </div>
        {/* 采购单审核流程 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0 10px 0' }}>
            <div>
              <span style={{ textAlign: 'center', lineHeight: '32px' }}>
                采购单审核流程
              </span>
            </div>
          </div>
          <Divider style={{ margin: 5 }} />
          <div>
            <PermissionButton
              type='primary'
              style={{ marginBottom: 5 }}
              onClick={this.handleOpen.bind(this, 0)}
              // action='audit-flow/create'
            >
              新增审核流程
            </PermissionButton>
          </div>
          {/* <Table rowKey='audit-flow-id' columns={columns2} dataSource={lists2} pagination={false} /> */}
          {/* 代替表格（表格内steps会变形） */}
          <div>
            <Row style={{ height: 50, borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center' }}>
              <Col span='6' style={{ display: 'flex', justifyContent: 'center' }}>
                名称
              </Col>
              <Col span='14' style={{ display: 'flex', justifyContent: 'center' }}>
                详情
              </Col>
              <Col span='4' style={{ display: 'flex', justifyContent: 'center' }}>
                操作
              </Col>
            </Row>
            {
              lists2.map((val, idx) => (
                <Row
                  key={val.audit_flow_id}
                  style={{ borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', marginTop: 5 }}
                >
                  <Col span='6' style={{ display: 'flex', justifyContent: 'center' }}>
                    {val.name}
                  </Col>
                  <Col span='14' style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
                    <Steps progressDot current={val.content.length}>
                      {
                        val.content.map(al => {
                          return (
                            <Step
                              title={al.node_name}
                              key={`${al.node_name}${al.audit_flow_id}`}
                              description={(
                                <div>
                                  <span>{al.actor}</span>
                                  <br />
                                  <span>{al.condition}</span>
                                </div>
                              )}
                            />
                          )
                        })
                      }
                    </Steps>
                  </Col>
                  <Col span='4' style={{ display: 'flex', justifyContent: 'center' }}>
                    <PermissionButton
                      type='primary' 
                      ghost 
                      size='small' 
                      onClick={this.handleOpen.bind(this, val.audit_flow_id)}
                      style={{marginRight:10}}
                      // action='audit-flow/edit'
                    >
                      编辑
                    </PermissionButton>
                    {
                      idx !== 0 &&
                      (
                        <PermissionButton
                          type='primary' 
                          ghost 
                          size='small' 
                          onClick={this.handleConfirm.bind(this, val.audit_flow_id)}
                          // action='audit-flow/delete'
                        >
                          删除
                        </PermissionButton>
                      )
                    }
                  </Col>
                </Row>
              ))
            }
          </div>
        </div>

        {/* 对话模态框 */}
        <Modal
          title='审核流程编辑'
          visible={visible}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          maskClosable={false}
          footer={[
            <Button key="back" onClick={this.handleCancel}>返回</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
              保存
            </Button>,
          ]}
          width='650px'
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <span>流程名称：</span>
              <Input
                value={name}
                placeholder='请输入名称'
                onChange={this.handleNameChange.bind(this, 'name')}
                style={{ width: 150 }}
              />
            </div>
            <div>
              <span>流程类型：</span>
              <Select
                // showSearch
                style={{ width: 150 }}
                defaultValue='0'
                onChange={this.handleChange.bind(this, 'type')}
              >
                <option value="0">采购单</option>
              </Select>
            </div>
          </div>
          <Divider style={{ margin: 5 }} />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: 120, display: 'flex', justifyContent: 'center' }}>
                <span>节点名称</span>
              </div>
              <div style={{ width: 250, display: 'flex', justifyContent: 'center' }}>
                <span>审核条件</span>
              </div>
              <div style={{ width: 200, display: 'flex', justifyContent: 'center' }}>
                <span>参与人</span>
              </div>
            </div>
            {
              editList.map((val, idx) => {
                return (
                  <div key={val.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <div>
                      <Input
                        value={val.node_name}
                        disabled={idx === 0}
                        style={{ width: 120 }}
                        onChange={this.handleModalChange.bind(this, 'node_name', idx)}
                      />
                    </div>
                    {
                      idx !== 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Select
                            // showSearch
                            style={{ width: 100 }}
                            value={val.keyword || 'amount'}
                            onChange={this.handleModalChange.bind(this, 'keyword', idx)}
                          >
                            <Option value='amount'>采购金额</Option>
                          </Select>
                          <Select
                            // showSearch
                            style={{ width: 64, marginLeft: 5, marginRight: 5 }}
                            value={String(val.formula) || '2'}
                            onChange={this.handleModalChange.bind(this, 'formula', idx)}
                          >
                            <Option value='1'>&gt;</Option>
                            <Option value='2'>&gt;=</Option>
                          </Select>
                          <InputNumber
                            style={{ width: 100 }}
                            defaultValue={val.amount || '0'}
                            min={0}
                            max={99999999999}
                            onChange={this.handleModalChange.bind(this, 'amount', idx)}
                          />
                        </div>
                      )
                    }
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: 200 }}>
                      <Select
                        style={{ width: 180 }}
                        defaultValue={val.person_ids[0] === '' ? [] : val.person_ids}
                        mode='multiple'
                        onChange={this.handleModalChange.bind(this, 'person_ids', idx)}
                        maxTagCount={1}
                        maxTagPlaceholder='...'
                        tokenSeparators={[',']}
                      >
                        {
                          personList && personList.map(person => (
                            <Option value={String(person.id)}>{person.real_name}</Option>
                          ))
                        }
                      </Select>
                      {
                        idx !== 0 ? (
                          <Icon
                            type="minus-circle-o"
                            style={{ margin: 5, color: 'red', cursor: 'pointer' }}
                            onClick={this.handleRemoveModal.bind(this, idx)}
                          />
                        ) : (
                          <div style={{ width: 14, height: 14, margin: 5 }} />
                        )
                      }
                    </div>
                  </div>
                )
              })
            }
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
              <Button style={{ width: 220 }} type='dashed' onClick={this.handleAddModal} >
                + 添加
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default Configuration;
