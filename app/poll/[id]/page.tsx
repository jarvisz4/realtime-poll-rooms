'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Poll, PollOption } from '@/types';
import { useWebSocket } from '@/lib/useWebSocket';
import { hasVotedOnPoll, recordVote, getVoteForPoll } from '@/lib/vote-storage';
import { calculatePercentage, formatNumber } from '@/lib/utils';
import { set } from 'mongoose';

/**
 * Poll Voting Page
 * 
 * Displays a poll with voting options and real-time results.
 * Implements anti-abuse mechanisms and WebSocket updates.
 */

interface PollState {
  data: Poll | null;
  loading: boolean;
  error: string | null;
}

interface VoteState {
  hasVoted: boolean;
  selectedOption: string | null;
  isSubmitting: boolean;
  error: string | null;
}

export default function PollPage() {
  const params = useParams();
  const pollId = params.id as string;

  // Poll data state
  const [pollState, setPollState] = useState<PollState>({
    data: null,
    loading: true,
    error: null,
  });

  // Voting state
  const [voteState, setVoteState] = useState<VoteState>({
    hasVoted: false,
    selectedOption: null,
    isSubmitting: false,
    error: null,
  });

  // Copy link state
  const [copied, setCopied] = useState(false);

  /**
   * Fetch poll data from API
   */
  const fetchPoll = useCallback(async () => {
    try {
      setPollState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/poll/${pollId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load poll');
      }

      setPollState({
        data: data.data,
        loading: false,
        error: null,
      });

      // Check if user has already voted (client-side check)
      const clientHasVoted = hasVotedOnPoll(pollId);
      const clientVote = getVoteForPoll(pollId);

      setVoteState(prev => ({
        ...prev,
        hasVoted: data.data.hasVoted || clientHasVoted,
        selectedOption: clientVote?.optionId || null,
      }));
    } catch (error) {
      console.error('Error fetching poll:', error);
      setPollState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load poll',
      });
    }
  }, [pollId]);

  // Fetch poll on mount
  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  /**
   * Handle WebSocket vote updates
   */
  const handleVoteUpdate = useCallback((updatedPoll: Poll) => {
  console.log("Updating poll state from WS");
  setPollState(prev => ({
    ...prev,
    data: updatedPoll,
  }));
}, []);




  /**
   * Handle WebSocket errors
   */
  const handleWebSocketError = useCallback((error: string) => {
  console.warn('WebSocket error:', error);
}, []);


  // Initialize WebSocket connection
  const { isConnected, isConnecting } = useWebSocket({
    pollId,
    onVoteUpdate: handleVoteUpdate,
    onError: handleWebSocketError,
  });

  /**
   * Submit a vote
   */
  const submitVote = async (optionId: string) => {
    // Anti-Abuse Mechanism 2: Check localStorage first
    if (hasVotedOnPoll(pollId)) {
      setVoteState(prev => ({
        ...prev,
        hasVoted: true,
        error: 'You have already voted on this poll',
      }));
      return;
    }

    setVoteState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pollId, optionId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Handle specific error cases
        if (response.status === 403) {
          // Already voted (IP-based)
          setVoteState(prev => ({
            ...prev,
            hasVoted: true,
            error: data.error || 'You have already voted on this poll',
          }));
        } else {
          throw new Error(data.error || 'Failed to submit vote');
        }
        return;
      }

      // Record vote in localStorage (Anti-Abuse Mechanism 2)
      recordVote(pollId, optionId);

      // Update state with new poll data
      setPollState(prev => ({
        ...prev,
        data: data.data,
      }));

      setVoteState({
        hasVoted: true,
        selectedOption: optionId,
        isSubmitting: false,
        error: null,
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
      setVoteState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to submit vote',
      }));
    }
  };

  /**
   * Copy poll link to clipboard
   */
  const copyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Loading state
  if (pollState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (pollState.error || !pollState.data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Poll Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            {pollState.error || 'The poll you&apos;re looking for doesn&apos;t exist or has been removed.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const poll = pollState.data;
  const totalVotes = poll.totalVotes;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Poll Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              {/* Live Indicator */}
              <div className="flex items-center space-x-2">
                <span className={`flex h-2 w-2 relative ${isConnected ? '' : 'hidden'}`}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-slate-400'}`}>
                  {isConnecting ? 'Connecting...' : isConnected ? 'Live Updates' : 'Offline'}
                </span>
              </div>

              {/* Total Votes */}
              <div className="text-sm text-slate-500">
                {formatNumber(totalVotes)} {totalVotes === 1 ? 'vote' : 'votes'}
              </div>
            </div>

            {/* Question */}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {poll.question}
            </h1>
          </div>

          {/* Options */}
          <div className="p-6 md:p-8 space-y-4">
            {voteState.hasVoted ? (
              // Results View
              <ResultsView 
                options={poll.options} 
                totalVotes={totalVotes}
                selectedOption={voteState.selectedOption}
              />
            ) : (
              // Voting View
              <VotingView
                options={poll.options}
                onVote={submitVote}
                isSubmitting={voteState.isSubmitting}
              />
            )}

            {/* Error Message */}
            {voteState.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {voteState.error}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Share Link */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  readOnly
                  className="flex-1 sm:w-64 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              {/* Create New Poll */}
              <a
                href="/create"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Create your own poll →
              </a>
            </div>
          </div>
        </div>

        {/* Voting Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            {voteState.hasVoted 
              ? 'Thanks for voting! Results update in real-time.'
              : 'Vote once per device. Your vote is recorded securely.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Voting View Component
 * Shows options as clickable buttons
 */
interface VotingViewProps {
  options: PollOption[];
  onVote: (optionId: string) => void;
  isSubmitting: boolean;
}

function VotingView({ options, onVote, isSubmitting }: VotingViewProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onVote(option.id)}
          disabled={isSubmitting}
          className="w-full p-4 text-left bg-slate-50 hover:bg-primary-50 border-2 border-slate-200 hover:border-primary-300 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-slate-700 group-hover:text-primary-700">
              {option.text}
            </span>
            <svg 
              className="w-5 h-5 text-slate-400 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      ))}
      
      {isSubmitting && (
        <div className="flex items-center justify-center py-4">
          <div className="spinner mr-2"></div>
          <span className="text-slate-600">Submitting vote...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Results View Component
 * Shows options with progress bars and percentages
 */
interface ResultsViewProps {
  options: PollOption[];
  totalVotes: number;
  selectedOption: string | null;
}

function ResultsView({ options, totalVotes, selectedOption }: ResultsViewProps) {
  // Sort options by votes (descending) for better visualization
  const sortedOptions = [...options].sort((a, b) => b.votes - a.votes);
  const maxVotes = Math.max(...options.map(o => o.votes));

  return (
    <div className="space-y-4">
      {sortedOptions.map((option, index) => {
        const percentage = calculatePercentage(option.votes, totalVotes);
        const isSelected = option.id === selectedOption;
        const isLeading = index === 0 && option.votes > 0;

        return (
          <div key={option.id} className="relative">
            {/* Progress Bar Background */}
            <div 
              className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                isSelected 
                  ? 'bg-primary-100' 
                  : 'bg-slate-100'
              }`}
              style={{ 
                width: maxVotes > 0 ? `${(option.votes / maxVotes) * 100}%` : '50%'
              }}
            />

            {/* Content */}
            <div className="relative p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="font-medium text-slate-900">
                    {option.text}
                  </span>
                  {isSelected && (
                    <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded-full">
                      Your Vote
                    </span>
                  )}
                  {isLeading && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs font-medium rounded-full">
                      Leading
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500">
                  {formatNumber(option.votes)} {option.votes === 1 ? 'vote' : 'votes'}
                </div>
              </div>

              {/* Percentage */}
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-900">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Progress Bar (visual only) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 rounded-b-xl overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  isSelected ? 'bg-primary-600' : 'bg-slate-400'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
