import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Poll } from '@/models/Poll';
import { VoteRecord } from '@/models/VoteRecord';
import { isValidPollId, getClientIp, hashIpAddress } from '@/lib/utils';
import { ApiResponse, Poll as PollType } from '@/types';

/**
 * GET /api/poll/[id]
 * 
 * Fetches a specific poll by ID.
 * Returns poll data including question, options, and vote counts.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    // Validate poll ID format
    if (!isValidPollId(id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find poll by ID
    const poll = await Poll.findById(id).lean();

    if (!poll) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check if user has already voted (IP-based)
    const clientIp = getClientIp(request);
    const hashedIp = hashIpAddress(clientIp);
    const hasVoted = await VoteRecord.hasVoted(id, hashedIp);

    // Return poll data
    const pollData: PollType = {
      _id: poll._id.toString(),
      question: poll.question,
      options: poll.options,
      totalVotes: poll.totalVotes,
      createdAt: poll.createdAt.toISOString(),
      updatedAt: poll.updatedAt.toISOString(),
    };

    return NextResponse.json<ApiResponse<PollType & { hasVoted: boolean }>>(
      { 
        success: true, 
        data: { 
          ...pollData, 
          hasVoted 
        } 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching poll:', error);
    
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch poll. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/poll/[id]
 * 
 * Deletes a poll and all associated vote records.
 * Note: In a production app, you'd want to add authentication
 * to ensure only the poll creator can delete it.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    // Validate poll ID format
    if (!isValidPollId(id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Delete poll
    const deletedPoll = await Poll.findByIdAndDelete(id);

    if (!deletedPoll) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Delete associated vote records
    await VoteRecord.deleteByPollId(id);

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Poll deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting poll:', error);
    
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete poll. Please try again.' },
      { status: 500 }
    );
  }
}
