export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  points: number;
}

export type PlayerRole = "contestant" | "judge" | "spectator" | "pending";

export interface WordDefinition {
  word: string;
  definition: string;
}

export interface GameState {
  players: Player[];
  currentRound: number;
  currentWord: WordDefinition | null;
  gamePhase: GamePhase;
  contestants: Player[];
  judges: Player[];
  spectators: Player[];
  timer: number;
  judgeVotes: { [judgeId: string]: string | null };
  fakeDefinitions: { [contestantId: string]: string };
  contestantsReady: string[];
  roundResults: RoundResult[];
  realContestantId: string | null;
}

export type GamePhase =
  | "login"
  | "waiting"
  | "roleAssignment"
  | "contestantPhase"
  | "votingPhase"
  | "results"
  | "nextRound";

export interface RoundResult {
  round: number;
  word: string;
  realContestant: string;
  judgeVotes: { [judgeId: string]: string };
  correctGuess: boolean;
  pointsAwarded: { [playerId: string]: number };
}
