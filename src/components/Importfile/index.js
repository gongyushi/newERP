import React from 'react';
import { Upload, Button } from 'antd';
import PropTypes from 'prop-types';

/**
 * 配置项通过props传递
 *  1.name:发到后台的文件参数名
 *  2.actionUrl:后台接口地址
 *  3.headers:响应头
 *  4.onUploading上传过程中的钩子方法
 *  5.onUploaded上传完成的钩子
 *  6.onUploadError上传出错的钩子
 *  7.父组件调用可自定义按钮样式，包含在里层就行，默认样式为button
 *  8.ShowFiles:是否显示上传成功的列表
 */
function ImportFile(props) {
  const uploadProps = {
    name: props.name || 'file',
    action: props.actionUrl ? global.gconfig.urlHeader + props.actionUrl : '',
    headers: props.headers || {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'uploading' && props.onUploading) {
        props.onUploading(info);
      }
      if (info.file.status === 'done' && props.onUploaded) {
        props.onUploaded(info);
      } else if (info.file.status === 'error' && props.onUploadError) {
        props.onUploadError(info);
      }
    },
    showUploadList: props.ShowFiles || false,
    disabled: props.disabled || false,
  };
  return (
    <Upload {...uploadProps}>
      {props.children ? props.children : <Button type="primary">导入</Button>}
    </Upload>
  );
}

ImportFile.propTypes = {
  name: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  headers: PropTypes.object.isRequired,
};

export default ImportFile;
