import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Poll } from '@/models/Poll';
import { VoteRecord } from '@/models/VoteRecord';
import { getClientIp, hashIpAddress, isValidPollId } from '@/lib/utils';
import { ApiResponse, VoteRequest, Poll as PollType } from '@/types';

/**
 * POST /api/vote
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let body: VoteRequest;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const { pollId, optionId } = body;

    if (!pollId || !isValidPollId(pollId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid poll ID' },
        { status: 400 }
      );
    }

    if (!optionId || typeof optionId !== 'string') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid option ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const clientIp = getClientIp(request);
    const hashedIp = hashIpAddress(clientIp);

    const hasVoted = await VoteRecord.hasVoted(pollId, hashedIp);
    if (hasVoted) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Already voted' },
        { status: 403 }
      );
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    const optionExists = poll.options.some((o) => o.id === optionId);
    if (!optionExists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid option' },
        { status: 400 }
      );
    }

    await VoteRecord.recordVote(pollId, hashedIp);

    const updatedPoll = await Poll.findOneAndUpdate(
      { _id: pollId, 'options.id': optionId },
      {
        $inc: {
          'options.$.votes': 1,
          totalVotes: 1,
        },
      },
      { new: true }
    );

    if (!updatedPoll) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update vote' },
        { status: 500 }
      );
    }

    const pollData: PollType = {
      _id: updatedPoll._id.toString(),
      question: updatedPoll.question,
      options: updatedPoll.options,
      totalVotes: updatedPoll.totalVotes,
      createdAt: updatedPoll.createdAt.toISOString(),
      updatedAt: updatedPoll.updatedAt.toISOString(),
    };

    /**
     * 🔥 IMPORTANT PART
     * Notify standalone WebSocket server
     */
    try {
      await fetch('http://localhost:3001/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          pollData,
        }),
      });
    } catch (err) {
      console.warn('WebSocket notify failed', err);
    }

    return NextResponse.json<ApiResponse<PollType>>(
      {
        success: true,
        data: pollData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ success: true });
}
