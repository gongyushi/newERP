import React, { PureComponent } from 'react';
import { Input, Icon } from 'antd';

require('../ListStyle.less');

export default class TextOrInput extends PureComponent {
  state = {
    value: this.props.value,
    editable: false,
  };
  handleChange = e => {
    const { value } = e.target;
    this.setState({ value });
  };
  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  };
  edit = () => {
    this.setState({ editable: true });
  };
  render() {
    const { value, editable } = this.state;
    return (
      <div>
        {editable ? (
          <div>
            <Input value={value} onChange={this.handleChange} onPressEnter={this.check} className="InputW200"  />
            <Icon type="check" onClick={this.check} />
          </div>
        ) : (
          <div>
            <span>{value || ' '}</span>
            <Icon type="edit" onClick={this.edit} />
          </div>
        )}
      </div>
    );
  }
}
