import React, { useState, useReducer, useEffect } from 'react';
import Peer from 'peerjs';
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

let peer = null;
let dataConnection = null;

function App() {
  const [boxes, setBoxes] = useState(Array(9).fill(null));
  const [input, setInput] = useState('');
  const [peerId, setPeerId] = useState(null);
  const [{ currentPlayer, winner }, dispatch] = useReducer(
    gameStateReducer,
    initGameState
  );

  const doMove = index => {
    if (!winner && !boxes[index]) {
      const newBoxes = [...boxes];
      newBoxes[index] = currentPlayer ? 'O' : 'X';
      setBoxes(newBoxes);
      dataConnection.send(newBoxes);
    }
  };

  const onChange = event => {
    setInput(event.target.value);
  };

  const joinRoom = event => {
    event.preventDefault();
    peer = new Peer();
    dataConnection = peer.connect(input);
    dataConnection.on('data', boxes => {
      setBoxes(boxes);
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
      dataConnection.on('data', boxes => {
        setBoxes(boxes);
      });
    });
  };

  useEffect(() => {
    return () => {
      if (peer) peer.destroy();
    };
  }, []);

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
    <Square key={index} entry={value} onClick={() => doMove(index)} />
  ));

  return (
    <div className={classes.container}>
      <p>
        {winner ? 'Winner' : 'Current Player'}: {currentPlayer}
      </p>
      <div className={classes.Grid}>{grid}</div>
      {peerId ? (
        <p>Room Number: {peerId}</p>
      ) : (
        <button className={classes.button} onClick={createRoom}>
          Create Room
        </button>
      )}
      <button className={classes.button} type="submit">
        Join Room
      </button>
      <form onSubmit={joinRoom}>
        <label htmlFor="peerInput">Peer ID: </label>
        <input id="peerInput" type="text" value={input} onChange={onChange} />
      </form>
    </div>
  );
}

export default App;
