import React from 'react';
import { Chart, Axis, Geom, Tooltip, Coord, Legend} from 'bizcharts';
import DataSet from '@antv/data-set';

class Histogram extends React.Component{
  componentDidMount(){

  }
  render(){
    const { data } = this.props;
    const ds = new DataSet();
    const dv = ds.createView().source(data);
    dv.transform({
      type: 'fold',
      fields: this.props.list, // 展开字段集
      key: 'type', // key字段
      value: 'value', // value字段
    });
    return(
      <Chart height={400} data={dv} forceFit>
        <Legend />
        <Coord transpose scale={[1, -1]} />
        <Axis name="real_name" label={{ offset: 12 }} />
        <Axis name="value" position='right' />
        <Tooltip />
        <Geom 
          type="interval" 
          position="real_name*value" 
          color='type'
          adjust={[{
            type: 'dodge',
            marginRatio: 1 / 32,
          }]} 
        />
      </Chart>
    )
  }
}

export default Histogram;