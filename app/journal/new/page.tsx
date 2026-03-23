'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../../../components/layout/Layout';
import { JournalEntryForm } from '../../../components/forms/JournalEntryForm';

const NewJournalEntryPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);

      // Mock API call to create journal entry
      console.log('Creating journal entry with data:', formData);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For now, we'll just log the data and redirect
      // In a real app, you'd make an API call to POST /api/journal-entries
      const entryData = {
        userId: 'demo-user-id', // This would come from auth context
        entryDate: formData.entryDate,
        entryType: formData.entryType,
        title: formData.title || null,
        content: formData.content || null,
        whatWentWell: formData.whatWentWell || null,
        whatWentWrong: formData.whatWentWrong || null,
        lessonsLearned: formData.lessonsLearned || null,
        goalsNextPeriod: formData.goalsNextPeriod || null,
        marketConditions: formData.marketConditions || null,
      };

      console.log('Journal entry created successfully:', entryData);

      // Redirect to journal page
      router.push('/journal');

    } catch (error) {
      console.error('Failed to create journal entry:', error);
      // Here you would show an error message to the user
      alert('Failed to create journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Layout title="New Journal Entry">
      <div className="max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a
                href="/journal"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Journal
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  New Entry
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Benefits of Regular Journaling
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Track patterns in your trading behavior and emotions
                  </li>
                  <li>
                    Document lessons learned to avoid repeating mistakes
                  </li>
                  <li>
                    Set and review goals to maintain focus and direction
                  </li>
                  <li>
                    Analyze market conditions impact on your performance
                  </li>
                  <li>
                    Build self-awareness and emotional intelligence
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Journal Entry Form */}
        <JournalEntryForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default NewJournalEntryPage;
