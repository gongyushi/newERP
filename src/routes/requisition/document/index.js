import React from 'react';
import {
  Card,
  Table,
  Button,
  Icon,
} from 'antd';
import { erpPost } from '../../../services/ajax';
import UploadFiles from '../../../components/UploadFiles/UploadFiles';
import downloadFiles from '../../../components/DownloadFiles/DownloadFiles';
import Prompt from '../../../components/Prompt';
import DeleteComfirmModal from '../../../components/DeleteConfirm';
import PermissionButton from '../../../components/PermissionButton';

export default class RelativeDocument extends React.Component{
  state = {
    columns: [],
    list: [],
    page: {
      pageSize: 10,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
    orders: [],
  };
  componentDidMount(){
    this.initColumns();
    this.getList();
  }
  componentDidUpdate(nextProps, nextState){
    if(
      JSON.stringify(nextState.orders) !== JSON.stringify(this.state.orders) ||
      nextState.page.current !== this.state.page.current ||
      nextState.page.pageSize !== this.state.page.pageSize
    ){
      this.getList();
    }
  };
  getList = () => {
    const { requisition_id } = this.props;
    const { page, orders } = this.state;
    erpPost('requisition/document/index',{page,orders,requisition_id},res => {
      this.setState({
        list: res.data.data.map(val => this.handleData({...val})),
        page: res.data.page,
      });
    });
  }
  handleData = ({ person ,...data}) => {
    const { real_name } = person;
    return ({real_name, person, ...data});
  }
  initColumns = () => {
    const columns = [
      {
        title: '文档名称',
        dataIndex: 'doc_name',
        key: 'doc_name',
        width: 200,
      },
      {
        title: '上传人',
        dataIndex: 'real_name',
        key: 'real_name',
        width: 200,
      },
      {
        title: '上传时间（UTC）',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 200,
        render: val => val || '--',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 200,
        render: (value,record) => (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
            <DeleteComfirmModal
              content='确认删除该文档？'
              onOk={this.handleDelete.bind(this,record.id)} 
              action='requisition/file/delete'
            >
              <Button 
                style={{marginRight:10}}
                type='primary'
                ghost
                size='small'
              >
                删除
              </Button>
            </DeleteComfirmModal>
            <PermissionButton 
              type='primary'
              ghost
              size='small'
              action='file/download-files'
              onClick={this.handleDownload.bind(this,record.url)}
            >
              <Icon type="download" />下载
            </PermissionButton>
          </div>
        ),
      },
    ];
    this.setState({columns});
  }
  handleDownload = (url) => {
    downloadFiles('file/download-files',{path:url},() => {
      Prompt.success();
    },() => {
    });
  } 
  handleDelete = ( requisition_document_id ) => {
    const { requisition_id } = this.props;
    erpPost('requisition/file/delete',{requisition_document_id, requisition_id},() => {
      this.getList();
    });
  }
  handleUpload = (status,file) => {
    const { page } = this.state;
    page.current = 1;
    if(status === 'success'){
      this.getList();
    }else{
      console.log(file);
    }
  }
  handleTableChange = (page,filter,sorter) => {
    this.setState({
      page,
      orders: {field: sorter.field, order: sorter.order},
    });
  }
  render(){
    const {columns, list, page} = this.state;
    const { requisition_id } = this.props;
    return(
      <div>
        <div className='cardHeadStyle'>
          <Card
            title={(
              <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                <span>
                  相关文档
                </span>
                <UploadFiles 
                  title='上传文档'
                  url='requisition/file/upload'
                  data={{requisition_id}}
                  fileName='upload_file'
                  onUpload={this.handleUpload}
                  action='requisition/file/upload'
                />
              </div>
            )}
            bordered={false}
          >
            <Table columns={columns} dataSource={list} pagination={page} onChange={this.handleTableChange} rowKey='id' />
          </Card>
        </div>
      </div>
    );
  }
}