import React, { useState, useReducer, useEffect } from 'react';
import Peer from 'peerjs';
import Square from './components/Square';

import classes from './App.module.scss';

const initGameState = {
  board: new Array(9).fill(null),
  player: 0,
  winner: false,
};

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
    case 'MAKE_MOVE': {
      if (!state.winner && !state.board[action.index]) {
        const newBoard = [...state.board];
        newBoard[action.index] = state.player ? 'O' : 'X';
        return { ...state, board: newBoard };
      }
      return state;
    }
    case 'NEXT_TURN':
      return { ...state, player: state.player ^ 1 };
    case 'SET_WINNER':
      return { ...state, winner: true };
    default:
      throw new Error('Invalid action.type!');
  }
};

let peer = null;
let dataConnection = null;

function App() {
  const [input, setInput] = useState('');
  const [peerId, setPeerId] = useState(null);
  const [{ board, player, winner }, dispatch] = useReducer(
    gameStateReducer,
    initGameState
  );

  const sendMove = index => {
    if (dataConnection) dataConnection.send(index);
    dispatch({ type: 'MAKE_MOVE', index });
  };

  const joinRoom = event => {
    event.preventDefault();
    peer = new Peer();
    dataConnection = peer.connect(input);
    dataConnection.on('data', index => {
      dispatch({ type: 'MAKE_MOVE', index });
    });
  };

  const createRoom = () => {
    setPeerId('Generating...');
    peer = new Peer();
    peer.on('open', id => {
      setPeerId(id);
    });
    peer.on('connection', connection => {
      dataConnection = connection;
      dataConnection.on('data', index => {
        dispatch({ type: 'MAKE_MOVE', index });
      });
    });
  };

  useEffect(() => {
    let winner = false;
    for (const condition of winConditions) {
      const [box1, box2, box3] = condition;
      if (
        board[box1] !== null &&
        board[box1] === board[box2] &&
        board[box1] === board[box3]
      ) {
        winner = true;
      }
    }

    if (winner) dispatch({ type: 'SET_WINNER' });
    else dispatch({ type: 'NEXT_TURN' });
  }, [board]);

  const onChange = event => {
    setInput(event.target.value);
  };

  const grid = board.map((value, index) => (
    <Square key={index} entry={value} onClick={() => sendMove(index)} />
  ));

  return (
    <div className={classes.container}>
      <p>
        {winner ? 'Winner' : 'Current Player'}: {player}
      </p>
      <div className={classes.Grid}>{grid}</div>

      <div className={classes.controls}>
        <form className={classes.form} onSubmit={joinRoom}>
          <label className={classes.form__label}>
            Peer ID:{' '}
            <input
              className={classes.form__input}
              id="peerInput"
              type="text"
              value={input}
              onChange={onChange}
            />
          </label>
          <button className={classes.button} type="submit">
            Join
          </button>
        </form>
        {peerId ? (
          <p>Room Number: {peerId}</p>
        ) : (
          <button className={classes.button} onClick={createRoom}>
            Create
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
