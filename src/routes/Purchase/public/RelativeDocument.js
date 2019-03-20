import React from 'react';
import {
  Card,
  Table,
  Button,
  message,
  Icon,
} from 'antd';
import { erpPost } from '../../../services/ajax';
import UploadFiles from '../../../components/UploadFiles/UploadFiles';
import downloadFiles from '../../../components/DownloadFiles/DownloadFiles';
import Prompt from '../../../components/Prompt';

export default class RelativeDocument extends React.Component{
  state = {
    columns: [],
    list: [],
    requisition_id: this.props.requisition_id,
    page: {
      pageSize: 10,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
  };
  componentDidMount(){
    const { page } = this.state;
    this.initColumns();
    this.getList({page});
  }
  getList = (page) => {
    const { requisition_id } = this.state;
    erpPost('requisition/document-list',{...page,requisition_id},res => {
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
      },
      {
        title: '上传人',
        dataIndex: 'real_name',
        key: 'real_name',
      },
      {
        title: '上传时间（UTC）',
        dataIndex: 'created_at',
        key: 'created_at',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (value,record) => (
          <div>
            <Button 
              style={{borderColor:'#6F9EEF',color:'#6F9EEF',marginRight:10}}
              size='small'
              onClick={this.handleDelete.bind(this,record.id)}
            >
              删除
            </Button>
            <Button 
              style={{borderColor:'#6F9EEF',color:'#6F9EEF'}}
              size='small'
              // href={record.url}
              onClick={this.handleDownload.bind(this,record.url)}
            >
              <Icon type="download" />下载
            </Button>
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
      // message.error('下载失败，请重试',2);
    });
  } 
  handleDelete = ( requisition_document_id ) => {
    const { requisition_id, page } = this.state;
    erpPost('requisition/file/delete',{requisition_document_id, requisition_id},() => {
      // message.success('删除成功',2);
      this.getList({page});
    });
  }
  handleUpload = (status,file) => {
    const { page } = this.state;
    page.current = 1;
    if(status === 'success'){
      this.getList({page});
    }else{
      console.log(file);
    }
  }
  handleTableChange = (page) => {
    this.getList({page});
  }
  render(){
    const {columns, list, page, requisition_id} = this.state;
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