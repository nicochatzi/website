import React, { useEffect } from 'react';
import Theme from '../../theme';
import Loadable from 'react-loadable';
import styled from 'styled-components';
import { CdSpinner } from '../spinner';
import { window } from 'browser-monads';

const { colors, fonts } = Theme;

export interface GraphProps {
  title: string;
  width?: number;
  height?: number;

  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
}

const Plotly = Loadable({
  loader: () => import(`react-plotly.js`),
  loading: ({ timedOut }) =>
    timedOut ? (
      <blockquote>Error: Loading Plotly timed out.</blockquote>
    ) : (
      <CdSpinner />
    ),
  timeout: 10000,
});

const GraphStyleWrapper = styled.span`
  .main-svg {
    border-radius: 1rem;
    border-width: 10rem;
  }

  .modebar-group {
    margin-top: 1rem !important;
    margin-right: 1.5rem !important;
  }
`;

const Graph: React.FC<GraphProps> = (props: GraphProps) => {
  const findWidth = () => {
    const maxWidth = 632;
    const newWidth = window.innerWidth * 0.92;
    return newWidth > maxWidth ? maxWidth : newWidth;
  };

  const [width, setWidth] = React.useState(findWidth());

  useEffect(() => {
    const updateWidth = () => setWidth(findWidth());
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [window.innerWidth]);

  return (
    <GraphStyleWrapper>
      <Plotly
        data={props.data}
        layout={{
          width,
          height: props.height ?? 400,
          title: props.title,
          paper_bgcolor: colors.darkBlack,
          plot_bgcolor: colors.darkBlack,
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
          showlegend: false,
          margin: {
            l: 36,
            r: 30,
            b: 50,
            t: 75,
            pad: 4,
          },
          autosize: true,
          ...props.layout,
        }}
        config={{
          showLink: false,
          showTips: false,
          displaylogo: false,
          modeBarButtons: [['select2d', 'zoom2d', 'pan2d', 'autoScale2d']],
          ...props.config,
        }}
        useResizeHandler
      />
    </GraphStyleWrapper>
  );
};

export default Graph;
