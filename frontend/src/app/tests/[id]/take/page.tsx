'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { testApi, testResultApi } from '@/lib/api';
import { Test, TestResult, TestType } from '@/types';
import { formatDate } from '@/lib/utils';
import { Clock, BookOpen, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import toast from 'react-hot-toast';
import LikertAnswerInput from '@/components/test/LikertAnswerInput';
import YesNoAnswerInput from '@/components/test/YesNoAnswerInput';


export default function TakeTestPage() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchTest();
    }
  }, [isAuthenticated, params.id]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !submitting && test) {
        const isLastQuestion = currentQuestion === test.questions.length - 1;
        if (isLastQuestion && answers[currentQuestion]) {
          handleSubmit();
        } else if (!isLastQuestion && answers[currentQuestion]) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, answers, submitting, test]);

  const fetchTest = async () => {
    try {
      const response = await testApi.getById(Number(params.id));
      setTest(response.data);

      const startResponse = await testApi.start(Number(params.id));
      setTestResult(startResponse.data.test_result);
    } catch (error) {
      console.error('Failed to fetch test:', error);
      toast.error('Failed to load test');
      router.push('/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = useCallback((questionIndex: number, answerValue: number | string) => {
    console.log('handleAnswerSelect - questionIndex:', questionIndex, 'answerValue:', answerValue);
    setAnswers(prev => {
      // Проверяем, не пытаемся ли мы установить то же значение
      if (prev[questionIndex] === answerValue) {
        console.log('Same value, skipping update');
        return prev;
      }
      return {
        ...prev,
        [questionIndex]: answerValue
      };
    });
  }, []);

  const handleNext = () => {
    if (currentQuestion < (test?.questions.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!testResult) return;

    const unansweredQuestions = test?.questions.filter((_, index) => !answers[index]) || [];
    if (unansweredQuestions.length > 0) {
      toast.error(`Пожалуйста, ответьте на все вопросы. Осталось ${unansweredQuestions.length} вопросов.`);
      return;
    }

    setSubmitting(true);
    try {
    const answersArray = Object.entries(answers).map(([questionIndex, answerValue]) => ({
      question_index: parseInt(questionIndex),
      answer_value: Number(answerValue),
    }));

      const response = await testResultApi.submitAnswers(testResult.id, answersArray);
      toast.success('Тест успешно отправлен!');
      router.push(`/tests/${test?.id}/results/${testResult.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Не удалось отправить тест');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Пожалуйста, войдите в систему для прохождения тестов</h1>
            <p className="mt-4 text-lg text-gray-600">
              Вам необходимо войти в систему для прохождения тестов.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <Button>Войти</Button>
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

  if (!test || !testResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Тест не найден</h1>
            <p className="mt-4 text-lg text-gray-600">
              Тест, который вы ищете, не существует.
            </p>
            <div className="mt-8">
              <Link href="/tests">
                <Button>Назад к тестам</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestion === test.questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/tests/${test.id}`}
            className="inline-flex items-center text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к тесту
          </Link>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">{test.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                  <span>Вопрос {currentQuestion + 1} из {test.questions.length}</span>
                  {test.time_limit_minutes && (
                    <span>{test.time_limit_minutes} мин</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Прогресс</p>
                <p className="text-lg font-bold text-white">{answeredCount}/{test.questions.length}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            <div className="mb-8">
              {test.test_type === 'likert' && (
                <LikertAnswerInput
                  questionText={test.questions[currentQuestion].text}
                  value={answers[currentQuestion] as number}
                  onChange={(value) => handleAnswerSelect(currentQuestion, value)}
                />
              )}

              {test.test_type === 'yes_no' && (
                <YesNoAnswerInput
                  questionText={test.questions[currentQuestion].text}
                  value={answers[currentQuestion] as number}
                  onChange={(value) => handleAnswerSelect(currentQuestion, value)}
                />
              )}

            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Назад
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !answers[currentQuestion]}
                >
                  {submitting ? 'Отправка...' : 'Отправить тест'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion]}
                >
                  Далее
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
