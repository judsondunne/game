import React, { useState, useEffect } from "react";
import { GameState, Player, GamePhase } from "./types";
import socketService from "./services/socketService";
import LoginScreen from "./components/LoginScreen";
import WaitingRoom from "./components/WaitingRoom";
import RoleAssignment from "./components/RoleAssignment";
import ContestantPhase from "./components/ContestantPhase";
import VotingPhase from "./components/VotingPhase";
import Results from "./components/Results";
import NextRound from "./components/NextRound";

function App() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentRound: 1,
    currentWord: null,
    gamePhase: "login",
    contestants: [],
    judges: [],
    spectators: [],
    timer: 30,
    judgeVotes: {},
    fakeDefinitions: {},
    contestantsReady: [],
    roundResults: [],
    realContestantId: null,
  });

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored player data
    const storedPlayer = socketService.getStoredPlayer();
    if (storedPlayer) {
      setCurrentPlayer(storedPlayer);
      socketService.setCurrentPlayer(storedPlayer);
    }

    // Connect to the server
    const connectToServer = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
        setConnectionError(null);

        // Listen for game state updates
        socketService.onGameStateUpdate((newGameState: GameState) => {
          setGameState(newGameState);
        });

        // Listen for personal game state updates
        socketService.onPersonalGameState(
          (data: { gameState: GameState; currentPlayer: Player }) => {
            setGameState(data.gameState);
            setCurrentPlayer(data.currentPlayer);
            socketService.setCurrentPlayer(data.currentPlayer);
            socketService.storePlayer(data.currentPlayer);
          }
        );

        // If we have a stored player, try to reconnect them
        if (storedPlayer) {
          socketService.joinGame(storedPlayer.name);
        }
      } catch (error) {
        console.error("Failed to connect to server:", error);
        setConnectionError(
          "Failed to connect to game server. Please try again."
        );
        setIsConnected(false);
      }
    };

    connectToServer();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleJoinGame = (playerName: string) => {
    if (isConnected) {
      socketService.joinGame(playerName);
    }
  };

  const handleClearStoredPlayer = () => {
    socketService.clearStoredPlayer();
    setCurrentPlayer(null);
    window.location.reload();
  };

  const handleStartGame = () => {
    if (isConnected) {
      socketService.startGame();
    }
  };

  const handleNextPhase = () => {
    if (isConnected) {
      socketService.nextPhase();
    }
  };

  const handleJudgeVote = (judgeId: string, contestantId: string | null) => {
    if (isConnected) {
      socketService.judgeVote(judgeId, contestantId);
    }
  };

  const handleNextRound = () => {
    if (isConnected) {
      socketService.nextRound();
    }
  };

  // Show connection error if not connected
  if (!isConnected) {
    return (
      <div className="game-container">
        <div className="card">
          <h1>🏝️ Monhegan Fictionary</h1>
          {connectionError ? (
            <div>
              <p style={{ color: "#ff6b6b" }}>❌ {connectionError}</p>
              <button
                className="button"
                onClick={() => window.location.reload()}
                style={{ marginTop: "20px" }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div>
              <p>🔌 Connecting to game server...</p>
              <div style={{ fontSize: "24px", marginTop: "10px" }}>
                {["⏳", "⏰", "⏱️", "⏲️"][Math.floor(Date.now() / 1000) % 4]}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show login screen if player hasn't joined yet
  if (!currentPlayer) {
    return (
      <div className="game-container">
        <LoginScreen
          onAddPlayer={handleJoinGame}
          onStartGame={handleStartGame}
          onClearStoredPlayer={handleClearStoredPlayer}
          playerCount={gameState.players.length}
          maxPlayers={20}
          gameState={gameState}
        />
      </div>
    );
  }

  // Show different screens based on game phase
  const renderCurrentPhase = () => {
    switch (gameState.gamePhase) {
      case "login":
        return (
          <WaitingRoom
            players={gameState.players}
            onStartGame={handleStartGame}
            currentPlayer={currentPlayer}
          />
        );

      case "roleAssignment":
        return (
          <RoleAssignment
            players={gameState.players}
            onNext={handleNextPhase}
            currentPlayer={currentPlayer}
          />
        );

      case "contestantPhase":
        return (
          <ContestantPhase
            contestants={gameState.contestants}
            word={gameState.currentWord!}
            timer={gameState.timer}
            onNext={handleNextPhase}
            currentPlayer={currentPlayer}
            realContestantId={gameState.realContestantId}
            fakeDefinitions={gameState.fakeDefinitions}
          />
        );

      case "votingPhase":
        return (
          <VotingPhase
            contestants={gameState.contestants}
            judges={gameState.judges}
            judgeVotes={gameState.judgeVotes}
            onVote={handleJudgeVote}
            onNext={handleNextPhase}
            currentPlayer={currentPlayer}
            fakeDefinitions={gameState.fakeDefinitions}
            realContestantId={gameState.realContestantId}
            currentWord={gameState.currentWord}
            contestantsReady={gameState.contestantsReady}
          />
        );

      case "results":
        return (
          <Results
            gameState={gameState}
            onNext={handleNextPhase}
            currentPlayer={currentPlayer}
          />
        );

      case "nextRound":
        return (
          <NextRound
            currentRound={gameState.currentRound}
            onNextRound={handleNextRound}
            currentPlayer={currentPlayer}
          />
        );

      default:
        return <div>Unknown phase</div>;
    }
  };

  return <div className="game-container">{renderCurrentPhase()}</div>;
}

export default App;
