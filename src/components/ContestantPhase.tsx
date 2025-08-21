import React, { useState, useEffect } from "react";
import { Player, WordDefinition } from "../types";
import socketService from "../services/socketService";

interface ContestantPhaseProps {
  contestants: Player[];
  word: WordDefinition;
  timer: number;
  onNext: () => void;
  currentPlayer: Player;
  realContestantId?: string | null;
  fakeDefinitions: { [contestantId: string]: string };
}

const ContestantPhase: React.FC<ContestantPhaseProps> = ({
  contestants,
  word,
  timer,
  onNext,
  currentPlayer,
  realContestantId,
}) => {
  const [timeLeft, setTimeLeft] = useState(timer);
  const [fakeDefinition, setFakeDefinition] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phaseStarted, setPhaseStarted] = useState(false);

  // Start the phase after a brief delay to let everyone load
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setPhaseStarted(true);
    }, 2000); // 2 second delay to let everyone see the word

    return () => clearTimeout(startTimer);
  }, []);

  // Timer logic - remove auto-advance
  useEffect(() => {
    if (!phaseStarted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phaseStarted]);

  const handleSubmit = () => {
    if (fakeDefinition.trim()) {
      setIsSubmitted(true);
      // Send the fake definition to the server
      socketService.submitFakeDefinition(
        currentPlayer.id,
        fakeDefinition.trim()
      );
    }
  };

  const isContestant = contestants.some((c) => c.id === currentPlayer.id);

  // Use the server's real contestant ID if available
  // If realContestantId is null, it means testing mode (all fake) or no real contestant
  const isRealContestant = realContestantId
    ? realContestantId === currentPlayer.id
    : false;

  // Contestant view - they need to write definitions
  if (isContestant) {
    return (
      <div className="card">
        <h1>Contestant Phase</h1>

        {!phaseStarted ? (
          <div style={{ margin: "40px 0" }}>
            <h2>Get Ready!</h2>
            <p>Phase starting in 2 seconds...</p>
            <div style={{ fontSize: "48px", margin: "20px 0" }}>⏳</div>
          </div>
        ) : (
          <>
            <div className="timer" style={{ margin: "20px 0" }}>
              {timeLeft}
            </div>

            <div style={{ margin: "20px 0" }}>
              <h2>
                Word: <span style={{ color: "#4ecdc4" }}>{word.word}</span>
              </h2>
            </div>

            {isRealContestant ? (
              // Real contestant - shows the real definition
              <div
                style={{
                  padding: "20px",
                  borderRadius: "10px",
                  backgroundColor: "#4ecdc420",
                  border: "2px solid #4ecdc4",
                  margin: "20px 0",
                }}
              >
                <h3 style={{ color: "#4ecdc4" }}>You know the REAL meaning!</h3>
                <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                  "{word.definition}"
                </p>
                <p
                  style={{ fontSize: "14px", opacity: 0.8, marginTop: "10px" }}
                >
                  Your job: Present this definition convincingly when it's your
                  turn!
                </p>
              </div>
            ) : (
              // Fake contestant - needs to write a fake definition
              <div
                style={{
                  padding: "20px",
                  borderRadius: "10px",
                  backgroundColor: "#ff6b6b20",
                  border: "2px solid #ff6b6b",
                  margin: "20px 0",
                }}
              >
                <h3 style={{ color: "#ff6b6b" }}>Spin a convincing tale!</h3>
                <p
                  style={{
                    fontSize: "14px",
                    opacity: 0.8,
                    marginBottom: "15px",
                  }}
                >
                  Make it sound realistic and believable:
                </p>

                {!isSubmitted ? (
                  <div>
                    <textarea
                      value={fakeDefinition}
                      onChange={(e) => setFakeDefinition(e.target.value)}
                      placeholder="Write your fake definition here..."
                      style={{
                        width: "100%",
                        minHeight: "100px",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        fontSize: "16px",
                        resize: "vertical",
                      }}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!fakeDefinition.trim()}
                      className="button"
                      style={{ marginTop: "10px" }}
                    >
                      Submit Definition
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "15px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "5px",
                    }}
                  >
                    <p style={{ fontWeight: "bold" }}>✅ Your definition:</p>
                    <p style={{ fontStyle: "italic" }}>"{fakeDefinition}"</p>
                    <p
                      style={{
                        fontSize: "12px",
                        opacity: 0.8,
                        marginTop: "10px",
                      }}
                    >
                      Practice reading this aloud convincingly!
                    </p>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: "20px" }}>
              <p>Time to prepare your definition!</p>
            </div>

            {timeLeft === 0 && (
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#ff6b6b",
                  marginTop: "20px",
                }}
              >
                Time's up!
              </div>
            )}

            <button
              className="button"
              onClick={onNext}
              style={{ marginTop: "20px" }}
              disabled={timeLeft > 0}
            >
              {timeLeft > 0
                ? `Wait ${timeLeft} more seconds...`
                : "Continue to Voting Phase"}
            </button>
          </>
        )}
      </div>
    );
  }

  // Non-contestant view (judges and spectators)
  return (
    <div className="card">
      <h1>Contestant Phase</h1>

      {!phaseStarted ? (
        <div style={{ margin: "40px 0" }}>
          <h2>Get Ready!</h2>
          <p>Contestants are preparing...</p>
          <div style={{ fontSize: "48px", margin: "20px 0" }}>⏳</div>
        </div>
      ) : (
        <>
          <div className="timer" style={{ margin: "20px 0" }}>
            {timeLeft}
          </div>

          <div style={{ margin: "20px 0" }}>
            <h2>
              Word: <span style={{ color: "#4ecdc4" }}>{word.word}</span>
            </h2>
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "10px",
              backgroundColor: "rgba(255,255,255,0.1)",
              margin: "20px 0",
            }}
          >
            <h3>👥 Contestants are preparing...</h3>
            <div style={{ margin: "15px 0" }}>
              {contestants.map((contestant, index) => (
                <div
                  key={contestant.id}
                  style={{
                    padding: "10px",
                    margin: "5px 0",
                    borderRadius: "5px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{contestant.name}</span>
                  <span style={{ fontSize: "12px", opacity: 0.7 }}>
                    Working on definition...
                  </span>
                </div>
              ))}
            </div>
          </div>

          {currentPlayer.role === "judge" && (
            <div
              style={{
                padding: "15px",
                borderRadius: "10px",
                backgroundColor: "#4ecdc420",
                border: "2px solid #4ecdc4",
              }}
            >
              <p style={{ color: "#4ecdc4", fontWeight: "bold" }}>
                As a judge, you'll vote for which definition sounds real!
              </p>
            </div>
          )}

          {currentPlayer.role === "spectator" && (
            <div
              style={{
                padding: "15px",
                borderRadius: "10px",
                backgroundColor: "#95a5a620",
                border: "2px solid #95a5a6",
              }}
            >
              <p style={{ color: "#95a5a6", fontWeight: "bold" }}>
                As a spectator, you get to watch the drama unfold!
              </p>
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <p>Contestants have {timeLeft} seconds to prepare!</p>
          </div>

          {timeLeft === 0 && (
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ff6b6b",
                marginTop: "20px",
              }}
            >
              Time's up! Moving to voting...
            </div>
          )}

          <button
            className="button"
            onClick={onNext}
            style={{ marginTop: "20px" }}
            disabled={timeLeft > 0}
          >
            {timeLeft > 0
              ? `Wait ${timeLeft} more seconds...`
              : "Continue to Voting Phase"}
          </button>
        </>
      )}
    </div>
  );
};

export default ContestantPhase;
