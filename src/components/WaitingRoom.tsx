import React from "react";
import { Player } from "../types";

interface WaitingRoomProps {
  players: Player[];
  onStartGame: () => void;
  currentPlayer: Player;
  maxPlayers?: number;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  players,
  onStartGame,
  currentPlayer,
  maxPlayers = 20,
}) => {
  return (
    <div className="card">
      <h1>🏝️ Monhegan Harbor</h1>
      <h2>
        Players: {players.length} / {maxPlayers}
      </h2>

      <div style={{ margin: "20px 0" }}>
        <h3>🎭 Players in Game:</h3>
        <div className="player-list">
          {players.map((player) => (
            <div
              key={player.id}
              className="player-item"
              style={{
                border:
                  player.id === currentPlayer.id
                    ? "2px solid #4ecdc4"
                    : undefined,
                background:
                  player.id === currentPlayer.id
                    ? "rgba(78, 205, 196, 0.2)"
                    : undefined,
              }}
            >
              <span>
                {player.id === currentPlayer.id && "👑 "}
                👤 {player.name}
                {player.id === currentPlayer.id && " (You)"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {players.length >= 2 && (
        <div style={{ marginTop: "30px" }}>
          <h3>🎉 Ready to Play!</h3>
          <p>You can start the game now with {players.length} players</p>
          <button
            className="button"
            onClick={onStartGame}
            style={{
              background: "linear-gradient(45deg, #4ecdc4, #44a08d)",
              fontSize: "20px",
              padding: "15px 40px",
            }}
          >
            Start Game! 🚀
          </button>
        </div>
      )}

      {players.length < 2 && (
        <div style={{ marginTop: "30px" }}>
          <p>
            Need at least 2 players to start. Currently have {players.length}{" "}
            player{players.length !== 1 ? "s" : ""}.
          </p>
          <div style={{ fontSize: "24px", marginTop: "10px" }}>
            {["⏳", "⏰", "⏱️", "⏲️"][Math.floor(Date.now() / 1000) % 4]}
          </div>
          <p style={{ fontSize: "14px", opacity: 0.7, marginTop: "20px" }}>
            Share this page with other players on your network!
          </p>
        </div>
      )}
    </div>
  );
};

export default WaitingRoom;
