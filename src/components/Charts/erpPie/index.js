import React from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Label, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';

const { DataView } = DataSet;

class ErpPie extends React.Component{
  componentDidMount(){

  }
  render(){
    const data = this.props.pieData;
    const names =this.props.name;
    const dv = new DataView();
    dv.source(data).transform({
      type: 'percent',
      field: 'count',
      dimension: 'item',
      as: 'percent',
    });
    const cols = {
      percent: {
        formatter: val => {
          val = `${(val * 100).toFixed(2) }%`;
          return val;
        },
      },
    };
    return(
      <Chart style={{width:'100%',height:'400px'}} data={dv} scale={cols} padding={[40, 60, 40, 40]} forceFit>
        <Coord type='theta' radius={0.75} />
        <Axis name="percent" />
        <Legend position='right' offsetY={-window.innerHeight / 2 + 120} offsetX={-50} />
        <Tooltip
          showTitle={false}
          title={name}
          itemTpl='<li>
          <span style="background-color:{color};" class="g2-tooltip-marker"></span>
            <div>{title} : {name}</div>
            <div>提成额 : {number}</div>
            <div>占比 : {value}</div>
          </li>'
        />
        <Geom
          type="intervalStack"
          position="percent"
          color='item'
          tooltip={['item*percent*count*names', (item, percent, count) => {
            percent = `${(percent * 100).toFixed(2)}%`;
            return {
              name: item,
              title: names,
              number: count,
              value: percent,
            };
          }]}
          style={{ lineWidth: 1, stroke: '#fff' }}
        >
          <Label 
            content='percent' 
            offset={-40} 
            textStyle={{
            rotate: 0,
            textAlign: 'center',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)',
          }} 
          />
        </Geom>
      </Chart>
    )
  }
}

export default ErpPie;