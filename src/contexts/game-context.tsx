import { createContext, useContext, useReducer, useState, type ReactNode } from "react";

type Destination = {
  id: string;
  city: string;
  country: string;
  clues?: string[];
  funFacts?: string[];
  trivia?: string[];
  cdnImageUrl?: string;
};

type AnswerOption = {
  id: string;
  city: string;
  country: string;
};

type GameState = {
  isPlaying: boolean;
  currentDestination: { id: string; clues: string[] } | null;
  options: AnswerOption[] | null;
  selectedAnswer: string | null;
  result: {
    isCorrect: boolean;
    destination: Destination | null;
    fact: string | null;
  } | null;
  score: {
    correct: number;
    wrong: number;
    total: number;
  };
  challenge: {
    id: string;
    challenger: {
      username: string;
      totalScore: number;
      correctCount: number;
      wrongCount: number;
    } | null;
  } | null;
};

type GameAction = 
  | { type: "START_GAME" }
  | { type: "SET_CURRENT_DESTINATION"; payload: { id: string; clues: string[] } }
  | { type: "SET_OPTIONS"; payload: AnswerOption[] }
  | { type: "SELECT_ANSWER"; payload: string }
  | { type: "SET_RESULT"; payload: { isCorrect: boolean; destination: Destination; fact: string } }
  | { type: "NEXT_QUESTION" }
  | { type: "SET_CHALLENGE"; payload: { id: string; challenger: { username: string; totalScore: number; correctCount: number; wrongCount: number } } };

const initialState: GameState = {
  isPlaying: false,
  currentDestination: null,
  options: null,
  selectedAnswer: null,
  result: null,
  score: {
    correct: 0,
    wrong: 0,
    total: 0,
  },
  challenge: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...initialState,
        isPlaying: true,
        score: state.challenge ? state.score : initialState.score,
        challenge: state.challenge,
      };
    
    case "SET_CURRENT_DESTINATION":
      return {
        ...state,
        currentDestination: action.payload,
        selectedAnswer: null,
        result: null,
      };
    
    case "SET_OPTIONS":
      return {
        ...state,
        options: action.payload,
      };
    
    case "SELECT_ANSWER":
      return {
        ...state,
        selectedAnswer: action.payload,
      };
    
    case "SET_RESULT":
      const { isCorrect } = action.payload;
      return {
        ...state,
        result: action.payload,
        score: {
          correct: state.score.correct + (isCorrect ? 1 : 0),
          wrong: state.score.wrong + (isCorrect ? 0 : 1),
          total: state.score.total + (isCorrect ? 10 : 0),
        },
      };
    
    case "NEXT_QUESTION":
      return {
        ...state,
        currentDestination: null,
        options: null,
        selectedAnswer: null,
        result: null,
      };
    
    case "SET_CHALLENGE":
      return {
        ...state,
        challenge: action.payload,
      };
    
    default:
      return state;
  }
}

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  username: string | null;
  setUsername: (username: string) => void;
  profileId: string | null;
  setProfileId: (id: string) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [username, setUsername] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  
  return (
    <GameContext.Provider value={{ state, dispatch, username, setUsername, profileId, setProfileId }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
} 