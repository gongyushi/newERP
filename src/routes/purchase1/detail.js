import React from 'react';
import {
  Button,
  Icon,
  Modal,
  Input,
  Select,
  Tabs,
  Row,
  Col,
  Divider,
} from 'antd';
import PurOperationLog from './log/index';
import PurBasicDetail from './basicDetail';
import PurchaseBatch from '../purchase-batch/index';
import EditableItem from './../../components/EditableItem';
import { erpPost } from '../../services/ajax';
import Prompt from '../../components/Prompt';
import DeleteComfirmModal from '../../components/DeleteConfirm';
import PermissionButton from '../../components/PermissionButton';

require('./common.less');

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;


export default class PurchaseDetail extends React.Component {
  state = {
    checkVisible: false,
    submitVisible: false,
    rejectVisible: false,
    voidVisible: false,
    loading: false,
    reason: '',
    processList: [], // 审核流程
    process: '',
    person: [], // 审核人
    person_id: '', // 审核人员 ID 
    personList: [], // 审核人员列表
    current_id_last_node: false, // 当前是否是最后一个审核人
    is_need_audit: true, // 是否需要继续审核
    title: '',
    detail: {},
    status: {}, // 状态对照表
    activeKey1: '1', // 当前激活tab页面
    allData: {}, // 详情所有数据
    activeKey: this.props.activeKey,
    search: {
      id: this.props.params.Get('id',undefined),
    },
  };
  componentDidMount(){
    this.initStatus();
    this.getPurchaseDetail();
  }
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.getPurchaseDetail();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };
  getPurchaseDetail = () => {
    const { search } = this.state;
    erpPost('purchase/detail',{...search}, res => {
      this.setState({
        detail: res.data.data.base,
        allData: res.data.data,
      });
    });
  }
  initStatus = () => {
    const status = {
      0: '草稿',
      1: '审核中',
      2: '审核通过',
      3: '已下单',
      4: '执行中',
      5: '已完结',
      6: '已废弃',
      7: '被驳回',
    };
    this.setState({status});
  }
  // 下单
  handleOrder = () => {
    const { id } = this.state.search;
    this.setState({
      loading: true,
    });
    erpPost('purchase/orders',{purchase_id:id},() => {
      Prompt.success();
      this.setState({
        loading: false,
        activeKey1: '2',
      });
      this.getPurchaseDetail();
    },() => {
      // message.error('下单失败，请检查',2);
      this.setState({
        loading: false,
      });
    });
  }
  // 确定完结
  handleEnsure = () => {
    const { id } = this.state.search;
    this.setState({
      loading: true,
    });
    erpPost('purchase/finish',{purchase_id:id},() => {
      Prompt.success();
      this.setState({
        loading: false,
      });
      this.getPurchaseDetail();
    },() => {
      // message.error('确认完结失败，请检查',2);
      this.setState({
        loading: false,
      });
    });
  }
  // 开模态框
   handleOpenModal = (key,title) => {
    const { id } = this.state.search;
    const person = JSON.parse(localStorage.getItem('userName'));
    const person_id = person.id;
    switch (key) {
      case 'submitVisible':
        erpPost('purchase/person/audit-flow/index',{purchase_id: id,person_id},res => {
          this.setState({
            processList: res.data.data,
            [key]: true,
            title,
          });
        });
        break;
      case 'checkVisible':
        erpPost('purchase/audit-view',{purchase_id:id},res => {
          this.setState({
            personList: res.data.data.next_auditors,
            current_id_last_node: res.data.data.current_id_last_node,
            [key]: true,
            title,
          });
        });
        break;
      case 'rejectVisible':
        this.setState({
          [key]: true,
          title,
        });
        break;
      case 'voidVisible':
        this.setState({
          [key]: true,
          title,
        });
        break;
      default: ;
    }
  }
  // 模态框提交
  handleSubmit = (key) => {
    this.setState({
      loading: true,
    });
    const { reason, person_id, process, search, current_id_last_node } = this.state;
    const { id } = search;
    const next_audit_person_id = current_id_last_node ? undefined : person_id;
    // console.log(process);
    switch (key) {
      case 'submitVisible':
        erpPost('purchase/push-audit',{purchase_id:id,audit_person_id:person_id,audit_flow_id:process},
          () => {
          Prompt.success();
          this.handleClose(key);
        },() => {
          // message.error('提交失败，请检查',2);
          this.setState({
            loading: false,
          });
        });
        break;
      case 'checkVisible':
        erpPost('purchase/audit/agree',{purchase_id:id,is_last_auditor:current_id_last_node,next_audit_person_id},() => {
          Prompt.success();
          this.handleClose(key);
        },() => {
          // message.success('审核失败，请重试',2);
          this.setState({
            loading: false,
          });
        });
        break;
      case 'rejectVisible':
        if(!reason){
          Prompt.warning({content:'请填写驳回理由'});
          return;
        }
        erpPost('purchase/audit/reject',{purchase_id:id,remark:reason},() => {
          Prompt.success();
          this.handleClose(key);
        },() => {
          // message.error('驳回失败，请检查',2);
          this.setState({
            loading: false,
          });
        });
        break;
      case 'voidVisible':
        erpPost('purchase/cancel',{purchase_id:id},() => {
          Prompt.success();
          this.handleClose(key);
        },() => {
          // message.error('作废失败，请检查',2);
          this.setState({
            loading: false,
          });
        });
        break;
      default: ;
    }
  }
  // 关模态框
  handleClose = (key) => {
    this.setState({
      [key]: false,
      loading: false,
    });
    this.getPurchaseDetail();
  }
  handleSelectChange = (key,value) => {
    const { processList } = this.state;
    const tmp = processList.filter(val => String(val.audit_flow_id) === String(value))[0];
    const {person_ids,is_need_audit} = tmp;
    if(!is_need_audit){
      this.setState({
        [key]: value,
        is_need_audit,
        person: undefined,
        person_id: undefined,
      });
      return;
    }
    this.setState({
      [key]: value,
      person: person_ids,
      is_need_audit,
    });
  }
  handleSelectPersonChange = (key, value) => {
    this.setState({
      [key]: value,
    });
  }
  handleInputChange = (key,e) => {
    this.setState({
      [key]: e.target.value,
    });
  }
  handleEditChange = (value) => {
    const { id } = this.state.search;
    erpPost('purchase/update-remark',{purchase_id:id,remark:value},() => {
      Prompt.success();
    },() => {
      // message.error('编辑失败，请再次尝试',2);
    });
  }
  toggleTab = (activeKey1) => {
    this.setState({activeKey1});
  }
  render() {
    const { checkVisible, rejectVisible, loading, person, voidVisible, current_id_last_node, allData,
      submitVisible, title, detail, status, search, processList, personList, is_need_audit, activeKey1 } = this.state;
    const { id } = search;
    return (
      <div className='purchase'>
        {/* 采购单号 */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Icon type='check-circle' style={{ fontSize: 24, color: '#6F9EEF', marginRight: 10 }} />
              <h2 style={{ margin: 0 }}>
                采购单号：{detail.purchase_no}
              </h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {
                ( detail.status === 0 || detail.status === 7 ) && (
                  <PermissionButton 
                    type='primary' 
                    onClick={this.handleOpenModal.bind(this,'submitVisible','提交审核')} 
                    style={{ marginRight: 5 }}
                    action='purchase/push-audit'
                  >
                    提交审核
                  </PermissionButton>
                )
              }
              {
                detail.status === 1 && (
                  <div>
                    <PermissionButton
                      type='primary' 
                      onClick={this.handleOpenModal.bind(this,'checkVisible','是否审核通过')} 
                      style={{ marginRight: 5 }}
                      action='purchase/audit/agree'
                    >
                      审核
                    </PermissionButton>
                    <PermissionButton
                      type='primary' 
                      onClick={this.handleOpenModal.bind(this,'rejectVisible','是否驳回')} 
                      style={{ marginRight: 5 }}
                      action='purchase/audit/reject'
                    >
                      驳回
                    </PermissionButton>
                  </div>
                )
              }
              {
                detail.status === 2 && (
                  <DeleteComfirmModal
                    content={`已和工厂确认好，并下单${detail.purchase_no}？`}
                    onOk={this.handleOrder}
                    action='purchase/orders'
                  >
                    <Button type='primary' style={{ marginRight: 5 }}>
                      下单
                    </Button>
                  </DeleteComfirmModal>
                )
              }
              {
                (detail.status === 2 || detail.status === 0) && (
                  <DeleteComfirmModal
                    content={`确认作废采购单${detail.purchase_no}？`}
                    onOk={this.handleOpenModal.bind(this,'voidVisible','是否作废')}
                    action='purchase/cancel'
                  >
                    <Button type='primary' style={{ marginRight: 5 }}>
                      作废
                    </Button>
                  </DeleteComfirmModal>
                )
              }
              {
                detail.status === 4 && (
                  <DeleteComfirmModal
                    content='确认所有产品批次已入库，并完结该采购单？'
                    onOk={this.handleEnsure}
                    action='purchase/finish'
                  >
                    <Button type='primary' style={{ marginRight: 5 }}>
                      完结
                    </Button>
                  </DeleteComfirmModal>
                )
              }
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ width: 900, minWidth: 600, display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ marginLeft: 35 }}>
                <p>
                  创建人：
                  <span style={{ opacity: 0.9 }}>
                    {detail.real_name}
                  </span>
                </p>
                <p>
                  创建时间：
                  <span style={{ opacity: 0.9 }}>
                    {detail.created_at}
                  </span>
                </p>
              </div>
              <div style={{ marginLeft: 100 }}>
                <p>
                  采购仓库：
                  <span style={{ opacity: 0.9 }}>
                    {detail.warehouse_name}
                  </span>
                </p>
                {/* <p>费用（USD）：<span style={{ opacity: 0.9 }}>500</span></p> */}
                <p>
                  供应商：
                  <span style={{ opacity: 0.9 }}>
                    {detail.supplier_name}
                  </span>
                </p>
              </div>
              <div style={{ marginLeft: 100 }}>
                <p>
                  总额：
                  <span style={{ opacity: 0.9 }}>
                    {detail.product_total_amount}
                  </span>
                </p>
                <div style={{display:'flex',justifyContent:'center'}}>
                  <span>备注：</span>
                  <span style={{opacity:0.9}}>
                    {
                      (detail.status === 0 || detail.status === 2) ? 
                        <EditableItem width='200' value={detail.remark} onChange={this.handleEditChange} />
                      : detail.remark
                    }
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p style={{ textAlign: 'right' }}>状态</p>
              <h2 style={{ margin: 0 }}>
                {status[detail.status]}
              </h2>
            </div>
          </div>
          {/* tabs切换 */}
          <div>
            {
              Object.keys(allData).length > 0 && (
                <Tabs defaultactiveKey1='1' activeKey1={activeKey1} onChange={this.toggleTab}>
                  <TabPane tab='基本信息' key='1'>
                    <PurBasicDetail purchase_id={id} detail={allData} />
                  </TabPane>
                  <TabPane tab='批次' key='2'>
                    <PurchaseBatch purchase_id={id} status={detail.status} />
                  </TabPane>
                  <TabPane tab='操作日志' key='3'>
                    <PurOperationLog purchase_id={id} />
                  </TabPane>
                </Tabs>
              )
            }
          </div>
        </div>
        {/* 模态框组 */}
        {/* 提交审核 */}
        <Modal
          visible={submitVisible}
          closable={false}
          maskClosable={false}
          title={(
            <div>
              <div style={{display:'flex',justifyContent:'center'}}>
                <span style={{ opacity: 0.6 }}>{title}</span>
              </div>
              <Icon
                type='close'
                style={{ fontSize: 30, opacity: 0.6, position: 'absolute', top: 5, right: 5, cursor: 'pointer' }}
                onClick={this.handleClose.bind(this,'submitVisible')}
              />
            </div>
          )}
          centered
          width='400px'
          footer={null}
        >
          <div style={{width:300,minHeight:100}} >
            <Row>
              <Col span='8' style={{display:'flex',justifyContent:'flex-end'}}>
                审核流程：
              </Col>
              <Col span='16' style={{marginBottom:10}}>
                <Select
                  style={{width:200}}
                  placeholder='请选择流程'
                  onChange={this.handleSelectChange.bind(this,'process')}
                  showSearch
                  optionFilterProp='children'
                >
                  {
                    processList && processList.map(list => <Option key={list.audit_flow_id}>{list.name}</Option>)
                  }
                </Select>
              </Col>
              
              {
                is_need_audit ? (
                  <Col span='8' style={{display:'flex',justifyContent:'flex-end', marginTop:5}}>
                    审核人：
                  </Col>
                ) : (
                  <Col span='8' style={{display:'flex',justifyContent:'flex-end', marginTop:5}}>
                    提示：
                  </Col>
                )
              }
              {
                is_need_audit ? (
                  <Col span='16' style={{marginTop:5}}>
                    <Select
                      style={{width:200}}
                      placeholder='请选择审核人员'
                      onChange={this.handleSelectPersonChange.bind(this,'person_id')}
                      showSearch
                      optionFilterProp='children'
                    >
                      {
                        person && person.map(val => <Option value={val.id} key={val.id}>{val.real_name}</Option>)
                      }
                    </Select>
                  </Col>
                ) : (
                  <Col span='16' style={{color:'red',marginTop:5}}>
                    您选择的审核流程无需审核
                  </Col>
                )
              }
            </Row>
          </div>
          <div style={{display: 'flex', justifyContent:'space-between',padding:5}}>
            <Button
              style={{ borderColor: '#00EC00', marginRight: 5 }}
              onClick={this.handleClose.bind(this,'submitVisible')}
            >
              取消
            </Button>
            <Button type='primary' loading={loading} onClick={this.handleSubmit.bind(this,'submitVisible')}>
              确定
            </Button>
          </div>
        </Modal>
        {/* 审核 */}
        <Modal
          visible={checkVisible}
          closable={false}
          maskClosable={false}
          title={(
            <div>
              <div style={{display:'flex',justifyContent:'center'}}>
                <span style={{ opacity: 0.6 }}>{title}</span>
              </div>
              <Icon
                type='close'
                style={{ fontSize: 30, opacity: 0.6, position: 'absolute', top: 5, right: 5, cursor: 'pointer' }}
                onClick={this.handleClose.bind(this,'checkVisible')}
              />
            </div>
          )}
          centered
          width='400px'
          footer={null}
        >
          <div>
            {
              !current_id_last_node && (
                <div style={{width:300, height:100,display:'flex',justifyContent:'center',alignItems:'center'}}>
                  <span>下一个审核人：</span>
                  <Select
                    placeholder='请选择审核人员'
                    onChange={this.handleSelectPersonChange.bind(this,'person_id')}
                    style={{width:150}}
                    showSearch
                    optionFilterProp='children'
                  >
                    {
                      personList && personList.map(val => <Option key={val.id}>{val.real_name}</Option>)
                    }
                  </Select>
                </div>
              )
            }
          </div>
          <div style={{display: 'flex', justifyContent:'space-between',padding:5}}>
            <Button
              style={{ borderColor: '#00EC00', marginRight: 5 }}
              onClick={this.handleClose.bind(this,'checkVisible')}
            >
              取消
            </Button>
            <Button type='primary' loading={loading} onClick={this.handleSubmit.bind(this,'checkVisible')}>
              确定
            </Button>
          </div>
        </Modal>
        {/* 作废 */}
        <Modal
          visible={voidVisible}
          closable={false}
          maskClosable={false}
          title={(
            <div>
              <div style={{display:'flex',justifyContent:'center'}}>
                <span style={{ opacity: 0.6 }}>{title}</span>
              </div>
              <Icon
                type='close'
                style={{ fontSize: 30, opacity: 0.6, position: 'absolute', top: 5, right: 5, cursor: 'pointer' }}
                onClick={this.handleClose.bind(this,'voidVisible')}
              />
            </div>
          )}
          centered
          width='400px'
          footer={null}
        >
          <div style={{width:300,height:100}} />
          <div style={{display: 'flex', justifyContent:'space-between',padding:5}}>
            <Button
              style={{ borderColor: '#00EC00', marginRight: 5 }}
              onClick={this.handleClose.bind(this,'voidVisible')}
            >
              取消
            </Button>
            <Button type='primary' loading={loading} onClick={this.handleSubmit.bind(this,'voidVisible')}>
              确定
            </Button>
          </div>
        </Modal>
        {/* 驳回 */}
        <Modal
          visible={rejectVisible}
          closable={false}
          maskClosable={false}
          title={(
            <div>
              <div style={{display:'flex',justifyContent:'center'}}>
                <span style={{ opacity: 0.6 }}>{title}</span>
              </div>
              <Icon
                type='close'
                style={{ fontSize: 30, opacity: 0.6, position: 'absolute', top: 5, right: 5, cursor: 'pointer' }}
                onClick={this.handleClose.bind(this,'rejectVisible')}
              />
            </div>
          )}
          centered
          width='400px'
          footer={null}
        >
          <div>
            <Row>
              <Divider style={{height:0}} />
              <Col span='8' style={{display:'flex',justifyContent:'flex-end'}}>
                驳回原因：
              </Col>
              <Col span='16'>
                <TextArea 
                  style={{width:200}} 
                  autosize={{minRows: 5}} 
                  onChange={this.handleInputChange.bind(this,'reason')} 
                />
              </Col>
            </Row>
            <div style={{display: 'flex', justifyContent:'space-between',padding:5}}>
              <Button
                style={{ borderColor: '#00EC00', marginRight: 5 }}
                onClick={this.handleClose.bind(this,'rejectVisible')}
              >
                取消
              </Button>
              <Button type='primary' loading={loading} onClick={this.handleSubmit.bind(this,'rejectVisible')}>
                确定
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}