const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: isProduction
      ? true
      : ["http://localhost:3000", "http://192.168.1.32:3000"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Serve static files from the React build folder in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("build"));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build/index.html"));
  });
}

// Word definitions - copy from the frontend
const wordDefinitions = [
  {
    word: "Wamble",
    definition:
      "A feeling of nausea or uneasiness in the stomach; to feel sick.",
  },
  {
    word: "Collywobbles",
    definition: "Stomach pain or queasiness; nervousness or anxiety.",
  },
  {
    word: "Borborygmus",
    definition:
      "A rumbling or gurgling sound caused by the movement of fluid and gas in the intestines.",
  },
  {
    word: "Snollygoster",
    definition: "A shrewd, unprincipled person, especially a politician.",
  },
  {
    word: "Lollygag",
    definition: "To spend time aimlessly; to dawdle or loiter.",
  },
  {
    word: "Kerfuffle",
    definition:
      "A commotion or fuss, especially one caused by conflicting views.",
  },
  {
    word: "Bumfuzzle",
    definition: "To confuse, perplex, or fluster someone completely.",
  },
  {
    word: "Skedaddle",
    definition: "To depart quickly or hurriedly; to run away.",
  },
  {
    word: "Cattywampus",
    definition: "Askew, awry, or positioned diagonally; not straight.",
  },
  {
    word: "Flibbertigibbet",
    definition: "A frivolous, flighty, or excessively talkative person.",
  },
  {
    word: "Gobbledygook",
    definition: "Language that is meaningless or hard to understand; jargon.",
  },
  {
    word: "Hullabaloo",
    definition:
      "A commotion or fuss; a lot of noise or excitement about something.",
  },
  {
    word: "Nincompoop",
    definition: "A foolish or stupid person; someone lacking intelligence.",
  },
  {
    word: "Bamboozle",
    definition: "To fool or cheat someone; to confuse or deceive.",
  },
  {
    word: "Hornswoggle",
    definition: "To swindle or cheat someone out of something.",
  },
  {
    word: "Brouhaha",
    definition: "A noisy and overexcited reaction or response to something.",
  },
  {
    word: "Taradiddle",
    definition: "A small lie; a fib or pretentious nonsense.",
  },
  {
    word: "Shenanigans",
    definition: "Secret or dishonest activity or maneuvering; mischief.",
  },
  {
    word: "Codswallop",
    definition: "Nonsense; something that is not true or is foolish.",
  },
  {
    word: "Rigmarole",
    definition: "A lengthy and complicated procedure; a long, rambling story.",
  },
  {
    word: "Poppycock",
    definition: "Senseless talk or writing; nonsense or foolishness.",
  },
  {
    word: "Balderdash",
    definition: "Senseless talk or writing; nonsense or drivel.",
  },
  {
    word: "Tomfoolery",
    definition: "Foolish or silly behavior; nonsensical conduct.",
  },
  {
    word: "Gallivant",
    definition:
      "To go around from one place to another seeking pleasure or entertainment.",
  },
  {
    word: "Whippersnapper",
    definition:
      "A young person considered to be presumptuous or overconfident.",
  },
  {
    word: "Rapscallion",
    definition: "A mischievous person; a rascal or scoundrel.",
  },
  {
    word: "Scalawag",
    definition:
      "A person who behaves badly but in an amusingly mischievous way; a rascal.",
  },
  {
    word: "Hootenanny",
    definition: "An informal gathering with folk music and sometimes dancing.",
  },
  {
    word: "Humdinger",
    definition: "A remarkable or outstanding person or thing of its kind.",
  },
  {
    word: "Sockdolager",
    definition: "Something that settles a matter; a decisive blow or answer.",
  },
];

// Game state on the server
let gameState = {
  players: [],
  currentRound: 1,
  currentWord: null,
  gamePhase: "login",
  contestants: [],
  judges: [],
  spectators: [],
  timer: 30,
  judgeVotes: {},
  fakeDefinitions: {}, // Store fake definitions by contestant ID
  contestantsReady: [], // Track which contestants are ready
  roundResults: [],
  realContestantId: null, // Track which contestant has the real definition
};

