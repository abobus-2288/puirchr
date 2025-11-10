'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <main>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              ТестХаб
            </h1>
            
            <p className="text-lg text-gray-300 mb-8">
              Платформа для психологических тестов
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link href="/tests">
                    <Button size="lg">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Тесты
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin/tests/new">
                      <Button variant="outline" size="lg">
                        Создать тест
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg">
                      Регистрация
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg">
                      Войти
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
