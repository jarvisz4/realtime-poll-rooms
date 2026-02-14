import { ClientVoteRecord } from '@/types';

/**
 * Client-Side Vote Storage Module
 * 
 * This module implements Anti-Abuse Mechanism 2:
 * - Uses browser localStorage to track votes
 * - Prevents users from voting multiple times on the same poll
 * - Provides a fallback when IP-based detection fails
 * 
 * Note: This can be bypassed by clearing localStorage or using incognito mode,
 * which is why it's used in combination with IP-based tracking.
 */

const STORAGE_KEY = 'poll_rooms_votes';

/**
 * Get all vote records from localStorage
 */
export function getAllVotes(): ClientVoteRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const votes: ClientVoteRecord[] = JSON.parse(stored);
    
    // Validate that it's an array
    if (!Array.isArray(votes)) {
      console.warn('Invalid vote data in localStorage, clearing...');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return votes;
  } catch (error) {
    console.error('Error reading votes from localStorage:', error);
    return [];
  }
}

/**
 * Save all vote records to localStorage
 */
function saveAllVotes(votes: ClientVoteRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  } catch (error) {
    console.error('Error saving votes to localStorage:', error);
    
    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old votes...');
      // Keep only the 50 most recent votes
      const trimmedVotes = votes.slice(-50);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedVotes));
      } catch (e) {
        console.error('Failed to save even trimmed votes:', e);
      }
    }
  }
}

/**
 * Check if user has voted on a specific poll
 */
export function hasVotedOnPoll(pollId: string): boolean {
  const votes = getAllVotes();
  return votes.some(vote => vote.pollId === pollId);
}

/**
 * Get vote details for a specific poll
 */
export function getVoteForPoll(pollId: string): ClientVoteRecord | null {
  const votes = getAllVotes();
  return votes.find(vote => vote.pollId === pollId) || null;
}

/**
 * Record a vote in localStorage
 * Returns true if vote was recorded, false if already voted
 */
export function recordVote(pollId: string, optionId: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if already voted
  if (hasVotedOnPoll(pollId)) {
    console.log('Already voted on poll:', pollId);
    return false;
  }

  try {
    const votes = getAllVotes();
    
    // Add new vote record
    const newVote: ClientVoteRecord = {
      pollId,
      optionId,
      votedAt: new Date().toISOString(),
    };

    votes.push(newVote);
    saveAllVotes(votes);

    console.log('Vote recorded in localStorage:', pollId);
    return true;
  } catch (error) {
    console.error('Error recording vote:', error);
    return false;
  }
}

/**
 * Remove a vote record (for testing purposes)
 */
export function removeVote(pollId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const votes = getAllVotes();
    const filteredVotes = votes.filter(vote => vote.pollId !== pollId);
    saveAllVotes(filteredVotes);
    console.log('Vote removed from localStorage:', pollId);
  } catch (error) {
    console.error('Error removing vote:', error);
  }
}

/**
 * Clear all vote records (use with caution)
 */
export function clearAllVotes(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('All votes cleared from localStorage');
  } catch (error) {
    console.error('Error clearing votes:', error);
  }
}

/**
 * Get the number of polls the user has voted on
 */
export function getVoteCount(): number {
  return getAllVotes().length;
}

/**
 * Clean up old vote records (older than specified days)
 */
export function cleanupOldVotes(maxAgeDays: number = 30): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const votes = getAllVotes();
    const now = new Date();
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

    const validVotes = votes.filter(vote => {
      const voteDate = new Date(vote.votedAt);
      const ageMs = now.getTime() - voteDate.getTime();
      return ageMs <= maxAgeMs;
    });

    if (validVotes.length < votes.length) {
      saveAllVotes(validVotes);
      console.log(`Cleaned up ${votes.length - validVotes.length} old vote records`);
    }
  } catch (error) {
    console.error('Error cleaning up old votes:', error);
  }
}

// Run cleanup on module load (if in browser)
if (typeof window !== 'undefined') {
  cleanupOldVotes();
}
