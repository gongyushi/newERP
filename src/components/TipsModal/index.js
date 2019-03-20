import React, { PureComponent } from 'react';
import { Modal } from 'antd';

export default class TipsModal extends PureComponent {
  state = {
    modal: null,
  };
  handleClick = e => {
    let secondsToGo = 10;
    const modal = Modal.info({
      title: this.props.title ? this.props.title : `系统提示`,
      content: this.props.content ? this.props.content : `请马上进行审核`,
      okText: '确 定',
      onOk: this.props.onSubmit ? this.props.onSubmit : this.destroy,
    });
    this.setState({ modal });
    setTimeout(() => this.destroy(), secondsToGo * 1000);
  };

  destroy = () => {
    const { modal } = this.state;
    modal.destroy()
  };

  render() {
    if(toString.call(this.props.children ) === '[object Array]'){
      return (
        <div>
          {React.Children.map(this.props.children, (child) => {
            return React.cloneElement(child, {
              onClick: this.handleClick
            });
          })}
        </div>
      )
    } else {
      return React.cloneElement(this.props.children, {
         onClick: this.handleClick
      });
    }
  }
}
