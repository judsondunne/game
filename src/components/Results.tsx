import React, { useState } from "react";
import { GameState, Player } from "../types";

interface ResultsProps {
  gameState: GameState;
  onNext: () => void;
  currentPlayer: Player;
}

const Results: React.FC<ResultsProps> = ({
  gameState,
  onNext,
  currentPlayer,
}) => {
  const [showResults, setShowResults] = useState(false);

  // Use the server's real contestant ID
  const realContestant = gameState.contestants.find(
    (c) => c.id === gameState.realContestantId
  );
  const votedContestantId = Object.values(gameState.judgeVotes).find(
    (vote) => vote !== null
  );
  const votedContestant = gameState.contestants.find(
    (c) => c.id === votedContestantId
  );
  const correctGuess = realContestant?.id === votedContestantId;

  const handleShowResults = () => {
    setShowResults(true);
  };

  if (!showResults) {
    return (
      <div className="card">
        <h1>Round Results</h1>
        <div style={{ margin: "40px 0" }}>
          <h2>Ready to reveal the results?</h2>
          <div style={{ fontSize: "48px", margin: "20px 0" }}>🎭</div>
          <p>The real contestant will now reveal themselves!</p>
        </div>
        <button className="button" onClick={handleShowResults}>
          Show Results! 🎯
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Round {gameState.currentRound} Results</h1>

      <div style={{ margin: "30px 0" }}>
        <h2>Word: {gameState.currentWord?.word}</h2>
        <div className="definition-display">
          <strong>Real Definition:</strong>
          <br />
          {gameState.currentWord?.definition}
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        <h3>The Real Contestant:</h3>
        <div
          style={{
            padding: "15px",
            borderRadius: "10px",
            backgroundColor: "#4ecdc420",
            border: "2px solid #4ecdc4",
            margin: "10px 0",
          }}
        >
          <strong>{realContestant?.name}</strong> - 🎯 REAL
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        <h3>Judges Voted For:</h3>
        <div
          style={{
            padding: "15px",
            borderRadius: "10px",
            backgroundColor: correctGuess ? "#4ecdc420" : "#ff6b6b20",
            border: `2px solid ${correctGuess ? "#4ecdc4" : "#ff6b6b"}`,
            margin: "10px 0",
          }}
        >
          <strong>{votedContestant?.name}</strong>
          {correctGuess ? " - ✅ CORRECT!" : " - ❌ WRONG!"}
        </div>
      </div>

      <div style={{ margin: "30px 0" }}>
        <h3>Points Awarded:</h3>
        <div style={{ textAlign: "left" }}>
          {correctGuess ? (
            <div>
              <p>
                ✅ <strong>Judges:</strong> +1 point each (correct guess)
              </p>
              <p>
                🎭 <strong>Bluffers:</strong> +1 point each (if someone voted
                for them)
              </p>
            </div>
          ) : (
            <div>
              <p>
                ❌ <strong>Judges:</strong> 0 points (wrong guess)
              </p>
              <p>
                🎯 <strong>Real Contestant:</strong> +1 point (successful bluff)
              </p>
              <p>
                🎭 <strong>Bluffers:</strong> +1 point each (if someone voted
                for them)
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        <h3>Current Standings:</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {gameState.players
            .sort((a, b) => b.points - a.points)
            .map((player, index) => (
              <div
                key={player.id}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor:
                    index === 0 ? "#ffd70020" : "rgba(255,255,255,0.1)",
                  border: `2px solid ${index === 0 ? "#ffd700" : "rgba(255,255,255,0.3)"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  {index === 0 && "🥇 "}
                  {index === 1 && "🥈 "}
                  {index === 2 && "🥉 "}
                  <strong>{player.name}</strong>
                </div>
                <div style={{ fontWeight: "bold", color: "#4ecdc4" }}>
                  {player.points} pts
                </div>
              </div>
            ))}
        </div>
      </div>

      <button className="button" onClick={onNext}>
        Next Round!
      </button>
    </div>
  );
};

export default Results;
