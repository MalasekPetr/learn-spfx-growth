import * as React from 'react';
import type { MyProps } from '../models';

export const My: React.FunctionComponent<MyProps> = (props) => {
  const {
    description,
  } = props;

  return (
    <>
      {description} + "This is a React component using TypeScript."
    </>
  );
};
