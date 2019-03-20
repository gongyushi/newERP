import React from 'react';
import {
  Tabs,
  Button,
  Icon,
} from 'antd';
import moment from 'moment';
import BatOperationLog from './log/index';
import BatRelativeDocument from './file/index';
import BatLogisticsProgress from './logistics/index';
import BatBasicDetail from './basic-detail';
import { erpPost } from '../../services/ajax';
import EditableItem from '../../components/EditableItem';
import Prompt from '../../components/Prompt';
import DeleteComfirmModal from '../../components/DeleteConfirm';


const { TabPane } = Tabs;

class PurBatchDetail extends React.Component{
  constructor(props){
    super(props);
    const { activeKey, params } = props;
    this.state = {
      detail: {},
      status: {}, // 状态对照表
      activeKey1: '1', // 当前激活tab页
      activeKey,
      search: {
        id: params.Get('id', undefined),
        purchase_id: params.Get('purchase_id', undefined),
      },
    }
  };
  componentDidMount(){
    this.getDetail();
    this.initColumns();
  }
  componentWillReceiveProps(nextProps){
    if(
      nextProps.activeKey === this.state.activeKey &&
      nextProps.refreshKeys.indexOf(this.state.activeKey) > -1
    )
    {
      // 切换页签， 重载数据
      this.getDetail();
      // 删除 refreshKey
      this.props.onRemoveRefreshKey(this.state.activeKey);
    }
  };
  getDetail = () => {
    const { search } = this.state;
    erpPost('purchase-batch/detail-base',{...search},res => {
      this.setState({
        detail: res.data.data,
      });
    });
  }
  initColumns = () => {
    const status = {
      0: '草稿',
      1: '工厂确认',
      2: '备料完成',
      3: '生产完成',
      4: '质检完成',
      5: '部分发货',
      6: '全部发货',
      7: '已完成',
    }
    // const type = {
    //   preareMaterial:'备料',
    //   production: '生产',
    //   allQC: '全部质检',
    //   allDeliver: '全部发货',
    //   finish: '完成',
    // };
    this.setState({status});
  }
  handleStatusChange = (key) => {
    const { search } = this.state;
    erpPost('purchase-batch/set-status',{ ...search, type:key },() => {
      Prompt.success();
      this.getDetail();
      if(key === 'allQC'){
        this.setState({
          activeKey1: '2',
        });
      }
    },() => {
    });
  }
  handleEditChange = (value) => {
    const { search } = this.state;
    erpPost('purchase-batch/edit-remark',{ ...search,remark:value },() => {
      Prompt.success();
      this.getDetail();
    },() => {
      // message.error('编辑失败，请检查',2);
      this.getDetail();
    });
  }
  toggleTab = (activeKey1) => {
    this.setState({activeKey1});
  }
  render(){
    const { detail, status, activeKey1, search } = this.state;
    return(
      <div>
        {/* 调拨单号 */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div style={{display:'flex',justifyContent:'flex-start',alignItems:'center'}}>
              <Icon type='check-circle' style={{fontSize:24,color:'#6F9EEF',marginRight:10}} />
              <h2 style={{margin:0}}>
                批次单号：{detail.batch_no}
              </h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {
                detail.status === 1 && (
                  <DeleteComfirmModal
                    content='确认该批次已备料完成？'
                    onOk={this.handleStatusChange.bind(this,'preareMaterial')}
                    action='purchase-batch/set-status'
                  >
                    <Button type='primary' style={{ marginRight: 5 }}>
                      备料
                    </Button>
                  </DeleteComfirmModal>
                )
              }
              {
                detail.status === 2 && (
                  <DeleteComfirmModal
                    content='确认该批次已生产完成？'
                    onOk={this.handleStatusChange.bind(this,'production')}
                    action='purchase-batch/set-status'
                  >
                    <Button type='primary' style={{ marginRight: 5 }}>
                    生产
                    </Button>
                  </DeleteComfirmModal>
                )
              }
              {
                detail.status === 3 && (
                  <DeleteComfirmModal
                    content='确认该批次已全部质检完成？'
                    onOk={this.handleStatusChange.bind(this,'allQC')}
                    action='purchase-batch/set-status'
                  >
                    <Button type='primary' style={{ marginRight: 5 }}>
                      质检完成
                    </Button>
                  </DeleteComfirmModal>
                )
              }
              {
                ( detail.status === 4 || detail.status === 5 ) && (
                  <DeleteComfirmModal
                    content='确认该批次已全部发货完成？'
                    onOk={this.handleStatusChange.bind(this,'allDeliver')}
                    action='purchase-batch/set-status'
                  >
                    <Button type='primary' style={{ marginRight: 5 }}>
                    全部发货
                    </Button>
                  </DeleteComfirmModal>
                )
              }
              {
                detail.status === 6 && (
                  <DeleteComfirmModal
                    content='确认该批次已全部入库，并完结该批次？'
                    onOk={this.handleStatusChange.bind(this,'finish')}
                    action='purchase-batch/set-status'
                  >
                    <Button type='primary' style={{ marginRight: 5 }}>
                      完结
                    </Button>
                  </DeleteComfirmModal>
                )
              }
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:10}}>
            <div style={{width:900,minWidth:600,display:'flex',justifyContent:'flex-start'}}>
              <div style={{marginLeft:35}}>
                <p>
                  总价（USD）：
                  <span style={{opacity:0.9}}>
                    {detail.amount}
                  </span>
                </p>
                <p>
                  创建人：
                  <span style={{opacity:0.9}}>
                    {detail.real_name}
                  </span>
                </p>
              </div>
              <div style={{marginLeft:100}}>
                <p>
                  开始时间：
                  <span style={{opacity:0.9}}>
                    {detail.start_at ? moment(detail.start_at).format('YYYY-MM-DD') : ''}
                  </span>
                </p>
                <div style={{display:'flex',justifyContent:'center'}}>
                  <span>备注：</span>
                  <span style={{opacity:0.9}}>
                    <EditableItem width='200' value={detail.remark} onChange={this.handleEditChange} />
                  </span>
                </div>
              </div>
              <div style={{marginLeft:100}}>
                <p>
                  计划完成时间：
                  <span style={{opacity:0.9}}>
                    {detail.plan_finish_at ? moment(detail.plan_finish_at).format('YYYY-MM-DD') : ''}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <p style={{textAlign:'right'}}>状态</p>
              <h2 style={{margin:0}}>
                {status[detail.status]}
              </h2>
            </div>
          </div>
          {/* tab标签 */}
          <div>
            <Tabs defaultactiveKey1='1' activeKey1={activeKey1} onChange={this.toggleTab}>
              <TabPane tab='基本信息' key='1'>
                <BatBasicDetail status={detail.status} {...search} />
              </TabPane>
              <TabPane tab='物流进度' key='2'>
                <BatLogisticsProgress {...search} status={detail.status} />
              </TabPane>
              <TabPane tab='相关文档' key='3'>
                <BatRelativeDocument {...search} />
              </TabPane>
              <TabPane tab='操作日志' key='4'>
                <BatOperationLog {...search} />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}

export default PurBatchDetail;