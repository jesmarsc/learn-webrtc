import React from 'react';
import classes from './Square.module.scss';

const Square = React.memo(props => {
  return (
    <button className={classes.Square} onClick={props.onClick}>
      {props.entry}
    </button>
  );
});

export default Square;
