import React from 'react';
import { Select } from 'antd';

// 下拉列表数据
const { Option } = Select;
// 下拉选项
class ComSelect extends React.Component {
  handleChange = value => {
    console.log(`selected ${value}`);
  };

  handleBlur = () => {
    console.log('blur');
  };

  handleFocus = () => {
    console.log('focus');
  };
  render() {
    return (
      <Select
        showSearch
        style={{ width: 200 }}
        placeholder="Select a person"
        optionFilterProp="children"
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="tom">Tom</Option>
      </Select>
    );
  }
}
export default ComSelect;
