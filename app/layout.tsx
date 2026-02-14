import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/**
 * Root Layout
 * 
 * This is the root layout for the Real-Time Poll Rooms application.
 * It includes global styles and metadata.
 */

export const metadata: Metadata = {
  title: 'Real-Time Poll Rooms - Create and Share Live Polls',
  description: 'Create polls, share with friends, and watch results update in real-time. Free, fast, and fair voting with anti-abuse protection.',
  keywords: ['polls', 'voting', 'real-time', 'surveys', 'live polls'],
  authors: [{ name: 'Real-Time Poll Rooms' }],
  openGraph: {
    title: 'Real-Time Poll Rooms',
    description: 'Create polls, share with friends, and watch results update in real-time.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg 
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-slate-900">
                  Poll Rooms
                </span>
              </a>
              
              <nav className="flex items-center space-x-4">
                <a 
                  href="/" 
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Home
                </a>
                <a 
                  href="/create" 
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors btn-hover"
                >
                  Create Poll
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center">
                  <svg 
                    className="w-4 h-4 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                    />
                  </svg>
                </div>
                <span className="text-slate-600">
                  Real-Time Poll Rooms
                </span>
              </div>
              
              <p className="text-slate-500 text-sm">
                Create polls and watch results update in real-time
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
