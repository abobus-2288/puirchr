'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { testApi, categoryApi } from '@/lib/api';
import { Category, TestType, Question, LikertQuestion, YesNoQuestion } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ScoringLogicConfig from '@/components/ScoringLogicConfig';
import ResultInterpretationConfig from '@/components/ResultInterpretationConfig';
import LikertQuestionInput from '@/components/admin/LikertQuestionInput';
import YesNoQuestionInput from '@/components/admin/YesNoQuestionInput';

interface TestForm {
  category_id: number;
  title: string;
  description: string;
  test_type: TestType;
  time_limit_minutes: number;
  questions: Question[];
}

export default function NewTestPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [scoringLogic, setScoringLogic] = useState<Record<string, any>>({});
  const [resultInterpretation, setResultInterpretation] = useState<Record<string, any>>({});
  const [selectedTestType, setSelectedTestType] = useState<TestType>('likert');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TestForm>({
    defaultValues: {
      test_type: 'likert',
      questions: [{ text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchCategories();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll({ per_page: 100 });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const addQuestion = () => {
    append({ text: '' });
  };

  const handleTestTypeChange = (newType: TestType) => {
    setSelectedTestType(newType);
    setValue('test_type', newType);
    
    // Reset questions when changing type
    const newQuestions = fields.map(() => ({ text: '' }));
    setValue('questions', newQuestions);
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

      await testApi.create(processedData);
      toast.success('Test created successfully!');
      router.push('/admin/tests');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create test');
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

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin/tests"
            className="inline-flex items-center text-sm text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад к тестам
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Создать новый тест</h1>
          <p className="mt-2 text-sm text-gray-600">
            Создайте новый тест с выбранным типом вопросов.
          </p>
        </div>

        <div className="bg-white">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Select
                label="Категория"
                options={[
                  { value: '', label: 'Выберите категорию' },
                  ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                ]}
                {...register('category_id', {
                  required: 'Категория обязательна',
                })}
                error={errors.category_id?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Тип теста
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'likert', label: 'Шкала Лайкерта' },
                    { value: 'yes_no', label: 'Да/Нет' }
                  ].map((type) => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="radio"
                        value={type.value}
                        checked={selectedTestType === type.value}
                        onChange={() => handleTestTypeChange(type.value as TestType)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Input
                label="Время (минуты)"
                type="number"
                min="1"
                placeholder="Необязательно"
                {...register('time_limit_minutes', {
                  valueAsNumber: true,
                })}
                error={errors.time_limit_minutes?.message}
              />
            </div>

            <Input
              label="Название теста"
              placeholder="Введите название теста"
              {...register('title', {
                required: 'Название обязательно',
                minLength: {
                  value: 3,
                  message: 'Название должно содержать минимум 3 символа',
                },
                maxLength: {
                  value: 255,
                  message: 'Название должно содержать менее 255 символов',
                },
              })}
              error={errors.title?.message}
            />

            <Textarea
              label="Описание"
              placeholder="Введите описание теста (необязательно)"
              rows={3}
              {...register('description', {
                maxLength: {
                  value: 1000,
                  message: 'Описание должно содержать менее 1000 символов',
                },
              })}
              error={errors.description?.message}
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Вопросы</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить вопрос
                </Button>
              </div>

              <div className="space-y-6">
                {fields.map((field, questionIndex) => (
                  <div key={field.id} className="border border-gray-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        Вопрос {questionIndex + 1}
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
                      {selectedTestType === 'likert' && (
                        <LikertQuestionInput
                          questionIndex={questionIndex}
                          value={field.text || ''}
                          onChange={(value) => setValue(`questions.${questionIndex}.text`, value)}
                          error={errors.questions?.[questionIndex]?.text?.message}
                        />
                      )}

                      {selectedTestType === 'yes_no' && (
                        <YesNoQuestionInput
                          questionIndex={questionIndex}
                          value={field.text || ''}
                          onChange={(value) => setValue(`questions.${questionIndex}.text`, value)}
                          error={errors.questions?.[questionIndex]?.text?.message}
                        />
                      )}

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
                  Отмена
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Создание...' : 'Создать тест'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
