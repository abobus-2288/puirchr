'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { testResultApi } from '@/lib/api';
import { TestResult } from '@/types';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, CheckCircle, BarChart3, Clock, User, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import toast from 'react-hot-toast';
import TestResultCube from '@/components/test/TestResultCube';

export default function TestResultPage() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && params.resultId) {
      fetchTestResult();
    }
  }, [isAuthenticated, params.resultId]);

  const fetchTestResult = async () => {
    try {
      const response = await testResultApi.getResult(Number(params.resultId));
      setTestResult(response.data);
    } catch (error) {
      console.error('Failed to fetch test result:', error);
      toast.error('Failed to load test result');
      router.push('/tests');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Please log in to view results</h1>
            <p className="mt-4 text-lg text-gray-600">
              You need to be logged in to view test results.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Test result not found</h1>
            <p className="mt-4 text-lg text-gray-600">
              The test result you're looking for doesn't exist.
            </p>
            <div className="mt-8">
              <Link href="/tests">
                <Button>Back to Tests</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const test = testResult.test;
  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Test not found</h1>
            <p className="mt-4 text-lg text-gray-600">
              The test for this result no longer exists.
            </p>
            <div className="mt-8">
              <Link href="/tests">
                <Button>Back to Tests</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderScores = () => {
    if (!testResult.scores) return null;

    if (testResult.scores.total_score !== undefined) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Overall Score
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Score</p>
              <p className="text-2xl font-bold text-gray-900">{testResult.scores.total_score}</p>
              <p className="text-xs text-gray-500 mt-1">out of {testResult.scores.max_possible_score}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{testResult.scores.average_score}</p>
              <p className="text-xs text-gray-500 mt-1">out of 5.0</p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Percentage</p>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${testResult.scores.percentage}%` }}
                ></div>
              </div>
              <span className="text-lg font-bold text-gray-900 min-w-[50px]">{testResult.scores.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Category Scores
        </h3>
        <div className="space-y-4">
          {Object.entries(testResult.scores).map(([category, score]: [string, any]) => (
            <div key={category} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</h4>
                <span className="text-sm text-gray-600 font-medium">{score.score}/{score.max_score}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${score.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 min-w-[45px]">{score.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getTestResultData = () => {
    let numericResult = 0;
    let maxScore = 100;
    let textDescription = 'Результат теста';
    let category = '';

    if (testResult.scores) {
      // Check for category-based scores (like "total" with percentage)
      if (testResult.scores.total && testResult.scores.total.percentage !== undefined) {
        numericResult = testResult.scores.total.percentage;
        maxScore = 100;
        category = 'total';
      } else if (testResult.scores.total_score !== undefined) {
        numericResult = testResult.scores.total_score;
        maxScore = testResult.scores.max_possible_score || 100;
      } else if (testResult.scores.percentage !== undefined) {
        numericResult = testResult.scores.percentage;
        maxScore = 100;
      } else {
        // Try to get first category score
        const scoreEntries = Object.entries(testResult.scores);
        if (scoreEntries.length > 0) {
          const [firstCategory, scoreData]: [string, any] = scoreEntries[0];
          if (scoreData.percentage !== undefined) {
            numericResult = scoreData.percentage;
            maxScore = 100;
            category = firstCategory;
          } else if (scoreData.score !== undefined) {
            numericResult = scoreData.score;
            maxScore = scoreData.max_score || 100;
            category = firstCategory;
          }
        }
      }
    }

    if (testResult.interpretation) {
      const interpretationEntries = Object.entries(testResult.interpretation);
      if (interpretationEntries.length > 0) {
        // Try to match category from scores, or use first interpretation
        const categoryKey = category || Object.keys(testResult.interpretation)[0];
        const interpretation = testResult.interpretation[categoryKey];
        if (interpretation) {
          category = categoryKey.replace('_', ' ');
          textDescription = interpretation;
        } else {
          const [firstCategory, firstInterpretation] = interpretationEntries[0];
          category = firstCategory.replace('_', ' ');
          textDescription = firstInterpretation;
        }
      }
    }

    const testDescription = test?.description || 'Описание теста отсутствует';
    
    return { numericResult, maxScore, textDescription, category, testDescription };
  };

  const renderInterpretation = () => {
    if (!testResult.interpretation) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Interpretation
        </h3>
        <div className="space-y-4">
          {Object.entries(testResult.interpretation).map(([category, interpretation]: [string, any]) => (
            <div key={category} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 capitalize">{category.replace('_', ' ')}</h4>
              <p className="text-gray-600 leading-relaxed">{interpretation}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/tests/${test.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Test
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="px-6 py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
                {test.description && (
                  <p className="mt-2 text-lg text-gray-600">{test.description}</p>
                )}
              </div>
              <div className="ml-6 flex-shrink-0">
                {test.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {test.category.name}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {testResult.completed_at ? formatDate(testResult.completed_at) : 'Not completed'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Started</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {testResult.started_at ? formatDate(testResult.started_at) : 'Not started'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Questions</p>
                  <p className="text-lg font-semibold text-gray-900">{test.questions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Результаты теста</h2>
            <TestResultCube {...getTestResultData()} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderScores()}
            {renderInterpretation()}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/tests">
            <Button variant="outline">
              Back to All Tests
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
