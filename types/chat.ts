export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type QueryType = 
  | 'time-patterns'
  | 'content-sources'
  | 'binge-behavior'
  | 'engagement'
  | 'search-behavior'
  | 'general';