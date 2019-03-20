import React from 'react';
import {Modal, Upload, message, Button} from 'antd';
import { erpPost } from '../../services/ajax';
import downloadFiles from '../../components/DownloadFiles/DownloadFiles';

class ProductImport extends React.Component {
  constructor(props){
    super(props);
    this.state={
      path: '',
      ext: '',
    }
  }

  onSaveExcel = () => {
    const {path,ext}=this.state;
    const {refreshProductList, onCancle} = this.props;
    erpPost('/product/import-product-listing', {path, ext}, res => {
      refreshProductList();
      onCancle();
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
    const { visible, onCancle, isProduct }=this.props;
    const { urlHeader } = global.gconfig;
    return (
      <Modal
        title={<span style={{color:'#B3B3B3'}}>产品导入</span>}
        visible={visible}
        onOk={this.onSaveExcel}
        onCancel={onCancle}
        maskClosable={false}
      >
        <p style={{color:'#B3B3B3'}}>请选择导入文件</p>
        <Upload
          name='file_stu'
          action={`${urlHeader}/product/listing/upload-file`}
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
                message.success(`${info.file.name} 文件上传成功`);
                console.log('info.file.response.data',info.file.response.data)
                this.setState({
                  path:info.file.response.data.path,
                  ext:info.file.response.data.ext,
                })
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 文件上传失败`);
              }
            }
          }
        >
          <Button type='primary' size='large' style={{marginTop:5}} >选择导入文件</Button>
        </Upload>
        <div style={{marginTop:20}}>
          <span style={{color:'#CCCCCC', marginRight:20}}>请按照导入模板填写</span>
          {isProduct?<a onClick={()=>this.handleDownload('import-template/产品信息导入模板.xlsx')} >模板下载</a>
          :<a onClick={()=>this.handleDownload('import-template/商品关联产品导入模板.xlsx')}>模板下载</a>}
        </div>
      </Modal>
    )
  }
}
export default ProductImport;
