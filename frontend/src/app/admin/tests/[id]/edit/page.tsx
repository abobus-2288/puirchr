'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { testApi, categoryApi } from '@/lib/api';
import { Category, Test } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import ScoringLogicConfig from '@/components/ScoringLogicConfig';
import ResultInterpretationConfig from '@/components/ResultInterpretationConfig';

interface Question {
  text: string;
}

interface TestForm {
  category_id: number;
  title: string;
  description: string;
  time_limit_minutes: number;
  questions: Question[];
}

export default function EditTestPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [test, setTest] = useState<Test | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(true);
  const [scoringLogic, setScoringLogic] = useState<Record<string, any>>({});
  const [resultInterpretation, setResultInterpretation] = useState<Record<string, any>>({});

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TestForm>({
    defaultValues: {
      questions: [{ text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  useEffect(() => {
    if (isAuthenticated && isAdmin && params.id) {
      fetchData();
    }
  }, [isAuthenticated, isAdmin, params.id]);

  const fetchData = async () => {
    try {
      await Promise.all([fetchCategories(), fetchTest()]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load test data');
    } finally {
      setCategoriesLoading(false);
      setTestLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll({ per_page: 100 });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchTest = async () => {
    try {
      const response = await testApi.getById(Number(params.id));
      const testData = response.data;
      setTest(testData);
      
      reset({
        category_id: testData.category_id,
        title: testData.title,
        description: testData.description || '',
        time_limit_minutes: testData.time_limit_minutes || 0,
        questions: testData.questions || [{ text: '' }],
      });

      setScoringLogic(testData.scoring_logic || {});
      setResultInterpretation(testData.result_interpretation || {});
    } catch (error) {
      console.error('Failed to fetch test:', error);
      toast.error('Failed to load test');
      router.push('/admin/tests');
    }
  };

  const addQuestion = () => {
    append({ text: '' });
  };

  const onSubmit = async (data: TestForm) => {
    setLoading(true);
    try {
      const processedData = {
        ...data,
        time_limit_minutes: data.time_limit_minutes || undefined,
        questions: data.questions.filter(q => q.text.trim() !== ''),
        scoring_logic: Object.keys(scoringLogic).length > 0 ? scoringLogic : undefined,
        result_interpretation: Object.keys(resultInterpretation).length > 0 ? resultInterpretation : undefined,
      };

      await testApi.update(Number(params.id), processedData);
      toast.success('Test updated successfully!');
      router.push('/admin/tests');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update test');
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

  if (categoriesLoading || testLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Test not found</h1>
            <p className="mt-4 text-lg text-gray-600">
              The test you're trying to edit doesn't exist.
            </p>
            <div className="mt-8">
              <Link href="/admin/tests">
                <Button>Back to Tests</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin/tests"
            className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Tests
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white">Edit Psychological Test</h1>
          <p className="mt-2 text-sm text-gray-300">
            Update the test configuration and scoring logic.
          </p>
        </div>

        <div className="bg-gray-800 shadow rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Select
                label="Category"
                options={[
                  { value: '', label: 'Select a category' },
                  ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                ]}
                {...register('category_id', {
                  required: 'Category is required',
                })}
                error={errors.category_id?.message}
              />

              <Input
                label="Time Limit (minutes)"
                type="number"
                min="1"
                placeholder="Optional"
                {...register('time_limit_minutes', {
                  valueAsNumber: true,
                })}
                error={errors.time_limit_minutes?.message}
              />
            </div>

            <Input
              label="Test Title"
              placeholder="Enter test title"
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters',
                },
                maxLength: {
                  value: 255,
                  message: 'Title must be less than 255 characters',
                },
              })}
              error={errors.title?.message}
            />

            <Textarea
              label="Description"
              placeholder="Enter test description (optional)"
              rows={3}
              {...register('description', {
                maxLength: {
                  value: 1000,
                  message: 'Description must be less than 1000 characters',
                },
              })}
              error={errors.description?.message}
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Questions</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-6">
                {fields.map((field, questionIndex) => (
                  <div key={field.id} className="border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-white">
                        Question {questionIndex + 1}
                      </h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => remove(questionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Textarea
                        label="Question Text"
                        placeholder="Enter the question"
                        rows={2}
                        {...register(`questions.${questionIndex}.text`, {
                          required: 'Question text is required',
                        })}
                        error={errors.questions?.[questionIndex]?.text?.message}
                      />

                      <div className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-sm text-gray-300">
                          This question will use a 5-point Likert scale:
                        </p>
                        <ul className="text-xs text-gray-400 mt-2 space-y-1">
                          <li>1 - Strongly Disagree</li>
                          <li>2 - Disagree</li>
                          <li>3 - Neutral/Partly Agree</li>
                          <li>4 - Agree</li>
                          <li>5 - Strongly Agree</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ScoringLogicConfig
              value={scoringLogic}
              onChange={setScoringLogic}
              totalQuestions={fields.length}
            />

            <ResultInterpretationConfig
              value={resultInterpretation}
              onChange={setResultInterpretation}
              scoringCategories={Object.keys(scoringLogic)}
            />

            <div className="flex justify-end space-x-3">
              <Link href="/admin/tests">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Test'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
