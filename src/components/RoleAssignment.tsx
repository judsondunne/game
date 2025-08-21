import React from "react";
import { Player } from "../types";

interface RoleAssignmentProps {
  players: Player[];
  onNext: () => void;
  currentPlayer: Player;
}

const RoleAssignment: React.FC<RoleAssignmentProps> = ({
  players,
  onNext,
  currentPlayer,
}) => {
  const getRoleEmoji = (role: string) => {
    switch (role) {
      case "contestant":
        return "🎭";
      case "judge":
        return "⚖️";
      case "spectator":
        return "👁️";
      default:
        return "❓";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "contestant":
        return "#ff6b6b";
      case "judge":
        return "#4ecdc4";
      case "spectator":
        return "#95a5a6";
      default:
        return "#fff";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "contestant":
        return "Your job is to create a convincing fake definition for the word. Make it sound realistic!";
      case "judge":
        return "You'll vote for which contestant you think gave the real definition.";
      case "spectator":
        return "You get to watch the action unfold and see who wins each round!";
      default:
        return "";
    }
  };

  return (
    <div className="card">
      <h1>🏝️ Your Monhegan Role</h1>

      <div
        style={{
          margin: "40px 0",
          padding: "30px",
          border: `3px solid ${getRoleColor(currentPlayer.role)}`,
          borderRadius: "15px",
          background: `${getRoleColor(currentPlayer.role)}20`,
        }}
      >
        <h2>👤 {currentPlayer.name}</h2>

        <div
          style={{
            fontSize: "72px",
            margin: "20px 0",
            color: getRoleColor(currentPlayer.role),
          }}
        >
          {getRoleEmoji(currentPlayer.role)}
        </div>

        <div
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: getRoleColor(currentPlayer.role),
            marginBottom: "20px",
          }}
        >
          {currentPlayer.role.toUpperCase()}
        </div>

        <p
          style={{
            fontSize: "16px",
            lineHeight: "1.5",
            opacity: 0.9,
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          {getRoleDescription(currentPlayer.role)}
        </p>
      </div>

      <button className="button" onClick={onNext} style={{ marginTop: "30px" }}>
        Ready! Continue to Game
      </button>
    </div>
  );
};

export default RoleAssignment;
