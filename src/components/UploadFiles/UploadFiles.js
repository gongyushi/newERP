import React from 'react';
import {
  Upload,
  Icon,
} from 'antd';
import PermissionButton from '../PermissionButton';
import Prompt from '../Prompt';

export default class UploadFiles extends React.Component {
  state = {
    loading: false,
    imageUrl: this.props.imageUrl,
  };
  componentWillReceiveProps(next){
    this.setState({
      imageUrl: next.imageUrl,
    });
  }
  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }
  handleUpload = (info) => {
    const { type } = this.state;
    this.setState({
      loading: true,
    });
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      Prompt.success({content:`${info.file.name}上传成功`});
      if(type === 'image'){
        this.getBase64(info.file.originFileObj, imageUrl =>
          this.setState({
            imageUrl,
          }),
        );
      }
      this.setState({
        loading: false,
      });
      if(this.props.onUpload){
        this.props.onUpload('success',info.file);
      }
    } else if (info.file.status === 'error') {
      Prompt.error({contemt:`${info.file.name} 上传失败`});
      this.setState({
        loading: false,
      });
      if(this.props.onUpload){
        this.props.onUpload('error',info.file);
      }
    }
  }
  // 图片上传
  beforeUpload = file => {
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJPG) {
      Prompt.error({content:'只能上传JPG或PNG格式图片!'});
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      Prompt.error({content:'图片不能超过2M!'});
    }
    return isJPG && isLt2M;
  }
  render(){
    const { data, url, fileName, title, type } = this.props;
    const { loading, imageUrl } = this.state;
    return(
      <div>
        <Upload
          name={fileName}
          action={`${global.gconfig.urlHeader}/${url}`}
          headers={{
            'X-Token': localStorage.getItem('token'),
            Accept: 'application/json',
          }}
          className={type === 'image' ? 'avatar-uploader' : ''}
          listType={type === 'image' ? 'picture-card' : ''}
          showUploadList={false}
          onChange={this.handleUpload}
          data={data}
          beforeUpload={type === 'image' ? this.beforeUpload : ()=>{}}
        >
          {
            type === 'image' ? (
              <div>
                {imageUrl ? (
                  <img src={imageUrl} style={{ width: 100, height: 100 }} alt="" />
                ) : (
                  <div>
                    <Icon type={this.state.loading ? 'loading' : 'plus'} />
                    <div className="ant-upload-text">上传</div>
                  </div>
                )}
              </div>
            ) : (
              <PermissionButton
                type='primary'
                ghost
                loading={loading}
                action={this.props.action}
              >
                <Icon type="upload" />
                {title}
              </PermissionButton>
            )
          }
        </Upload>
      </div>
    );
  }
}