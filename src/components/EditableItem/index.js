import React, { PureComponent } from 'react';
import { Input, Icon } from 'antd';

export default class EditableItem extends PureComponent {
  state = {
    value: this.props.value,
    editable: false,
    title: this.props.title || '',
  };
  componentWillReceiveProps(nextProps){
    this.setState({
      value: nextProps.value,
    });
  }
  handleChange = e => {
    const { value } = e.target;
    this.setState({ value });
  };
  handleCheck = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  };
  handleEdit = () => {
    this.setState({ editable: true });
  };
  handleCancel = () => {
    this.setState({ 
      editable: false,
      value: this.props.value,
    });
  }
  render() {
    const { value, editable,title } = this.state;
    const width = Number.parseInt((this.props.width || '100'),10);
    return (
      <div>
        {editable ? (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
            {title} 
            <Input value={value} style={{width}} onChange={this.handleChange} onPressEnter={this.handleCheck} />
            <Icon type="check" style={{marginLeft:5,cursor:'pointer',color:'#6F9EEF'}} onClick={this.handleCheck} />
            <Icon type="close" style={{marginLeft:5,cursor:'pointer',color:'#E4393C'}} onClick={this.handleCancel} />
          </div>
        ) : (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
            <span style={{margin:0}}>{title} {value || ' '}</span>
            <Icon type="edit" style={{marginLeft:5,cursor:'pointer',color:'#6F9EEF'}} onClick={this.handleEdit} />
          </div>
        )}
      </div>
    );
  }
}
