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

export default class BatRelativeDocument extends React.Component{
  state = {
    columns: [],
    list: [],
    id: this.props.batch_id,
    purchase_id: this.props.purchase_id,
    page: {
      pageSize: 10,
      total: 0,
      current: 1,
      showSizeChanger: true,
    },
  };
  componentDidMount(){
    this.initColumns();
    this.getList({page:this.state.page});
  }
  getList = (page) => {
    const { id, purchase_id } = this.state;
    erpPost('purchase-batch/file/index',{id,purchase_id,...page},res => {
      this.setState({
        list: res.data.data,
        page: res.data.page,
      });
    });
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
  handleDelete = ( purchase_document_id ) => {
    erpPost('purchase-batch/file/delete',{purchase_document_id},() => {
      Prompt.success();
      this.getList();
    });
  }
  handleTableChange = (page) => {
    this.getList({page});
  }
  render(){
    const {columns,list, page ,purchase_id} = this.state;
    console.log(list)
    return(
      <div>
        <div className='cardHeadStyle'>
          <Card 
            title={(
              <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                <span>相关文档</span>
                <UploadFiles 
                  title='上传文档'
                  url='purchase-batch/upload-document'
                  data={{purchase_id}}
                  fileName='upload_file'
                  onUpload={this.getList}
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