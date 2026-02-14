import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Poll } from '@/models/Poll';
import { VoteRecord } from '@/models/VoteRecord';
import { isValidPollId, getClientIp, hashIpAddress } from '@/lib/utils';
import { ApiResponse, Poll as PollType } from '@/types';
import { Types } from 'mongoose';

/**
 * GET /api/poll/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    if (!isValidPollId(id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 🔥 Important fix: remove .lean() and type it properly
    const poll = await Poll.findById(id);

    if (!poll) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check IP vote
    const clientIp = getClientIp(request);
    const hashedIp = hashIpAddress(clientIp);
    const hasVoted = await VoteRecord.hasVoted(id, hashedIp);

    const pollData: PollType = {
      _id: (poll._id as Types.ObjectId).toString(),
      question: poll.question,
      options: poll.options,
      totalVotes: poll.totalVotes,
      createdAt: poll.createdAt.toISOString(),
      updatedAt: poll.updatedAt.toISOString(),
    };

    return NextResponse.json<
      ApiResponse<PollType & { hasVoted: boolean }>
    >(
      {
        success: true,
        data: {
          ...pollData,
          hasVoted,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching poll:', error);

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/poll/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    if (!isValidPollId(id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedPoll = await Poll.findByIdAndDelete(id);

    if (!deletedPoll) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    await VoteRecord.deleteByPollId(id);

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Poll deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting poll:', error);

    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete poll' },
      { status: 500 }
    );
  }
}
