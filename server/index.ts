import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import {
  Player,
  GameState,
  GamePhase,
  PlayerRole,
  WordDefinition,
} from "../src/types";
import { wordDefinitions } from "../src/wordData";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Game state on the server
let gameState: GameState = {
  players: [],
  currentRound: 1,
  currentWord: null,
  gamePhase: "login",
  contestants: [],
  judges: [],
  spectators: [],
  timer: 30,
  judgeVotes: {},
  roundResults: [],
};

// Store socket connections
const playerSockets = new Map<string, string>(); // playerId -> socketId
const socketPlayers = new Map<string, string>(); // socketId -> playerId

// Helper function to assign roles
function assignRoles() {
  const shuffledPlayers = [...gameState.players].sort(
    () => Math.random() - 0.5
  );
  const playerCount = shuffledPlayers.length;

  let contestants: Player[], judges: Player[], spectators: Player[];

  if (playerCount <= 3) {
    contestants = shuffledPlayers.slice(0, 1);
    judges = shuffledPlayers.slice(1, 2);
    spectators = shuffledPlayers.slice(2);
  } else if (playerCount <= 6) {
    contestants = shuffledPlayers.slice(0, 2);
    judges = shuffledPlayers.slice(2, 4);
    spectators = shuffledPlayers.slice(4);
  } else {
    contestants = shuffledPlayers.slice(0, 3);
    judges = shuffledPlayers.slice(3, 6);
    spectators = shuffledPlayers.slice(6);
  }

  // Update player roles
  gameState.players = gameState.players.map((player) => {
    if (contestants.find((c) => c.id === player.id)) {
      return { ...player, role: "contestant" as PlayerRole };
    } else if (judges.find((j) => j.id === player.id)) {
      return { ...player, role: "judge" as PlayerRole };
    } else {
      return { ...player, role: "spectator" as PlayerRole };
    }
  });

  gameState.contestants = contestants;
  gameState.judges = judges;
  gameState.spectators = spectators;
  gameState.currentWord =
    wordDefinitions[Math.floor(Math.random() * wordDefinitions.length)];
}

// Helper function to broadcast game state to all clients
function broadcastGameState() {
  io.emit("gameStateUpdate", gameState);
}

// Helper function to send personalized game state to a specific player
function sendPersonalizedGameState(socketId: string, playerId: string) {
  const player = gameState.players.find((p) => p.id === playerId);
  if (player) {
    io.to(socketId).emit("personalGameState", {
      gameState,
      currentPlayer: player,
    });
  }
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle player joining
  socket.on("joinGame", (playerName: string) => {
    const existingPlayer = gameState.players.find((p) => p.name === playerName);

    if (existingPlayer) {
      // Player reconnecting
      playerSockets.set(existingPlayer.id, socket.id);
      socketPlayers.set(socket.id, existingPlayer.id);
      sendPersonalizedGameState(socket.id, existingPlayer.id);
    } else {
      // New player joining
      const newPlayer: Player = {
        id: Date.now().toString() + Math.random().toString(),
        name: playerName,
        role: "spectator",
        points: 0,
      };

      gameState.players.push(newPlayer);
      playerSockets.set(newPlayer.id, socket.id);
      socketPlayers.set(socket.id, newPlayer.id);

      console.log(
        `Player ${playerName} joined. Total players: ${gameState.players.length}`
      );

      broadcastGameState();
      sendPersonalizedGameState(socket.id, newPlayer.id);
    }
  });

  // Handle game start
  socket.on("startGame", () => {
    if (gameState.players.length >= 3 && gameState.gamePhase === "login") {
      assignRoles();
      gameState.gamePhase = "roleAssignment";
      console.log("Game started with", gameState.players.length, "players");
      broadcastGameState();
    }
  });

  // Handle next phase
  socket.on("nextPhase", () => {
    const phases: GamePhase[] = [
      "login",
      "waiting",
      "roleAssignment",
      "wordDisplay",
      "contestantPhase",
      "votingPhase",
      "results",
      "nextRound",
    ];
    const currentIndex = phases.indexOf(gameState.gamePhase);
    const nextPhase = phases[(currentIndex + 1) % phases.length];

    gameState.gamePhase = nextPhase;
    broadcastGameState();
  });

  // Handle judge voting
  socket.on(
    "judgeVote",
    (data: { judgeId: string; contestantId: string | null }) => {
      gameState.judgeVotes[data.judgeId] = data.contestantId;
      broadcastGameState();
    }
  );

  // Handle next round
  socket.on("nextRound", () => {
    assignRoles();
    gameState.currentRound += 1;
    gameState.gamePhase = "roleAssignment";
    gameState.judgeVotes = {};
    broadcastGameState();
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const playerId = socketPlayers.get(socket.id);
    if (playerId) {
      console.log(`Player ${playerId} disconnected`);
      playerSockets.delete(playerId);
      socketPlayers.delete(socket.id);

      // Note: We don't remove the player from the game state so they can reconnect
      // You might want to add a timeout to remove inactive players
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Game server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});
