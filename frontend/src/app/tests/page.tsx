'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { testApi } from '@/lib/api';
import { Test } from '@/types';
import { formatDate } from '@/lib/utils';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';

export default function TestsPage() {
  const { isAuthenticated } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTests();
    }
  }, [isAuthenticated, currentPage]);

  const fetchTests = async () => {
    try {
      const response = await testApi.getAll({ page: currentPage, per_page: 12 });
      setTests(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Пожалуйста, войдите в систему для просмотра тестов</h1>
            <p className="mt-4 text-lg text-gray-600">
              Вам необходимо войти в систему для доступа к библиотеке тестов.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">
            Тесты
          </h1>
          <p className="text-gray-600">
            Выберите тест для прохождения
          </p>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900">Нет доступных тестов</h3>
            <p className="text-gray-600">
              В данный момент нет доступных тестов.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => (
                <div 
                  key={test.id} 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {test.title}
                      </h3>
                      {test.category?.name && (
                        <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {test.category.name}
                        </span>
                      )}
                    </div>
                    
                    {test.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                        {test.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {test.questions.length} вопросов
                        </span>
                        {test.time_limit_minutes && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {test.time_limit_minutes} мин
                          </span>
                        )}
                      </div>
                    </div>

                    <Link href={`/tests/${test.id}`} className="mt-auto">
                      <Button className="w-full flex items-center justify-center">
                        Начать тест
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Назад
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Далее
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
