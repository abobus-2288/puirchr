'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { testApi } from '@/lib/api';
import { Test } from '@/types';
import { formatDate } from '@/lib/utils';
import { Clock, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import toast from 'react-hot-toast';

export default function TestPage() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchTest();
    }
  }, [isAuthenticated, params.id]);

  const fetchTest = async () => {
    try {
      const response = await testApi.getById(Number(params.id));
      setTest(response.data);
    } catch (error) {
      console.error('Failed to fetch test:', error);
      toast.error('Failed to load test');
      router.push('/tests');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Войдите для просмотра тестов</h1>
            <p className="mt-4 text-lg text-gray-600">
              Необходимо войти в систему для доступа к тестам.
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
      <div className="min-h-screen bg-white">
        <Loading />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Тест не найден</h1>
            <p className="mt-4 text-lg text-gray-600">
              Запрашиваемый тест не существует.
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

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/tests"
            className="inline-flex items-center text-sm text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к тестам
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
            {test.category && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800">
                {test.category.name}
              </span>
            )}
          </div>

          {test.description && (
            <p className="text-gray-600">
              {test.description}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div>
              <p className="text-sm text-gray-600">Вопросы</p>
              <p className="text-lg font-semibold text-gray-900">{test.questions.length}</p>
            </div>

            {test.time_limit_minutes && (
              <div>
                <p className="text-sm text-gray-600">Время</p>
                <p className="text-lg font-semibold text-gray-900">{test.time_limit_minutes} мин</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Создан</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(test.created_at)}</p>
            </div>
          </div>

          <div className="text-center">
            <Link href={`/tests/${test.id}/take`}>
              <Button size="lg" className="w-full sm:w-auto">
                Начать тест
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}