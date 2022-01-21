import React from 'react';
import styled from 'styled-components';
import Theme from '../theme';

const { colors } = Theme;

const StyledPath = styled.path`
  animation: rotation 1.5s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  transform-origin: 50% 50%;

  @keyframes rotation {
    from {
      transform: rotateZ(0deg);
    }
    to {
      transform: rotateZ(360deg);
    }
  }
`;

interface CdSpinnerProps {
  color?: string;
  diameter?: number;
}

export const CdSpinner: React.FC<CdSpinnerProps> = (props: CdSpinnerProps) => (
  <svg
    width={props.diameter ?? '4rem'}
    height={props.diameter ?? '4rem'}
    viewBox={'0 0 496 512'}
  >
    <StyledPath
      fill={props.color ?? colors.darkGrey}
      d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zM88 256H56c0-105.9 86.1-192 192-192v32c-88.2 0-160 71.8-160 160zm160 96c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32z"
    />
  </svg>
);
