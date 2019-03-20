import React, { PureComponent } from 'react';
import { Input, Select, TreeSelect, DatePicker } from 'antd';
import moment from 'moment';
import styles from './index.less';

const { Option } = Select;
const { TreeNode } = TreeSelect;

class EditableLine extends PureComponent {
  constructor(props){
    super(props);
    this.state = {
      editable: props.editable || false,
      type: props.type || 'input',
      name:props.name || '',
      placeholder: props.placeholder || '',
      value: props.value,
      defaultValue: props.defaultValue || '--',
      option: props.options || [],
      dateFormat: props.dateFormat || 'YYYY-MM-DD',
    };
  };
  componentWillReceiveProps(props) {
    if(props.editable !== this.state.editable){
      this.setState({
        editable: props.editable,
      });
    }
  };
  onInputChange = (e) => {
    const { value } = e.target;
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(this.state.name,value);
    }
  };
  onDatePickerChange = (data, value) => {
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(this.state.name, value);
    }
  };
  onSelectChange = (key) => {
    const { option } = this.state;
    const value = option.filter(item=>item.key === key)[0];
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(this.state.name, value);
    }
  };
  onTreeChange = e => {
    const { value } = e.target;
    if(value){
      this.setState({ value });
      if (this.props.onChange) {
        this.props.onChange(this.state.name, value);
      }
    }
  };
  renderInput = (placeholder, value) => {
    return (<Input value={value} className={styles.input} placeholder={placeholder} onChange={this.onInputChange} />);
  };
  renderDatePicker = (dateFormat, value) => {
    return (
      <DatePicker
        defaultValue={moment(value, dateFormat)}
        format={dateFormat}
        onChange={this.onDatePickerChange}
      />
    );
  };
  renderSelect = (option, placeholder, value) => {
    if (toString.call(option) !== '[object Array]') option = [];
    return (
      <Select
        className={styles.select}
        size='large'
        placeholder={placeholder}
        onChange={this.onSelectChange}
        defaultValue={value}
        showSearch    
        optionFilterProp='children'
      >
        {
          option.map(item=>{
            return (<Option value={item.key}>{item.value}</Option>)
          })
        }
      </Select>
    );
  };
  renderTree = (option, value) => {
    if (toString.call(option) !== '[object Array]') option = [];

    return (
      <TreeSelect
        showSearch
        className={styles.select}
        value={String(value)}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        placeholder="Please select"
        treeDefaultExpandAll
        onChange={this.onTreeChange}
      >
        {this.renderTreeNodes(option)}
      </TreeSelect>
    );
  };
  // 树渲染
  renderTreeNodes = data => {
    return data.map(item => {
      if ('children' in item) {
        return (
          <TreeNode title={item.value} value={item.id} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.value} value={item.id} key={item.id} dataRef={item} />;
    });
  };

  render() {
    const { editable, type, placeholder, option, dateFormat, defaultValue } = this.state;
    let { value } = this.state;
    if (toString.call(value) === '[object Object]'){
       value = '';
    }

    return (
      <div className={styles.editableRow}>
        {editable===true ?
          (
            <div className={styles.wrapper}>
              {
                type === 'input' ? this.renderInput(placeholder, value) :
                  (type === 'time' ? this.renderDatePicker(dateFormat, value) :
                      (type === 'select' ? this.renderSelect(option, placeholder, value) :
                          (type === 'tree' ? this.renderTree(option, value) : '')
                      )
                  )
              }
            </div>
          ) :
          (<p className={styles.wrapper}>{value || (value === 0 ? 0 : defaultValue)}</p>)
        }
      </div>
    );
  }
}

export default EditableLine;
