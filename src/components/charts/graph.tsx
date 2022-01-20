import React from 'react';
import Plot from 'react-plotly.js';
import Theme from '../../theme/theme';

const { colors, fonts } = Theme;

export interface GraphProps {
  title: string;
  width: number;
  height: number;
  data: any;
  layout?: any;
}

const Graph: React.FC<GraphProps> = (props: GraphProps) => (
  <Plot
    data={props.data}
    layout={{
      width: props.width,
      height: props.height,
      title: props.title,
      paper_bgcolor: colors.darkBlack,
      plot_bgcolor: colors.darkBlack,
      gridcolor: colors.white,
      font: {
        color: colors.white,
        family: fonts.code,
        size: 10,
      },
      yaxis: {
        gridcolor: colors.black,
      },
      xaxis: {
        gridcolor: colors.black,
      },
      ...props.layout,
    }}
  />
);

export default Graph;
