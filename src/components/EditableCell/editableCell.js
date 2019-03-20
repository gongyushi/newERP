import {  Input, Icon } from 'antd';
import React, { Component } from 'react';

export default class EditableCell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value || '',
      nextValue: this.props.nextValue || '',
      editable: false,
      listing_dynamic_sale_id: this.props.listing_dynamic_sale_id || '',
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value || '',
      nextValue: nextProps.nextValue || '',
      listing_dynamic_sale_id: nextProps.listing_dynamic_sale_id || '',
    });
  }

  handleChange = e => {
    const value =  e.target&&e.target.value;
    this.setState({ value });
  };

  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
    if(this.props.onSave) {
      this.props.onSave(this.state.listing_dynamic_sale_id,this.state.value)
    }
  };
  handleCancel = () => {
    if(this.props.value) {
      this.setState({ 
        editable: false,
        value: this.props.value,
      });
    } else {
      this.setState({ 
        editable: false,
      });
    }  
  }
  edit = () => {
    this.setState({ editable: true });
  };

  render() {
    const { value, editable, nextValue } = this.state;
    const { labelName1, labelName2} = this.props;
    return (
      <div className="editable-cell">
        {editable ? (
          <div>
            <Input
              value={value}
              onChange={this.handleChange}
              onPressEnter={this.check}
              suffix={
                <div>
                  <Icon type="close" style={{marginRight:5,cursor:'pointer',color:'#E4393C'}} onClick={this.handleCancel} />
                  <Icon type="check" className="editable-cell-icon-check" onClick={this.check} />
                </div>
              }
            />
            <div>
              <span>{labelName2 + nextValue}</span>
            </div>
          </div>
        ) : (
          <div >
            <div>
              <span>{labelName1 + value || ' '}</span>
              <Icon type="edit" className="editable-cell-icon" style={{color:'#00CCFF'}} onClick={this.edit} />
            </div>
            <div>
              <span>{labelName2 + nextValue}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
