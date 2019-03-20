import React from 'react';
import {
  Card,
  Table,
  Icon,
  Button,
} from 'antd';
import { erpPost } from '../../../services/ajax';
import UploadFiles from '../../../components/UploadFiles/UploadFiles';
import downloadFiles from '../../../components/DownloadFiles/DownloadFiles';
import Prompt from '../../../components/Prompt';
import PermissionButton from '../../../components/PermissionButton';
import DeleteComfirmModal from '../../../components/DeleteConfirm';

export default class BatRelativeDocument extends React.Component{
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
    this.getList({page:this.state.page});
  }
  getList = (page) => {
    const { id, purchase_id } = this.props;
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
        width: 100,
      },
      {
        title: '上传人',
        dataIndex: 'real_name',
        key: 'real_name',
        width: 100,
      },
      {
        title: '上传时间（UTC）',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 100,
        render: val => val || '--',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 100,
        render: (value,record) => (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
            <DeleteComfirmModal
              content='确认删除该文档？'
              onOk={this.handleDelete.bind(this,record.id)} 
              action='purchase-batch/file/delete'
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
              action='purchase-batch/file/download-files'
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
    const {columns,list, page } = this.state;
    const { purchase_id } = this.props;
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
                  onUpload={this.getList.bind(this,page)}
                  action='purchase-batch/upload-document'
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