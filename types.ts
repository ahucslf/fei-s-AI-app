export interface HistoryItem {
  id: string;
  name: string;
  timestamp: Date;
  isRigged: boolean; // Internal flag to debug if needed, logically true for this app context
}

export interface AppState {
  candidates: string[]; // The pool of names to scroll through
  riggedSequence: string[]; // The ordered list of predetermined winners
  history: HistoryItem[];
  nextRiggedIndex: number;
}