// Phase transition protection
let lastPhaseTransition = 0;
const PHASE_COOLDOWN = 2000; // 2 seconds between phase transitions

// Store socket connections
const playerSockets = new Map(); // playerId -> socketId
const socketPlayers = new Map(); // socketId -> playerId

// ========================================
// TESTING CONFIGURATION
// ========================================
// Set to true to make ALL contestants have fake definitions (no real contestant)
// This is useful for testing the game flow when everyone needs to write definitions
const TESTING_ALL_FAKE = false;

// Helper function to assign roles
function assignRoles() {
  const shuffledPlayers = [...gameState.players].sort(
    () => Math.random() - 0.5
  );
  const playerCount = shuffledPlayers.length;

  console.log(`=== ROLE ASSIGNMENT START ===`);
  console.log(`Total players to assign: ${playerCount}`);
  console.log(`Player names: ${shuffledPlayers.map((p) => p.name).join(", ")}`);

  // ABSOLUTELY NO SPECTATORS - ONLY CONTESTANTS AND JUDGES
  let contestants = [];
  let judges = [];
  let spectators = []; // ALWAYS EMPTY - NO SPECTATORS EVER

  // Distribute ALL players between contestants and judges only
  if (playerCount === 2) {
    contestants = [shuffledPlayers[0]];
    judges = [shuffledPlayers[1]];
  } else if (playerCount === 3) {
    contestants = [shuffledPlayers[0], shuffledPlayers[1]];
    judges = [shuffledPlayers[2]];
  } else if (playerCount === 4) {
    contestants = [shuffledPlayers[0], shuffledPlayers[1]];
    judges = [shuffledPlayers[2], shuffledPlayers[3]];
  } else if (playerCount === 5) {
    contestants = [shuffledPlayers[0], shuffledPlayers[1], shuffledPlayers[2]];
    judges = [shuffledPlayers[3], shuffledPlayers[4]];
  } else if (playerCount === 6) {
    contestants = [shuffledPlayers[0], shuffledPlayers[1], shuffledPlayers[2]];
    judges = [shuffledPlayers[3], shuffledPlayers[4], shuffledPlayers[5]];
  } else {
    // For 7+ players, distribute evenly between contestants and judges
    contestants = [shuffledPlayers[0], shuffledPlayers[1], shuffledPlayers[2]];
    judges = [shuffledPlayers[3], shuffledPlayers[4], shuffledPlayers[5]];

    // Additional players alternate between contestants and judges
    for (let i = 6; i < playerCount; i++) {
      if ((i - 6) % 2 === 0) {
        contestants.push(shuffledPlayers[i]);
      } else {
        judges.push(shuffledPlayers[i]);
      }
    }
  }

  console.log(
    `Assigned ${contestants.length} contestants: ${contestants.map((p) => p.name).join(", ")}`
  );
  console.log(
    `Assigned ${judges.length} judges: ${judges.map((p) => p.name).join(", ")}`
  );
  console.log(`Assigned ${spectators.length} spectators: NONE`);
  console.log(`=== ASSIGNMENT COMPLETE ===`);

  // Update player roles
  gameState.players = gameState.players.map((player) => {
    if (contestants.find((c) => c.id === player.id)) {
      return { ...player, role: "contestant" };
    } else if (judges.find((j) => j.id === player.id)) {
      return { ...player, role: "judge" };
    } else if (spectators.find((s) => s.id === player.id)) {
      return { ...player, role: "spectator" };
    } else {
      // Fallback - if not assigned to any group, assign to contestants
      return { ...player, role: "contestant" };
    }
  });

  // Set the role-based arrays with updated player objects
  gameState.contestants = gameState.players.filter(
    (p) => p.role === "contestant"
  );
  gameState.judges = gameState.players.filter((p) => p.role === "judge");
  gameState.spectators = gameState.players.filter(
    (p) => p.role === "spectator"
  );
  gameState.currentWord =
    wordDefinitions[Math.floor(Math.random() * wordDefinitions.length)];

  // Set the real contestant (first contestant gets the real definition, unless testing all fake)
  if (TESTING_ALL_FAKE) {
    gameState.realContestantId = null; // No real contestant - all fake for testing
    console.log("TESTING MODE: All contestants will have fake definitions");
  } else {
    gameState.realContestantId =
      contestants.length > 0 ? contestants[0].id : null;
  }

  console.log(`=== ROLE ASSIGNMENT DEBUG ===`);
  console.log(`Total players: ${playerCount}`);
  console.log(
    `Contestants (${contestants.length}): ${contestants.map((p) => p.name).join(", ")}`
  );
  console.log(
    `Judges (${judges.length}): ${judges.map((p) => p.name).join(", ")}`
  );
  console.log(
    `Spectators (${spectators.length}): ${spectators.map((p) => p.name).join(", ")}`
  );
  console.log(
    `Real contestant: ${TESTING_ALL_FAKE ? "None (testing mode)" : contestants.length > 0 ? contestants[0].name : "None"}`
  );
  console.log(`=== END DEBUG ===`);
}

