import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Poll } from '@/models/Poll';
import { 
  validateQuestion, 
  validateOptions, 
  generatePollId, 
  generateOptionId,
  sanitizeString 
} from '@/lib/utils';
import { CreatePollRequest, ApiResponse, CreatePollResponse } from '@/types';

/**
 * POST /api/poll
 * 
 * Creates a new poll with the provided question and options.
 * Validates input data and returns the created poll ID.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    let body: CreatePollRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { question, options } = body;

    // Validate question
    const questionValidation = validateQuestion(question);
    if (!questionValidation.valid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: questionValidation.error },
        { status: 400 }
      );
    }

    // Validate options
    const optionsValidation = validateOptions(options);
    if (!optionsValidation.valid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: optionsValidation.error },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Generate unique poll ID
    const pollId = generatePollId();

    // Sanitize and prepare options
    const sanitizedOptions = options
      .filter(opt => opt.trim().length > 0)
      .map(text => ({
        id: generateOptionId(),
        text: sanitizeString(text.trim()),
        votes: 0,
      }));

    // Create new poll
    const poll = new Poll({
      _id: pollId,
      question: sanitizeString(question.trim()),
      options: sanitizedOptions,
      totalVotes: 0,
    });

    // Save to database
    await poll.save();

    // Generate shareable URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${appUrl}/poll/${pollId}`;

    // Return success response
    const response: CreatePollResponse = {
      pollId,
      shareUrl,
    };

    return NextResponse.json<ApiResponse<CreatePollResponse>>(
      { success: true, data: response },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating poll:', error);
    
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create poll. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/poll
 * 
 * Health check endpoint for the poll API
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json<ApiResponse>(
    { success: true, message: 'Poll API is running' },
    { status: 200 }
  );
}
