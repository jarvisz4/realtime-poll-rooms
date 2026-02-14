/**
 * Type definitions for Real-Time Poll Rooms
 */

// Poll Option structure
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

// Poll document from MongoDB
export interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
}

// Vote record for anti-abuse tracking
export interface VoteRecord {
  pollId: string;
  hashedIp: string;
  votedAt: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Create poll request body
export interface CreatePollRequest {
  question: string;
  options: string[];
}

// Create poll response
export interface CreatePollResponse {
  pollId: string;
  shareUrl: string;
}

// Vote request body
export interface VoteRequest {
  pollId: string;
  optionId: string;
}

// Vote response
export interface VoteResponse {
  poll: Poll;
  hasVoted: boolean;
}

// WebSocket message types
export type WebSocketMessageType = 
  | 'VOTE_UPDATE'
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE'
  | 'ERROR'
  | 'CONNECTED';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload?: unknown;
  pollId?: string;
  error?: string;
}

// Client-side vote tracking (localStorage)
export interface ClientVoteRecord {
  pollId: string;
  optionId: string;
  votedAt: string;
}

// Poll with computed percentages
export interface PollWithPercentages extends Poll {
  options: (PollOption & { percentage: number })[];
}

// Error types
export type PollErrorType =
  | 'POLL_NOT_FOUND'
  | 'INVALID_POLL_ID'
  | 'ALREADY_VOTED'
  | 'INVALID_OPTION'
  | 'INVALID_QUESTION'
  | 'INVALID_OPTIONS'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR';

export interface PollError {
  type: PollErrorType;
  message: string;
}