// Helper function to calculate and award points
function calculateAndAwardPoints() {
  if (
    !gameState.realContestantId ||
    Object.keys(gameState.judgeVotes).length === 0
  ) {
    console.log("No votes or no real contestant - skipping point calculation");
    return;
  }

  const realContestantId = gameState.realContestantId;
  const judgeVotes = gameState.judgeVotes;

  // Get the contestant that received the most votes
  const voteCounts = {};
  Object.values(judgeVotes).forEach((vote) => {
    if (vote) {
      voteCounts[vote] = (voteCounts[vote] || 0) + 1;
    }
  });

  const mostVotedContestantId = Object.keys(voteCounts).reduce((a, b) =>
    voteCounts[a] > voteCounts[b] ? a : b
  );

  const correctGuess = mostVotedContestantId === realContestantId;

  console.log(`=== POINT CALCULATION ===`);
  console.log(`Real contestant: ${realContestantId}`);
  console.log(`Most voted contestant: ${mostVotedContestantId}`);
  console.log(`Correct guess: ${correctGuess}`);

  // Award points to judges
  Object.keys(judgeVotes).forEach((judgeId) => {
    const judge = gameState.players.find((p) => p.id === judgeId);
    if (judge) {
      if (correctGuess) {
        judge.points += 1;
        console.log(`${judge.name} (judge) +1 point for correct guess`);
      } else {
        console.log(`${judge.name} (judge) 0 points for wrong guess`);
      }
    }
  });

  // Award points to real contestant
  const realContestant = gameState.players.find(
    (p) => p.id === realContestantId
  );
  if (realContestant) {
    if (!correctGuess) {
      realContestant.points += 1;
      console.log(
        `${realContestant.name} (real contestant) +1 point for successful bluff`
      );
    } else {
      console.log(
        `${realContestant.name} (real contestant) 0 points - judges guessed correctly`
      );
    }
  }

  // Award points to bluffers who received votes
  Object.keys(voteCounts).forEach((contestantId) => {
    if (contestantId !== realContestantId && voteCounts[contestantId] > 0) {
      const bluffer = gameState.players.find((p) => p.id === contestantId);
      if (bluffer) {
        bluffer.points += 1;
        console.log(
          `${bluffer.name} (bluffer) +1 point for receiving ${voteCounts[contestantId]} vote(s)`
        );
      }
    }
  });

  console.log(`=== END POINT CALCULATION ===`);
}

// Helper function to broadcast game state to all clients
function broadcastGameState() {
  io.emit("gameStateUpdate", gameState);
}

