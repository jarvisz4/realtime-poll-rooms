'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateQuestion, validateOptions } from '@/lib/utils';

/**
 * Create Poll Page
 * 
 * Allows users to create a new poll with a question and multiple options.
 * Validates input and redirects to the poll page after creation.
 */

export default function CreatePollPage() {
  const router = useRouter();
  
  // Form state
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ question?: string; options?: string; general?: string }>({});
  const [touched, setTouched] = useState<{ question: boolean; options: boolean[] }>({
    question: false,
    options: [false, false],
  });

  /**
   * Add a new option field
   */
  const addOption = () => {
    if (options.length >= 10) {
      setErrors(prev => ({ ...prev, options: 'Maximum 10 options allowed' }));
      return;
    }
    setOptions([...options, '']);
    setTouched(prev => ({
      ...prev,
      options: [...prev.options, false],
    }));
    setErrors(prev => ({ ...prev, options: undefined }));
  };

  /**
   * Remove an option field
   */
  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setErrors(prev => ({ ...prev, options: 'At least 2 options are required' }));
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    const newTouched = touched.options.filter((_, i) => i !== index);
    setTouched(prev => ({ ...prev, options: newTouched }));
    setErrors(prev => ({ ...prev, options: undefined }));
  };

  /**
   * Update an option value
   */
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  /**
   * Mark field as touched on blur
   */
  const handleBlur = (field: 'question' | number) => {
    if (field === 'question') {
      setTouched(prev => ({ ...prev, question: true }));
      const validation = validateQuestion(question);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, question: validation.error }));
      } else {
        setErrors(prev => ({ ...prev, question: undefined }));
      }
    } else {
      const newTouched = [...touched.options];
      newTouched[field] = true;
      setTouched(prev => ({ ...prev, options: newTouched }));
      
      const validation = validateOptions(options);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, options: validation.error }));
      } else {
        setErrors(prev => ({ ...prev, options: undefined }));
      }
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const questionValidation = validateQuestion(question);
    const optionsValidation = validateOptions(options);

    setTouched({
      question: true,
      options: options.map(() => true),
    });

    if (!questionValidation.valid || !optionsValidation.valid) {
      setErrors({
        question: questionValidation.error,
        options: optionsValidation.error,
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/poll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          options: options.filter(opt => opt.trim().length > 0),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create poll');
      }

      // Redirect to the new poll page
      router.push(`/poll/${data.data.pollId}`);
    } catch (error) {
      console.error('Error creating poll:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create poll. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Create a New Poll
          </h1>
          <p className="text-lg text-slate-600">
            Ask a question and provide options for people to vote on
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Input */}
          <div>
            <label 
              htmlFor="question" 
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Poll Question <span className="text-red-500">*</span>
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onBlur={() => handleBlur('question')}
              placeholder="e.g., What's your favorite programming language?"
              rows={3}
              className={`w-full px-4 py-3 rounded-xl bg-white input-focus resize-none ${
                touched.question && errors.question 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                  : ''
              }`}
              disabled={isSubmitting}
            />
            {touched.question && errors.question && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.question}
              </p>
            )}
            <p className="mt-2 text-sm text-slate-500">
              {question.length}/500 characters
            </p>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Options <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-slate-500 mb-4">
              Add at least 2 options. Maximum 10 options.
            </p>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      onBlur={() => handleBlur(index)}
                      placeholder={`Option ${index + 1}`}
                      className={`w-full px-4 py-3 rounded-xl bg-white input-focus ${
                        touched.options[index] && errors.options && options.filter(o => o.trim()).length < 2
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                          : ''
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      disabled={isSubmitting}
                      title="Remove option"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Option Button */}
            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-3 flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Option
              </button>
            )}

            {errors.options && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.options}
              </p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.general}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors btn-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="spinner mr-2"></div>
                Creating Poll...
              </>
            ) : (
              <>
                Create Poll
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Tips */}
        <div className="mt-10 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tips for great polls
          </h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Keep your question clear and specific</li>
            <li>Make options mutually exclusive</li>
            <li>Avoid biased language in options</li>
            <li>Consider adding an &quot;Other&quot; option for open-ended responses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
