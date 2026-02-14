import mongoose from 'mongoose';

/**
 * Database Connection Module
 * 
 * This module handles MongoDB connection using Mongoose.
 * It implements connection pooling and caching for serverless environments.
 */

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global variable to maintain connection across hot reloads in development
 * and to share connection in serverless environment
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: typeof mongoose | undefined;
}

let cachedConnection: typeof mongoose | undefined = global.mongooseConnection;

/**
 * Connect to MongoDB database
 * Uses connection caching for serverless compatibility
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // If we have a cached connection, use it
  if (cachedConnection) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  // If no cached connection, create a new one
  try {
    console.log('Creating new MongoDB connection...');
    
    const connection = await mongoose.connect(MONGODB_URI as string, {
      // Connection options for better reliability
      maxPoolSize: 10, // Maximum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
      bufferCommands: false, // Disable buffering for serverless
    });

    // Cache the connection
    cachedConnection = connection;
    global.mongooseConnection = connection;

    console.log('MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedConnection = undefined;
      global.mongooseConnection = undefined;
    });

    return connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Database connection failed. Please check your MONGODB_URI.');
  }
}

/**
 * Disconnect from MongoDB database
 * Useful for testing and cleanup
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = undefined;
    global.mongooseConnection = undefined;
    console.log('MongoDB disconnected manually');
  }
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1; // 1 = connected
}

/**
 * Get current connection state
 */
export function getConnectionState(): string {
  const states = [
    'disconnected',
    'connected',
    'connecting',
    'disconnecting',
  ];
  return states[mongoose.connection.readyState] || 'unknown';
}
