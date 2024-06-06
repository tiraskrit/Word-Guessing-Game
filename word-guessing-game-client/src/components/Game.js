import React, { useState, useEffect } from 'react';
import './Game.css'; // Import the CSS file for styling

const Game = ({ team1Name, team2Name, onRestartGame, rounds }) => {
  const [gameState, setGameState] = useState({
    team_1_score: 0,
    team_2_score: 0,
    current_turn: 1,
    word_description: '',
    current_hint: '',
    rounds_left: rounds,
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
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Load words from the JSON file in the public folder
    fetch('/top_1000_words.json')
      .then(response => response.json())
      .then(data => {
        const formattedWords = data.map(item => ({
          word: item[0],
          description: item[1].definitions[0].definition,
          hint: item[1].definitions[0].synonyms ? item[1].definitions[0].synonyms[0] : '',
        }));
        setWords(formattedWords);
        setLoading(false); // Set loading to false after fetching words
      })
      .catch(error => console.error('Error fetching words:', error));
  }, []);

  useEffect(() => {
    if (gameStarted && !waitingForOtherTeam && !roundOver) {
      fetchWord();
    }
  }, [gameStarted, waitingForOtherTeam, roundOver, words]);

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

  const fetchWord = () => {
    if (words.length > 0) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setCurrentDescription(randomWord.description);
      setCurrentAnswer(randomWord.word);
      setWordLength(randomWord.word.length);
      setHint('');
      setGameState(prevState => ({ ...prevState, word_description: randomWord.word }));
      setTimeLeft(waitingForOtherTeam ? 10 : 60);
    }
  };

  const fetchHint = () => {
    if (currentAnswer && !waitingForOtherTeam) {
      const word = words.find(word => word.word === currentAnswer);
      setHint(word.hint);
      setHintUsed(true);
    }
  };

  const handlePass = () => {
    handleAction('pass');
  };

  const handleAction = (action) => {
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
    } else { // Handle "Wrong" or "Pass" action
      if (waitingForOtherTeam) { // If already waiting for the other team
        setRoundOver(true); // End the round
      } else { // If it's the first wrong or pass action
        setWaitingForOtherTeam(true); // Set waiting for the other team
        setTimeLeft(10); // Reset time for the other team
        setGameState(prevState => ({ ...prevState, current_turn: prevState.current_turn === 1 ? 2 : 1 }));
      }
    }
  };
  

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameState(prevState => ({ ...prevState, current_turn: 1 }));
    fetchWord(); // Ensure the first word is fetched
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
      word_description: '',
      rounds_left: rounds, // Reinitialize with the number of rounds
    });
    onRestartGame();
  };

  const nextRound = () => {
    if (roundNumber < rounds) {
      setRoundOver(false);
      setHintUsed(false);
      setWaitingForOtherTeam(false);
      setRoundNumber(prevRound => prevRound + 1);
      fetchWord();
    } else {
      setGameOver(true); // Set gameOver to true when maximum rounds are reached
    }
  };
  

  if (loading) {
    return <div>Loading...</div>; // Show loading while fetching words
  }

  if (!gameStarted) {
    startGame();
    return null;
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
          <button onClick={fetchHint} disabled={gameOver || roundOver || waitingForOtherTeam}>Get Hint</button>
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
              <h2>Game Over</h2>
              {gameState.team_1_score === gameState.team_2_score ? (
                <p>Match drawn!</p>
              ) : (
                <p>Player {gameState.team_1_score > gameState.team_2_score ? 1 : 2} has won the game with {Math.max(gameState.team_1_score, gameState.team_2_score)} points.</p>
              )}
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
