'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { testApi } from '@/lib/api';
import { Test } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import toast from 'react-hot-toast';

export default function AdminTestsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchTests();
    }
  }, [isAuthenticated, isAdmin, currentPage]);

  const fetchTests = async () => {
    try {
      const response = await testApi.getAll({ page: currentPage, per_page: 15 });
      setTests(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      toast.error('Не удалось загрузить тесты');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот тест?')) {
      return;
    }

    try {
      await testApi.delete(id);
      toast.success('Тест успешно удалён');
      fetchTests();
    } catch (error) {
      console.error('Failed to delete test:', error);
      toast.error('Не удалось удалить тест');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Доступ запрещён</h1>
            <p className="mt-4 text-lg text-gray-600">
              Вам необходимы права администратора для доступа к этой странице.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Управление тестами
              </h1>
              <p className="text-gray-600">
                Создавайте, редактируйте и управляйте тестами.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/admin/tests/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Новый тест
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Нет тестов</h3>
            <p className="mt-1 text-sm text-gray-600">
              Начните с создания нового теста.
            </p>
            <div className="mt-6">
              <Link href="/admin/tests/new">
                <Button>Создать тест</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-gray-200 ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                            Название
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                            Категория
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                            Вопросы
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                            Время
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                            Создан
                          </th>
                          <th className="relative px-6 py-3">
                            <span className="sr-only">Действия</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tests.map((test) => (
                          <tr key={test.id} className="hover:bg-gray-100">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {test.title}
                              </div>
                              {test.description && (
                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                  {test.description}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {test.category ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-black">
                                  {test.category.name}
                                </span>
                              ) : (
                                <span className="text-gray-600">Без категории</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {test.questions.length}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {test.time_limit_minutes ? (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {test.time_limit_minutes} мин
                                </div>
                              ) : (
                                <span className="text-gray-600">Без ограничений</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(test.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Link href={`/admin/tests/${test.id}/edit`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(test.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
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
                    Next
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
