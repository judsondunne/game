import React, { useState, useEffect } from "react";
import { Player } from "../types";
import socketService from "../services/socketService";

interface VotingPhaseProps {
  contestants: Player[];
  judges: Player[];
  judgeVotes: { [judgeId: string]: string | null };
  onVote: (judgeId: string, contestantId: string | null) => void;
  onNext: () => void;
  currentPlayer: Player;
  fakeDefinitions: { [contestantId: string]: string };
  realContestantId?: string | null;
  currentWord?: { word: string; definition: string } | null;
  contestantsReady: string[];
}

const VotingPhase: React.FC<VotingPhaseProps> = ({
  contestants,
  judges,
  judgeVotes,
  onVote,
  onNext,
  currentPlayer,
  fakeDefinitions,
  realContestantId,
  currentWord,
  contestantsReady,
}) => {
  const [showVoting, setShowVoting] = useState(false);
  const [allVotesSubmitted, setAllVotesSubmitted] = useState(false);

  const handleContestantReady = () => {
    socketService.contestantReady(currentPlayer.id);
  };

  // Show voting when all contestants are ready
  useEffect(() => {
    if (
      contestantsReady.length === contestants.length &&
      contestants.length > 0
    ) {
      setShowVoting(true);
    }
  }, [contestantsReady, contestants.length]);

  useEffect(() => {
    // Check if all judges have voted (for display purposes)
    const allVoted = judges.every((judge) => judgeVotes[judge.id] !== null);
    if (allVoted) {
      setAllVotesSubmitted(true);
    }
  }, [judgeVotes, judges]);

  const getAnyVote = () => {
    const votes = Object.values(judgeVotes).filter((vote) => vote !== null);
    return votes.length > 0 ? votes[0] : null;
  };

  const anyVote = getAnyVote();
  const isJudge = judges.some((j) => j.id === currentPlayer.id);
  const isContestant = contestants.some((c) => c.id === currentPlayer.id);
  const currentPlayerVote = judgeVotes[currentPlayer.id];

  if (!showVoting) {
    return (
      <div className="card">
        <h1>Voting Phase</h1>
        <div style={{ margin: "40px 0" }}>
          <h2>Contestants, read your definitions aloud!</h2>
          <div style={{ fontSize: "48px", margin: "20px 0" }}>📢</div>

          {isContestant && (
            <div
              style={{
                padding: "15px",
                margin: "20px 0",
                borderRadius: "10px",
                backgroundColor: "#ff6b6b20",
                border: "2px solid #ff6b6b",
              }}
            >
              <p style={{ color: "#ff6b6b", fontWeight: "bold" }}>
                You're a contestant! Present your definition convincingly!
              </p>

              {/* Show the contestant their definition to read */}
              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "5px",
                }}
              >
                <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
                  Your definition to read:
                </p>
                <p style={{ fontStyle: "italic", fontSize: "16px" }}>
                  "
                  {realContestantId === currentPlayer.id
                    ? currentWord?.definition
                    : fakeDefinitions[currentPlayer.id] ||
                      "Write your fake definition"}
                  "
                </p>
              </div>

              {/* Done reading button for contestants */}
              <button
                className="button"
                onClick={handleContestantReady}
                disabled={contestantsReady.includes(currentPlayer.id)}
                style={{ marginTop: "15px" }}
              >
                {contestantsReady.includes(currentPlayer.id)
                  ? "✅ Done Reading!"
                  : "All Contestants Done Reading"}
              </button>
            </div>
          )}

          {isJudge && (
            <div
              style={{
                padding: "15px",
                margin: "20px 0",
                borderRadius: "10px",
                backgroundColor: "#4ecdc420",
                border: "2px solid #4ecdc4",
              }}
            >
              <p style={{ color: "#4ecdc4", fontWeight: "bold" }}>
                ⚖️ You're a judge! Listen carefully to vote for the real
                definition!
              </p>
            </div>
          )}
        </div>
        <div style={{ marginTop: "20px" }}>
          <p>
            Waiting for all contestants to finish reading... (
            {contestantsReady.length}/{contestants.length})
          </p>
          {contestantsReady.length === contestants.length &&
            contestants.length > 0 && (
              <p style={{ color: "#4ecdc4", fontWeight: "bold" }}>
                All contestants done reading! Moving to voting...
              </p>
            )}
        </div>
      </div>
    );
  }

  // Judge view - can vote
  if (isJudge) {
    return (
      <div className="card">
        <h1>⚖️ Your Vote</h1>

        <div style={{ margin: "20px 0" }}>
          <h3>Vote for who you think has the REAL definition</h3>
          <p style={{ fontSize: "14px", opacity: 0.8 }}>
            Listen to each contestant read their definition, discuss with other
            judges, then any judge can submit the final vote
          </p>
        </div>

        {/* Show contestant names for judges */}
        <div style={{ margin: "20px 0" }}>
          <h4>Contestants:</h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {contestants.map((contestant) => (
              <div
                key={contestant.id}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              >
                <div style={{ fontWeight: "bold" }}>
                  🎭 {contestant.name}
                  {realContestantId === null && (
                    <span
                      style={{
                        fontSize: "12px",
                        opacity: 0.7,
                        marginLeft: "10px",
                      }}
                    >
                      (All fake - testing mode)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="vote-buttons">
          {contestants.map((contestant) => (
            <button
              key={contestant.id}
              className={`vote-button ${currentPlayerVote === contestant.id ? "selected" : ""}`}
              onClick={() => onVote(currentPlayer.id, contestant.id)}
            >
              <strong>{contestant.name}</strong>
              <br />
              <small>Click to vote for this contestant</small>
            </button>
          ))}
        </div>

        {currentPlayerVote && (
          <div
            style={{
              margin: "20px 0",
              padding: "15px",
              borderRadius: "10px",
              backgroundColor: "#4ecdc420",
              border: "2px solid #4ecdc4",
            }}
          >
            <p style={{ color: "#4ecdc4", fontWeight: "bold" }}>
              ✅ You voted for:{" "}
              {contestants.find((c) => c.id === currentPlayerVote)?.name}
            </p>
            <button
              className="button"
              onClick={() => onVote(currentPlayer.id, null)}
              style={{
                marginTop: "10px",
                fontSize: "14px",
                padding: "8px 16px",
              }}
            >
              Change Vote
            </button>
          </div>
        )}

        {judges.length > 1 && (
          <div style={{ margin: "20px 0" }}>
            <h4>Other Judges:</h4>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              {judges
                .filter((j) => j.id !== currentPlayer.id)
                .map((judge) => (
                  <div
                    key={judge.id}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      backgroundColor: judgeVotes[judge.id]
                        ? "#4ecdc420"
                        : "rgba(255,255,255,0.1)",
                      border: `2px solid ${judgeVotes[judge.id] ? "#4ecdc4" : "rgba(255,255,255,0.3)"}`,
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{judge.name}</div>
                    <div style={{ fontSize: "14px", opacity: 0.8 }}>
                      {judgeVotes[judge.id]
                        ? `Voted for: ${contestants.find((c) => c.id === judgeVotes[judge.id])?.name}`
                        : "Discussing..."}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {anyVote && (
          <div style={{ marginTop: "20px" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#4ecdc4",
                marginBottom: "10px",
              }}
            >
              ✅ Vote submitted!
            </div>
            <p>
              Voted for:{" "}
              <strong>{contestants.find((c) => c.id === anyVote)?.name}</strong>
            </p>
            <button className="button" onClick={onNext}>
              Continue to Results 🎉
            </button>
          </div>
        )}
      </div>
    );
  }

  // Non-judge view (contestants and spectators)
  return (
    <div className="card">
      <h1>⚖️ Judges Are Voting</h1>

      <div style={{ margin: "20px 0" }}>
        <h3>All definitions have been revealed!</h3>
        {isContestant && (
          <p style={{ color: "#ff6b6b", fontWeight: "bold" }}>
            🎭 Hope they believed your definition!
          </p>
        )}
      </div>

      {/* Show all definitions for everyone */}
      <div style={{ margin: "20px 0" }}>
        <h4>All Definitions:</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {contestants.map((contestant) => {
            const isReal = realContestantId === contestant.id;
            const definition = isReal
              ? currentWord?.definition
              : fakeDefinitions[contestant.id];

            return (
              <div
                key={contestant.id}
                style={{
                  padding: "15px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
                  {contestant.name}'s definition:
                </div>
                <div style={{ fontStyle: "italic", fontSize: "16px" }}>
                  "{definition || "No definition submitted"}"
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        <h4>Contestants:</h4>
        <div className="player-list">
          {contestants.map((contestant) => (
            <div
              key={contestant.id}
              className="player-item"
              style={{
                border:
                  contestant.id === currentPlayer.id
                    ? "2px solid #ff6b6b"
                    : undefined,
                backgroundColor:
                  contestant.id === currentPlayer.id
                    ? "rgba(255, 107, 107, 0.2)"
                    : undefined,
              }}
            >
              <span>
                🎭 {contestant.name}
                {contestant.id === currentPlayer.id && " (You)"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        <h4>Judge Votes:</h4>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          {judges.map((judge) => (
            <div
              key={judge.id}
              style={{
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: judgeVotes[judge.id]
                  ? "#4ecdc420"
                  : "rgba(255,255,255,0.1)",
                border: `2px solid ${judgeVotes[judge.id] ? "#4ecdc4" : "rgba(255,255,255,0.3)"}`,
              }}
            >
              <div style={{ fontWeight: "bold" }}>{judge.name}</div>
              <div style={{ fontSize: "14px", opacity: 0.8 }}>
                {judgeVotes[judge.id]
                  ? `Voted for: ${contestants.find((c) => c.id === judgeVotes[judge.id])?.name}`
                  : "Deciding..."}
              </div>
            </div>
          ))}
        </div>
      </div>

      {anyVote && (
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#4ecdc4",
              marginBottom: "10px",
            }}
          >
            ✅ Judges have decided!
          </div>
          <p>
            They voted for:{" "}
            <strong>{contestants.find((c) => c.id === anyVote)?.name}</strong>
          </p>
          <p style={{ fontSize: "14px", opacity: 0.8, marginTop: "10px" }}>
            Waiting for a judge to advance to results...
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingPhase;
