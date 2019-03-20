import React from 'react';
import {
  Button,
  Icon,
  Tabs,
  message,
} from 'antd';
import AlloBasicDetail from './AlloBasicDetail';
import LogisticsProgress from './LogisticsProgress';
import OperationLog from './OperationLog';
import RelativeDocument from './RelativeDocument';
import EditableItem from './../../../components/EditableItem';
import { erpPost } from '../../../services/ajax';
import Prompt from '../../../components/Prompt';
import DeleteComfirmModal from '../../../components/DeleteConfirm';

const {TabPane} = Tabs;

export default class AllocationDetail extends React.Component{
  state = {
    id: this.props.requisition_id,
    detail: {},
    status: {},
    loading: false,
  };
  componentDidMount(){
    this.initStatus();
    this.getDetail();
  }
  getDetail = () => {
    const { id } = this.state;
    erpPost('requisition/detail',{requisition_id: id},res => {
      this.setState({
        detail: this.handleData({...res.data.data}),
      });
    });
  }
  handleData = ({inbound_warehouse, outbound_warehouse,person, ...data}) => {
    const inStore = inbound_warehouse.warehouse_name;
    const outStore = outbound_warehouse.warehouse_name;
    person = person.real_name;
    return ({inStore, outStore, person, ...data });
  }
  initStatus = () => {
    const status = {
      0: '创建',
      1: '部分在途',
      2: '全部在途',
      3: '完结',
      4: '废弃',
    };
    this.setState({status});
  }
  handleEditChange = (value) => {
    this.handleUpdate('remark',value);
  }
  handleUpdate = (type,content) => {
    const { id } = this.state;
    this.setState({
      loading: true,
    });
    erpPost('requisition/update',{requisition_id:id,type,content},() => {
      message.success('修改成功',2);
      this.getDetail();
      this.setState({
        loading: false,
      });
    },() => {
      this.setState({
        loading: false,
      });
    });
  }
  render(){
    const { detail, status, loading, id } = this.state;
    return(
      <div>
        {/* 调拨单号 */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div style={{display:'flex',justifyContent:'flex-start',alignItems:'center'}}>
              <Icon type='check-circle' style={{fontSize:24,color:'#6F9EEF',marginRight:10}} />
              <h2 style={{margin:0}}>
                调拨单号：{detail.requisition_no}
              </h2>
            </div>
            <div>
              {
                detail.status === 0 && 
                (
                  <div>
                    <DeleteComfirmModal
                      content={`确认作废调拨单${detail.requisition_no}？`}
                      onOk={this.handleUpdate.bind(this,'status',4)} 
                    >
                      <Button type='primary' style={{marginRight:5}} loading={loading}>
                        作废
                      </Button>
                    </DeleteComfirmModal>
                  </div>
                )
              }
              {
                detail.status === 1 && (
                  <DeleteComfirmModal
                    content='确认该调拨单是否已全部发货完成？'
                    onOk={this.handleUpdate.bind(this,'status',2)} 
                  >
                    <Button type='primary' style={{marginRight:5}} loading={loading}>
                      全部发货
                    </Button>
                  </DeleteComfirmModal>
                )
              }
              {
                detail.status === 2 && 
                (
                  <DeleteComfirmModal
                    content='确认所有产品已达调入仓库并完成入库？'
                    onOk={this.handleUpdate.bind(this,'status',3)} 
                  >
                    <Button type='primary' style={{marginRight:5}} loading={loading}>
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
                <p>调入仓库：<span style={{opacity:0.9}}>{detail.inStore}</span></p>
                <p>创建人：<span style={{opacity:0.9}}>{detail.person}</span></p>
                
              </div>
              <div style={{marginLeft:100}}>
                <p>调出仓库：<span style={{opacity:0.9}}>{detail.outStore}</span></p>
                <p>创建时间：<span style={{opacity:0.9}}>{detail.created_at}</span></p>
              </div>
              <div style={{marginLeft:100}}>
                <div style={{display:'flex',justifyContent:'center'}}>
                  <span>备注：</span>
                  <span style={{opacity:0.9}}>
                    <EditableItem width='200' value={detail.remark} onChange={this.handleEditChange} />
                  </span>
                </div>
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
            {
              Object.keys(detail).length && (
                <Tabs defaultActiveKey='1'>
                  <TabPane tab='详情' key='1'>
                    <AlloBasicDetail requisition_id={id} detail={detail} />
                  </TabPane>
                  <TabPane tab='物流' key='2'>
                    <LogisticsProgress requisition_id={id} outStore={detail.outStore} status={detail.status} />
                  </TabPane>
                  <TabPane tab='相关文档' key='3'>
                    <RelativeDocument requisition_id={id} />
                  </TabPane>
                  <TabPane tab='操作日志' key='4'>
                    <OperationLog requisition_id={id} />
                  </TabPane>
                </Tabs>
              )
            }
          </div>
        </div>
      </div>
    );
  }
}