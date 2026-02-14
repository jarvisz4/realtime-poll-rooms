'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Home Page
 * 
 * Landing page for Real-Time Poll Rooms.
 * Features a hero section with CTA to create a poll.
 */

export default function HomePage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-slate-50 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm mb-8 animate-fade-in">
              <span className="flex h-2 w-2 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-slate-700">
                Live Results • No Refresh Needed
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight animate-slide-up">
              Create Polls & Watch
              <br />
              <span className="text-primary-600">Results in Real-Time</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Create a poll in seconds, share the link with anyone, and watch 
              votes come in instantly. Built with fair voting protection.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={() => router.push('/create')}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 btn-hover flex items-center justify-center"
              >
                Create a Poll
                <svg 
                  className={`ml-2 w-5 h-5 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-primary-300 hover:text-primary-600 transition-all duration-200 flex items-center justify-center"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-50 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Create, share, and watch results in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="absolute -top-4 left-8 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Create Your Poll
              </h3>
              <p className="text-slate-600">
                Enter your question and add at least two options. No signup required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="absolute -top-4 left-8 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Share the Link
              </h3>
              <p className="text-slate-600">
                Copy the unique link and share it with friends, colleagues, or on social media.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="absolute -top-4 left-8 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Watch Live Results
              </h3>
              <p className="text-slate-600">
                See votes come in real-time with animated progress bars and percentages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for Fairness
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Two-layer protection ensures every vote counts only once
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  IP-Based Protection
                </h3>
                <p className="text-slate-600">
                  Each IP address can only vote once per poll. Hashed for privacy.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Browser Protection
                </h3>
                <p className="text-slate-600">
                  Local storage prevents multiple votes from the same browser session.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Real-Time Updates
                </h3>
                <p className="text-slate-600">
                  WebSocket-powered live updates. No page refresh needed.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Mobile Friendly
                </h3>
                <p className="text-slate-600">
                  Fully responsive design works perfectly on all devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Your First Poll?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            It takes less than a minute to create a poll and start collecting votes.
          </p>
          <button
            onClick={() => router.push('/create')}
            className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors btn-hover"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
}
