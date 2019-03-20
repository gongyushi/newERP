import { Tooltip, Select } from 'antd';

const { Option } = Select;

const SelectFilter =  (props) => {
  const { style, options, disabled, size, placeholder, labelInValue } = props;
  return (
    <Select
      style={style}
      showSearch
      placeholder={placeholder}
      size={size}
      disabled = {disabled}
      labelInValue={labelInValue}
      optionFilterProp='children'
    >
      {
        options.map(size=>{
          return (
            <Option value={size.id} key={size.id} >
              {size.remark}
            </Option>
          )
        })
      }
    </Select>
  )
};

export default SelectFilter;
