import React, { useState } from 'react';
import Game from './components/Game';
import HostDashboard from './components/HostDashboard';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');

  const startGame = (team1, team2) => {
    setTeam1Name(team1);
    setTeam2Name(team2);
    setGameStarted(true);
  };

  const restartGame = () => {
    setGameStarted(false);
  };

  return (
    <div>
      {!gameStarted ? (
        <HostDashboard startGame={startGame} />
      ) : (
        <Game team1Name={team1Name} team2Name={team2Name} onRestartGame={restartGame} />
      )}
    </div>
  );
};

export default App;
