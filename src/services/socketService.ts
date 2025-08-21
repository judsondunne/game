import { io, Socket } from "socket.io-client";
import { GameState, Player } from "../types";

class SocketService {
  private socket: Socket | null = null;
  private currentPlayer: Player | null = null;

  // Get stored player data from localStorage
  getStoredPlayer(): Player | null {
    const stored = localStorage.getItem("fictionary_player");
    return stored ? JSON.parse(stored) : null;
  }

  // Store player data in localStorage
  storePlayer(player: Player) {
    localStorage.setItem("fictionary_player", JSON.stringify(player));
  }

  // Clear stored player data
  clearStoredPlayer() {
    localStorage.removeItem("fictionary_player");
  }

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      // Use network IP if not on localhost
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const serverUrl = isLocalhost
        ? "http://localhost:3001"
        : "http://192.168.1.204:3001";
      this.socket = io(serverUrl);

      this.socket.on("connect", () => {
        console.log("Connected to game server:", this.socket?.id);
        resolve(this.socket!);
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinGame(playerName: string) {
    if (this.socket) {
      this.socket.emit("joinGame", playerName);
    }
  }

  startGame() {
    if (this.socket) {
      this.socket.emit("startGame");
    }
  }

  nextPhase() {
    if (this.socket) {
      this.socket.emit("nextPhase");
    }
  }

  submitFakeDefinition(contestantId: string, definition: string) {
    if (this.socket) {
      this.socket.emit("submitFakeDefinition", { contestantId, definition });
    }
  }

  contestantReady(contestantId: string) {
    if (this.socket) {
      this.socket.emit("contestantReady", contestantId);
    }
  }

  judgeVote(judgeId: string, contestantId: string | null) {
    if (this.socket) {
      this.socket.emit("judgeVote", { judgeId, contestantId });
    }
  }

  nextRound() {
    if (this.socket) {
      this.socket.emit("nextRound");
    }
  }

  onGameStateUpdate(callback: (gameState: GameState) => void) {
    if (this.socket) {
      this.socket.on("gameStateUpdate", callback);
    }
  }

  onPersonalGameState(
    callback: (data: { gameState: GameState; currentPlayer: Player }) => void
  ) {
    if (this.socket) {
      this.socket.on("personalGameState", callback);
    }
  }

  getCurrentPlayer(): Player | null {
    return this.currentPlayer;
  }

  setCurrentPlayer(player: Player) {
    this.currentPlayer = player;
  }

  removeListener(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Export a singleton instance
export const socketService = new SocketService();
export default socketService;
