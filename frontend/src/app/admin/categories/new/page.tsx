'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { categoryApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryForm {
  name: string;
  description: string;
}

export default function NewCategoryPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryForm>();

  const onSubmit = async (data: CategoryForm) => {
    setLoading(true);
    try {
      await categoryApi.create({
        name: data.name,
        description: data.description || undefined,
      });
      toast.success('Category created successfully!');
      router.push('/admin/categories');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create category');
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

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin/categories"
            className="inline-flex items-center text-sm text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Categories
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Create New Category</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add a new category to organize your tests.
          </p>
        </div>

        <div className="bg-white">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <Input
              label="Category Name"
              placeholder="Enter category name"
              {...register('name', {
                required: 'Category name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
                maxLength: {
                  value: 255,
                  message: 'Name must be less than 255 characters',
                },
              })}
              error={errors.name?.message}
            />

            <Textarea
              label="Description"
              placeholder="Enter category description (optional)"
              rows={4}
              {...register('description', {
                maxLength: {
                  value: 1000,
                  message: 'Description must be less than 1000 characters',
                },
              })}
              error={errors.description?.message}
            />

            <div className="flex justify-end space-x-3">
              <Link href="/admin/categories">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