// Helper function to send personalized game state to a specific player
function sendPersonalizedGameState(socketId, playerId) {
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
  socket.on("joinGame", (playerName) => {
    const existingPlayer = gameState.players.find((p) => p.name === playerName);

    if (existingPlayer) {
      // Player reconnecting
      playerSockets.set(existingPlayer.id, socket.id);
      socketPlayers.set(socket.id, existingPlayer.id);
      console.log(`Player ${playerName} reconnected`);
      sendPersonalizedGameState(socket.id, existingPlayer.id);
    } else {
      // New player joining
      const newPlayer = {
        id: Date.now().toString() + Math.random().toString(),
        name: playerName,
        role: "pending", // Don't assign role until game starts
        points: 0,
      };

      gameState.players.push(newPlayer);
      playerSockets.set(newPlayer.id, socket.id);
      socketPlayers.set(socket.id, newPlayer.id);

      console.log(
        `Player ${playerName} joined. Total players: ${gameState.players.length}`
      );

      // Broadcast to ALL clients immediately
      broadcastGameState();
      sendPersonalizedGameState(socket.id, newPlayer.id);
    }
  });

  // Handle game start
  socket.on("startGame", () => {
    if (gameState.players.length >= 2 && gameState.gamePhase === "login") {
      assignRoles();
      gameState.gamePhase = "roleAssignment";
      console.log("Game started with", gameState.players.length, "players");
      broadcastGameState();

      // Send personalized updates to all players with their new roles
      gameState.players.forEach((player) => {
        const socketId = playerSockets.get(player.id);
        if (socketId) {
          sendPersonalizedGameState(socketId, player.id);
        }
      });
    }
  });

  // Handle next phase
  socket.on("nextPhase", () => {
    const now = Date.now();
    if (now - lastPhaseTransition < PHASE_COOLDOWN) {
      console.log(
        `Phase transition blocked - too soon (${now - lastPhaseTransition}ms since last)`
      );
      return;
    }

    const phases = [
      "login",
      "waiting",
      "roleAssignment",
      "contestantPhase",
      "votingPhase",
      "results",
      "nextRound",
    ];
    const currentIndex = phases.indexOf(gameState.gamePhase);
    const nextPhase = phases[(currentIndex + 1) % phases.length];

    console.log(`Phase transition: ${gameState.gamePhase} -> ${nextPhase}`);
    lastPhaseTransition = now;
    gameState.gamePhase = nextPhase;
    broadcastGameState();
  });

  // Handle fake definition submission
  socket.on("submitFakeDefinition", (data) => {
    gameState.fakeDefinitions[data.contestantId] = data.definition;
    broadcastGameState();
  });

  // Handle contestant ready status
  socket.on("contestantReady", (contestantId) => {
    if (!gameState.contestantsReady.includes(contestantId)) {
      gameState.contestantsReady.push(contestantId);
    }
    broadcastGameState();
  });

  // Handle judge voting
  socket.on("judgeVote", (data) => {
    gameState.judgeVotes[data.judgeId] = data.contestantId;
    broadcastGameState();
  });

  // Handle next round
  socket.on("nextRound", () => {
    // Calculate and award points before starting new round
    calculateAndAwardPoints();

    assignRoles();
    gameState.currentRound += 1;
    gameState.gamePhase = "roleAssignment";
    gameState.judgeVotes = {};
    gameState.fakeDefinitions = {}; // Reset fake definitions
    gameState.contestantsReady = []; // Reset contestants ready
    gameState.realContestantId = null; // Will be set by assignRoles
    broadcastGameState();

    // Send personalized updates to all players with their new roles
    gameState.players.forEach((player) => {
      const socketId = playerSockets.get(player.id);
      if (socketId) {
        sendPersonalizedGameState(socketId, player.id);
      }
    });
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
const isProduction = process.env.NODE_ENV === "production";
httpServer.listen(PORT, () => {
  console.log(`🚀 Game server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});
