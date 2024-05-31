import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Game.css'; // Import the CSS file for styling

const Game = ({ team1Name, team2Name, onRestartGame }) => {
  const [gameState, setGameState] = useState({
    team_1_score: 0,
    team_2_score: 0,
    current_turn: 1,
    word_description: ''
  });
  const [currentDescription, setCurrentDescription] = useState('');
  const [hint, setHint] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [waitingForOtherTeam, setWaitingForOtherTeam] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [wordLength, setWordLength] = useState(0);

  useEffect(() => {
    if (gameStarted && !waitingForOtherTeam && !roundOver) {
      fetchWord();
    }
  }, [gameStarted, waitingForOtherTeam, roundOver]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && gameStarted && !roundOver) {
      const interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0 && !roundOver) {
      handleAction('wrong');
    }
  }, [timeLeft, gameOver, gameStarted, roundOver]);

  const fetchWord = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get_word');
      setCurrentDescription(response.data.description);
      setCurrentAnswer(response.data.word);
      setWordLength(response.data.letters);
      setHint('');
      setGameState(prevState => ({ ...prevState, word_description: response.data.word }));
      setTimeLeft(waitingForOtherTeam ? 10 : 60);
    } catch (error) {
      console.error('Error fetching word:', error);
    }
  };

  const fetchHint = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get_hint');
      setHint(response.data.hint);
      setHintUsed(true);
    } catch (error) {
      console.error('Error fetching hint:', error);
    }
  };

  const handlePass = () => {
    handleAction('pass');
  };

  const handleAction = async (action) => {
    try {
      const response = await axios.post('http://localhost:5000/submit_guess', { action });
      if (response.data.error) {
        console.error('Error:', response.data.error);
        return;
      }

      if (action === 'correct') {
        const points = hintUsed || waitingForOtherTeam ? 10 : 20;
        setGameState(prevState => {
          const newScore = prevState.current_turn === 1
            ? { team_1_score: prevState.team_1_score + points }
            : { team_2_score: prevState.team_2_score + points };
          return { ...prevState, ...newScore };
        });

        setHintUsed(false);

        if (waitingForOtherTeam) {
          setWaitingForOtherTeam(false);
          setRoundOver(true);
        } else {
          setRoundOver(true);
          setGameState(prevState => ({ ...prevState, current_turn: prevState.current_turn === 1 ? 2 : 1 }));
        }
      } else {
        if (waitingForOtherTeam) {
          setWaitingForOtherTeam(false);
          setRoundOver(true);
        } else {
          setWaitingForOtherTeam(true);
          setTimeLeft(10);
          setGameState(prevState => ({ ...prevState, current_turn: prevState.current_turn === 1 ? 2 : 1 }));
        }
      }

      if (response.data.game_over) {
        setGameOver(true);
      }
    } catch (error) {
      console.error('Error handling action:', error);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameState(prevState => ({ ...prevState, current_turn: 1 }));
  };

  const restartGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setRoundOver(false);
    setRoundNumber(1);
    setGameState({
      team_1_score: 0,
      team_2_score: 0,
      current_turn: 1,
      word_description: ''
    });
    onRestartGame();
  };

  const nextRound = () => {
    setRoundOver(false);
    setHintUsed(false);
    setWaitingForOtherTeam(false);
    setRoundNumber(prevRound => prevRound + 1);
    fetchWord();
  };

  if (!gameStarted) {
    startGame();
    return null;
  }

  if (!currentDescription && !waitingForOtherTeam && !roundOver) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-container">
      <h1 className="title">Word Guessing Game</h1>
      <div className="round-info">Round {roundNumber}</div>
      <div className="score-container">
        <div className="team-panel team1">
          <h2>{team1Name}</h2>
          <div className="score">{gameState.team_1_score} points</div>
        </div>
        <div className="status-panel">
          <div className="current-answer">Current Answer: {currentAnswer}</div>
          <div className="current-description">Current Description: {currentDescription}</div>
          <div className="word-length">Word length: {wordLength}</div>
          <div className="hint">Hint: {hint}</div>
          <div className="time-left">Time Left: {timeLeft} seconds</div>
          <div className="current-turn">Current Turn: {gameState.current_turn === 1 ? team1Name : team2Name}</div>
          <button onClick={fetchHint} disabled={gameOver || roundOver}>Get Hint</button>
          <div className="action-buttons">
            <button onClick={() => handleAction('correct')} disabled={gameOver || roundOver}>Correct</button>
            <button onClick={() => handleAction('wrong')} disabled={gameOver || roundOver}>Wrong</button>
            <button onClick={handlePass} disabled={gameOver || roundOver}>Pass</button>
          </div>
          {roundOver && !gameOver && (
            <button className="next-round-button" onClick={nextRound}>Next Round</button>
          )}
          {gameOver && (
            <div className="game-over">
              <h2>Congratulations!</h2>
              <p>Player {gameState.team_1_score > gameState.team_2_score ? 1 : 2} has won the game with {Math.max(gameState.team_1_score, gameState.team_2_score)} points.</p>
              <button onClick={restartGame}>Start New Game</button>
            </div>
          )}
        </div>
        <div className="team-panel team2">
          <h2>{team2Name}</h2>
          <div className="score">{gameState.team_2_score} points</div>
        </div>
      </div>
    </div>
  );
};

export default Game;
