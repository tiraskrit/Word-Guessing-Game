import React, { useState } from 'react';
import axios from 'axios';
import './HostDashboard.css'; // Import CSS file for styling

const HostDashboard = ({ startGame }) => {
  const [rounds, setRounds] = useState(10); // Default to 10 rounds, change as needed
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');

  const handleStartGame = async () => {
    try {
      await axios.post('http://localhost:5000/start_game', { rounds });
      startGame(team1Name, team2Name); // Start the game after initializing game state with team names
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  return (
    <div className="host-dashboard">
      <h1>Host Dashboard</h1>
      <div className="input-container">
        <label>
          Team 1 Name:
          <input
            type="text"
            value={team1Name}
            onChange={(e) => setTeam1Name(e.target.value)}
          />
        </label>
        <label>
          Team 2 Name:
          <input
            type="text"
            value={team2Name}
            onChange={(e) => setTeam2Name(e.target.value)}
          />
        </label>
        <label>
          Number of Rounds:
          <input
            type="number"
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
          />
        </label>
      </div>
      <button className="start-button" onClick={handleStartGame}>
        Start Game
      </button>
    </div>
  );
};

export default HostDashboard;
