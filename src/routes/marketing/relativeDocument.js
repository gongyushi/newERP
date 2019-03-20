import React from 'react';
import {
  Divider,
  Table,
  Button,
  message,
  Icon,
} from 'antd';
import { erpPost, fileDownload } from '../../services/ajax';
import UploadFiles from '../../components/UploadFiles/UploadFiles';

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
  };

  componentDidMount(){
    this.initColumns();
    this.getList();
  }
  
  // 获取文档列表
  getList = () => {
    const { order_id } = this.props;
    erpPost('/order/document-list', { order_id }, res => {
      this.setState({
        list: res.data.data.map(val => this.handleData({...val})),
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
  
  // 下载文档
  handleDownload = (url) => {
    fileDownload('file/download-files',{path:url},res => {
      const a = document.createElement('a');
      const urls = new Blob([res.data], {type: 'image/jpeg'});
      const filename = 'aaa.jpg';
      a.href = urls;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(urls);
    },(err) => {
      console.log(err)
    });
  } 
  
  // 删除文档
  handleDelete = ( order_document_id ) => {
    const { order_id } = this.props;
    erpPost('/order/file/delete',{ order_id, order_document_id },() => {
      message.success('删除成功',2);
      this.getList();
    });
  }
  
  // 上传文档
  handleUpload = (status,file) => {
    if(status === 'success'){
      this.getList();
    }else{
      console.log(file);
    }
  }

  handleTableChange = (page) => {
    this.setState({page});
    this.getList();
  }

  render(){
    const { columns, list, page } = this.state;
    const { order_id } = this.props;
    return(
      <div>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <h3>相关文档</h3>
          <UploadFiles 
            title='上传文档'
            url='/order/file/upload'
            data={{order_id}}
            fileName='upload_file'
            onUpload={this.handleUpload}
          />
        </div>
        <Divider style={{margin:'10px 0px'}} />
        <div>
          <Table columns={columns} dataSource={list} pagination={page} onChange={this.handleTableChange} rowKey='id' />
        </div>
      </div>
    );
  }
}