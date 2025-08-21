import React, { useState } from "react";
import { GameState } from "../types";

interface LoginScreenProps {
  onAddPlayer: (name: string) => void;
  onStartGame: () => void;
  onClearStoredPlayer?: () => void;
  playerCount: number;
  maxPlayers: number;
  gameState: GameState;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onAddPlayer,
  onStartGame,
  onClearStoredPlayer,
  playerCount,
  maxPlayers,
  gameState,
}) => {
  const [playerName, setPlayerName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onAddPlayer(playerName.trim());
      setPlayerName("");
    }
  };

  return (
    <div className="card">
      <h1>🏝️ Monhegan Fictionary</h1>
      <h2>Welcome to Monhegan Island!</h2>

      <div style={{ margin: "20px 0" }}>
        <p>
          Players joined: {playerCount} / {maxPlayers}
        </p>
        <div
          style={{
            width: "100%",
            height: "20px",
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.min((playerCount / maxPlayers) * 100, 100)}%`,
              height: "100%",
              backgroundColor: "#4ecdc4",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Show current players */}
      {gameState.players.length > 0 && (
        <div style={{ margin: "20px 0" }}>
          <h3>👥 Players in Lobby:</h3>
          <div className="player-list">
            {gameState.players.map((player) => (
              <div key={player.id} className="player-item">
                <span>👤 {player.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
          disabled={playerCount >= maxPlayers}
        />
        <br />
        <button
          type="submit"
          className="button"
          disabled={!playerName.trim() || playerCount >= maxPlayers}
        >
          {playerCount >= maxPlayers ? "Game Full!" : "Join Game"}
        </button>
      </form>

      {playerCount >= 2 && (
        <div style={{ marginTop: "20px" }}>
          <button
            className="button"
            onClick={onStartGame}
            style={{
              background: "linear-gradient(45deg, #4ecdc4, #44a08d)",
              fontSize: "20px",
              padding: "15px 40px",
            }}
          >
            🚀 Start Game!
          </button>
          <p style={{ marginTop: "10px", fontSize: "14px", opacity: 0.8 }}>
            {playerCount} players ready to play
          </p>
        </div>
      )}

      {playerCount < 2 && playerCount > 0 && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "14px", opacity: 0.8 }}>
            Need at least 2 players to start. Currently have {playerCount}{" "}
            player{playerCount !== 1 ? "s" : ""}.
          </p>
        </div>
      )}

      {/* Debug button for testing */}
      {onClearStoredPlayer && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            borderTop: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <button
            onClick={onClearStoredPlayer}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "8px 16px",
              borderRadius: "5px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            🗑️ Clear Stored Player Data (Debug)
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
