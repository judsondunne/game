import React, { useState, useEffect } from "react";
import { WordDefinition, Player } from "../types";

interface WordDisplayProps {
  word: WordDefinition;
  onNext: () => void;
  currentPlayer: Player;
}

const WordDisplay: React.FC<WordDisplayProps> = ({
  word,
  onNext,
  currentPlayer,
}) => {
  const [showDefinition, setShowDefinition] = useState(false);
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDefinition(true);
      // Remove auto-advance - let players click the button when ready
    }, 3000); // Show word for 3 seconds first

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showDefinition) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showDefinition]);

  return (
    <div className="card">
      <h1>📖 Word Display</h1>

      <div style={{ margin: "40px 0" }}>
        <div className="word-display">{word.word}</div>

        {showDefinition && (
          <div className="definition-display">
            <strong>Definition:</strong>
            <br />
            {word.definition}
          </div>
        )}
      </div>

      {!showDefinition && (
        <div style={{ fontSize: "24px", margin: "20px 0" }}>
          <p>Memorize this word!</p>
          <div style={{ fontSize: "48px", margin: "10px 0" }}>📝</div>
        </div>
      )}

      {showDefinition && (
        <div style={{ fontSize: "24px", margin: "20px 0" }}>
          <p>Remember this definition!</p>
          <div className="timer">{countdown}</div>
          <button
            className="button"
            onClick={onNext}
            style={{ marginTop: "20px" }}
          >
            Ready! Continue to Contestant Phase 🎭
          </button>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <p>Everyone sees the word and definition briefly...</p>
        {currentPlayer.role === "contestant" && (
          <p style={{ color: "#ff6b6b", fontWeight: "bold" }}>
            🎭 As a contestant, you'll need to create a fake definition!
          </p>
        )}
        {currentPlayer.role === "judge" && (
          <p style={{ color: "#4ecdc4", fontWeight: "bold" }}>
            ⚖️ As a judge, you'll vote for the real definition!
          </p>
        )}
      </div>
    </div>
  );
};

export default WordDisplay;
