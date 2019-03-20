import React from 'react';
import { CSVLink } from "react-csv";
import { Upload, message, Button, Row, Col, Modal, Table } from 'antd';
import { erpPost } from '../../services/ajax';
import styles from './StoreImport.less';
import downloadFiles from '../../components/DownloadFiles/DownloadFiles';

class StoreImport extends React.Component {
  // 保存Excel
  constructor(props){
    super(props);
    this.state={
      page: {
        pageSize: 10, 
        total: 0,
        current: 1,
        showSizeChanger: true,
      },
      visible: false,
      dataSource: [],
      producDetail: {},
      exportData: [],
      path: '',
    }
  }
 
  // 校验Excell
  onSaveExcel = () => {
    const { path }=this.state;
    erpPost('/warehouse-product/check-import', {path}, res => {
      const detail = {
        error_num: res.data.error_num,
        total_num: res.data.total_num,
        success_num: res.data.success_num,
      }
      const exportData = [];
      if(res.data&&res.data.data){
        res.data.data.map(exp=>{
          return exportData.push({
            warehouse_no: exp.warehouse_no,
            warehouse_name: exp.warehouse_name,
            product_no: exp.product_no,
            title: exp.title,
            status: exp.valid.status?'成功':'失败',
            info: exp.valid.info,
          })
        })
      }      
      this.setState({
        visible: true,
        dataSource: res.data.data,
        producDetail: detail,
        exportData,
      })
    })    
  }
  
  // 确认导入
  onSubmit = () => {
    const { path, page }=this.state;
    const { onSetData, remove, activeKey } = this.props;
    erpPost('/warehouse-product/excel-import', {path}, () => {
        onSetData(page);     
        remove(activeKey)
      }
    )  
  }

  // 取消导入
  onCancel = () => {
    this.setState({
      visible: false,
    })
  }

  // 下载模板
  handleDownload = (url) => {
    downloadFiles('file/download-files',{path:url},() => {
      message.success('下载成功',2);
    },() => {
      message.error('下载失败，请重试',2);
    });
  }

  render() {
    const { urlHeader } = global.gconfig;
    const falutType = {
      color: 'red',
    }
    const columns = [
      {
        title:'仓库编号',
        dataIndex:'warehouse_no',
        width:100,
      },
      {
        title:'仓库名称',
        dataIndex:'warehouse_name',
        width:100,
      },
      {
        title:'产品ID',
        dataIndex:'product_no',
        width:100,
      },
      {
        title:'产品名称',
        dataIndex:'title',
        width:500,
      },
      {
        title:'预期结果',
        dataIndex:'valid',
        width:100,
        render: (text) => {
          return text&&text.status?<span >成功</span>:<span style={falutType}>失败</span>
        },
      },
      {
        title:'备注',
        dataIndex:'valid',
        width:100,
        render: (text) => {
          return text&&text.status?<span >{text.info}</span>:<span style={falutType}>{text.info}</span>
        },
      },
    ]
    const { producDetail, dataSource, exportData } = this.state;
    const headers = [
      { label: "仓库编号", key: "warehouse_no" },
      { label: "仓库名称", key: "warehouse_name" },
      { label: "产品ID", key: "product_no" },
      { label: "产品名称", key: "title" },
      { label: "预期结果", key: "status" },
      { label: "备注", key: "info" },
    ]
    return (
      <div className={styles.storeType} style={{marginTop:70}}>
        <p className={styles.p1}>自有仓库可批量上传产品库存信息</p>        
        <p className={styles.p2}>导入后将生成一个入库单，备注标识为： 导入初始库存</p>
        <div className={styles.upload}>
          <Row>
            <Col span={10} className={styles.Colone}>
              <span className={styles.p1}>上传文件： </span>
              <Upload 
                name='upload_file'
                action={`${urlHeader}file/upload-files`}
                headers={{
                  'X-Token': localStorage.getItem('token'),
                  Accept: 'application/json',
                }}
                onChange={info=> 
                  {
                    if (info.file.status !== 'uploading') {
                      console.log(info.file, info.fileList);
                    }
                    if (info.file.status === 'done') {
                      this.setState({
                        path:info.file.response&&info.file.response.path,
                      })
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} 文件上传失败`);
                    }
                  } 
                }                
              >
                <Button icon="upload" size='large'>上传文件</Button>
              </Upload> 
              <div className={styles.modal}>模板下载：<a onClick={()=>this.handleDownload('import-template/仓库清单导入模板.xls')} >仓库清单记录.xlsx</a></div>
            </Col>
            <Col span={2} />
            <Col span={12}>    
              <Button type="primary" className={styles.button} onClick={this.onSaveExcel} disabled={!this.state.path} >选择</Button>  
            </Col>  
          </Row>                
        </div>
        {this.state.visible?
          (
            <Modal
              visible={this.state.visible}
              title='产品预览'
              maskClosable={false}
              onOk={this.onCancel}
              width={900}
              onCancel={this.onCancel}
              footer={[
                <Button key="back"  onClick={this.onCancel}>
                  取消
                </Button>,
                <Button key="submit" onClick={this.onSubmit} style={{marginRight:10}}>
                  确认导入
                </Button>,
                <CSVLink data={exportData} headers={headers}>
                  <Button key="export" type="primary">
                    导出数据
                  </Button>,
                </CSVLink>,
              ]}
            >
              <div>
                <div style={{marginBottom:20}}>
                  <span>
                    产品总数:<span style={{marginLeft:10}}>{producDetail.total_num}</span>
                  </span>
                  <span style={{marginLeft:40}}>
                    可导入产品数:<span style={{marginLeft:10}}>{producDetail.success_num}</span>
                  </span>
                  <span style={{marginLeft:40}}>
                    不可导入产品数:<span style={{marginLeft:10}}>{producDetail.error_num}</span>
                  </span>
                </div>
                <Table
                  dataSource={dataSource}
                  columns={columns}
                />
              </div>
            </Modal>
          )
          :null
        }
      </div>
    )
  }
}

export default StoreImport;