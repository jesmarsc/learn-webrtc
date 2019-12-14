import React, { useState, useReducer, useEffect } from 'react';
import Square from './components/Square';

import classes from './App.module.scss';

const initGameState = { player: 0, winner: null };

const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const gameStateReducer = (state, action) => {
  switch (action.type) {
    case 'NEXT_TURN':
      return { ...state, currentPlayer: state.currentPlayer ^ 1 };
    case 'SET_WINNER':
      return { ...state, winner: true };
    default:
      throw new Error('Invalid action.type!');
  }
};

function App() {
  const [boxes, setBoxes] = useState(Array(9).fill(null));
  const [{ currentPlayer, winner }, dispatch] = useReducer(
    gameStateReducer,
    initGameState
  );

  const clicked = index => {
    if (!winner && !boxes[index]) {
      const newBoxes = [...boxes];
      newBoxes[index] = currentPlayer ? 'O' : 'X';
      setBoxes(newBoxes);
    }
  };

  useEffect(() => {
    let winner = false;
    for (const condition of winConditions) {
      const [box1, box2, box3] = condition;
      if (
        boxes[box1] !== null &&
        boxes[box1] === boxes[box2] &&
        boxes[box1] === boxes[box3]
      ) {
        winner = true;
      }
    }

    if (winner) dispatch({ type: 'SET_WINNER' });
    else dispatch({ type: 'NEXT_TURN' });
  }, [boxes]);

  const grid = boxes.map((value, index) => (
    <Square key={index} entry={value} onClick={() => clicked(index)} />
  ));

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <p>
        {winner ? 'Winner' : 'Current Player'}: {currentPlayer}
      </p>
      <div className={classes.Grid}>{grid}</div>
    </div>
  );
}

export default App;
