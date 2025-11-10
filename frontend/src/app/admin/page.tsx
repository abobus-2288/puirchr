'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { testApi, categoryApi } from '@/lib/api';
import { Test, Category } from '@/types';
import { BookOpen, FolderOpen, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalTests: 0,
    totalCategories: 0,
    recentTests: [] as Test[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchStats();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchStats = async () => {
    try {
      const [testsResponse, categoriesResponse] = await Promise.all([
        testApi.getAll({ per_page: 5 }),
        categoryApi.getAll({ per_page: 100 }),
      ]);

      setStats({
        totalTests: testsResponse.data.total,
        totalCategories: categoriesResponse.data.total,
        recentTests: testsResponse.data.data,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-4 text-lg text-gray-600">
              You need admin privileges to access this page.
            </p>
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
    <div className="min-h-screen bg-gray-900">
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-300">
            Welcome to the TestHub admin panel. Manage your tests and categories from here.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Total Tests</dt>
                    <dd className="text-lg font-medium text-white">{stats.totalTests}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/admin/tests" className="font-medium text-white hover:text-gray-300">
                  View all tests
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FolderOpen className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Categories</dt>
                    <dd className="text-lg font-medium text-white">{stats.totalCategories}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/admin/categories" className="font-medium text-white hover:text-gray-300">
                  Manage categories
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Users</dt>
                    <dd className="text-lg font-medium text-white">-</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 px-5 py-3">
              <div className="text-sm text-gray-400">
                Coming soon
              </div>
            </div>
          </div>

          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Active Tests</dt>
                    <dd className="text-lg font-medium text-white">-</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 px-5 py-3">
              <div className="text-sm text-gray-400">
                Coming soon
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Recent Tests</h3>
            </div>
            <div className="divide-y divide-gray-700">
              {stats.recentTests.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-400">
                  No tests created yet
                </div>
              ) : (
                stats.recentTests.map((test) => (
                  <div key={test.id} className="px-6 py-4 hover:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">{test.title}</h4>
                        <p className="text-sm text-gray-400">
                          {test.questions.length} questions
                          {test.time_limit_minutes && ` • ${test.time_limit_minutes} min`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {test.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-black">
                            {test.category.name}
                          </span>
                        )}
                        <Link href={`/admin/tests/${test.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/admin/tests/new">
            <Button size="lg" className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Create New Test
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
