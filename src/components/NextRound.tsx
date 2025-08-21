import React from "react";
import { Player } from "../types";

interface NextRoundProps {
  currentRound: number;
  onNextRound: () => void;
  currentPlayer: Player;
}

const NextRound: React.FC<NextRoundProps> = ({
  currentRound,
  onNextRound,
  currentPlayer,
}) => {
  return (
    <div className="card">
      <h1>🔄 Round {currentRound} Complete!</h1>

      <div style={{ margin: "40px 0" }}>
        <div style={{ fontSize: "48px", margin: "20px 0" }}>🎉</div>
        <h2>Great job everyone!</h2>
        <p>Round {currentRound} has finished successfully.</p>
      </div>

      <div style={{ margin: "30px 0" }}>
        <h3>🔄 Next Round Setup:</h3>
        <div style={{ textAlign: "left", margin: "20px 0" }}>
          <p>• New roles will be randomly assigned</p>
          <p>• Different players will be contestants and judges</p>
          <p>• A new word will be selected</p>
          <p>• Everyone gets a chance to participate!</p>
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        <h3>📊 Round Rotation:</h3>
        <div
          style={{
            padding: "15px",
            borderRadius: "10px",
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.3)",
            fontSize: "14px",
            textAlign: "left",
          }}
        >
          <p>
            <strong>Round 1:</strong> 3 contestants, 3 judges, 5 spectators
          </p>
          <p>
            <strong>Round 2:</strong> 3 contestants, 3 judges, 5 spectators
            (different players)
          </p>
          <p>
            <strong>Round 3:</strong> 3 contestants, 3 judges, 5 spectators
            (remaining players)
          </p>
          <p>
            <strong>Round 4+:</strong> Continues rotation with crossover players
          </p>
        </div>
      </div>

      <button className="button" onClick={onNextRound}>
        Start Round {currentRound + 1}! 🚀
      </button>

      <div style={{ marginTop: "20px", fontSize: "14px", opacity: 0.8 }}>
        <p>
          💡 Tip: Each round, different players get to be contestants and
          judges!
        </p>
      </div>
    </div>
  );
};

export default NextRound;
