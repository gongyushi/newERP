import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import { getActionList } from '../../utils/authority';
/**
 * 确认删除的对话框
 * example:
 *
 <DeleteConfirm
 onOk={e=>{ console.log(123); return true;}}
 okText="aaa"
 onCancel={e=>{ console.log(456); return true;}}
 cancelText="bbb"
 action="/product/index"
 ><Button type="primary" >
 Open Modal with async logic
 </Button></DeleteConfirm>
 * props = {
 *  title:'系统提示',
 *  content:'确认删除？',
 *  okText: '确 定', //OK 按钮的文字,
 *  onOk: function //OK 按钮的回调，实现后必须返回 true 才可以关闭窗口,
 *  cancelText: '取 消' //Cancel 按钮的文字,
 *  onCancel: function //Cancel 按钮的回调，实现后必须返回 true 才可以关闭窗口，
 *  action="/product/index"
 * }
 *
 * @author : wenjie.bao
 */
export default class DeleteConfirmModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modal: null,
    };
  };
  handleOk = () => {
    const { modal } = this.state;
    if(this.props.onOk){
      this.props.onOk();
      modal.destroy();
    } else {
      modal.destroy()
    }
  };
  handleCancel = () => {
    const { modal } = this.state;
    if(this.props.onCancel) {
      this.props.onCancel();
    }
    modal.destroy();
  };

  handleClick = () => {
    const modal = Modal.confirm({
      title: this.props.title ? this.props.title : '系统提示',
      content: this.props.content ? this.props.content : '确认删除？',
      okText: this.props.okText ? this.props.okText : '确 定',
      okType: 'danger',
      onOk: this.handleOk,
      cancelText: this.props.cancelText ? this.props.cancelText : '取 消',
      onCancel: this.handleCancel,
    });

    this.setState({ modal });
  };

  render() {
    const { action } = this.props;
    const actionList = JSON.parse(getActionList());
    if(
      toString.call(action) !== '[object Undefined]' &&
      toString.call(actionList) === '[object Array]' &&
      actionList.indexOf(action) <= -1
    ){
      return ("");
    }

    if(toString.call(this.props.children ) === '[object Array]'){
      return (
        <div>
          {React.Children.map(this.props.children, (child) => {
            return React.cloneElement(child, {
              onClick: this.handleClick,
            });
          })}
        </div>
      )
    }else{
      return React.cloneElement(this.props.children, {
        onClick: this.handleClick,
      });
    }
  }
}
