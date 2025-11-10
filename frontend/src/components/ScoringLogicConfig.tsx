'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Info } from 'lucide-react';

interface ScoringCategory {
  name: string;
  questions: number[];
  weight: number;
}

interface ScoringLogicConfigProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  totalQuestions: number;
  error?: string;
}

export default function ScoringLogicConfig({ value, onChange, totalQuestions, error }: ScoringLogicConfigProps) {
  const [categories, setCategories] = useState<ScoringCategory[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      const parsedCategories = Object.entries(value).map(([name, config]) => ({
        name,
        questions: config.questions || [],
        weight: config.weight || 1,
      }));
      setCategories(parsedCategories);
    }
  }, [value]);

  const addCategory = () => {
    const newCategory: ScoringCategory = {
      name: `Category ${categories.length + 1}`,
      questions: [],
      weight: 1,
    };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    updateScoringLogic(updatedCategories);
  };

  const removeCategory = (index: number) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    updateScoringLogic(updatedCategories);
  };

  const updateCategory = (index: number, field: keyof ScoringCategory, newValue: any) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: newValue };
    setCategories(updatedCategories);
    updateScoringLogic(updatedCategories);
  };

  const updateScoringLogic = (categories: ScoringCategory[]) => {
    const scoringLogic: Record<string, any> = {};
    categories.forEach(category => {
      if (category.name.trim()) {
        scoringLogic[category.name] = {
          questions: category.questions,
          weight: category.weight,
        };
      }
    });
    onChange(scoringLogic);
  };

  const validateConfiguration = () => {
    const allUsedQuestions = categories.flatMap(cat => cat.questions);
    const duplicateQuestions = allUsedQuestions.filter((q, index) => allUsedQuestions.indexOf(q) !== index);
    const missingQuestions = Array.from({ length: totalQuestions }, (_, i) => i).filter(q => !allUsedQuestions.includes(q));
    
    return {
      hasDuplicates: duplicateQuestions.length > 0,
      hasMissing: missingQuestions.length > 0,
      duplicateQuestions,
      missingQuestions,
    };
  };

  const validation = validateConfiguration();

  const getAvailableQuestions = (currentCategoryIndex: number) => {
    const usedQuestions = categories
      .filter((_, index) => index !== currentCategoryIndex)
      .flatMap(cat => cat.questions);
    
    return Array.from({ length: totalQuestions }, (_, i) => i)
      .filter(q => !usedQuestions.includes(q));
  };

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const category = categories[categoryIndex];
    const isSelected = category.questions.includes(questionIndex);
    
    if (isSelected) {
      updateCategory(categoryIndex, 'questions', category.questions.filter(q => q !== questionIndex));
    } else {
      updateCategory(categoryIndex, 'questions', [...category.questions, questionIndex].sort());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Настройка логики оценки</h3>
          <p className="text-sm text-gray-300">
            Определите, как вопросы должны быть сгруппированы и оценены. Оставьте пустым для простой общей оценки.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center"
        >
          <Info className="h-4 w-4 mr-2" />
          {showAdvanced ? 'Скрыть' : 'Показать'} справку
        </Button>
      </div>

      {showAdvanced && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-medium text-blue-300 mb-2">Как работает логика оценки:</h4>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• <strong>Категории:</strong> Группируйте связанные вопросы вместе</li>
            <li>• <strong>Вопросы:</strong> Выберите, какие номера вопросов принадлежат каждой категории</li>
            <li>• <strong>Вес:</strong> Умножьте оценки категорий на этот коэффициент (по умолчанию: 1.0)</li>
            <li>• <strong>Пусто:</strong> Если категории не определены, все вопросы оцениваются вместе</li>
          </ul>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
          <p className="text-gray-400 mb-4">Категории оценки не определены</p>
          <p className="text-sm text-gray-500 mb-4">
            Все вопросы будут оценены вместе как единая сумма
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={addCategory}
            className="flex items-center mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить категорию оценки
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <Input
                  value={category.name}
                  onChange={(e) => updateCategory(categoryIndex, 'name', e.target.value)}
                  placeholder="Название категории"
                  className="flex-1 mr-4"
                />
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-300">Вес:</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={category.weight}
                    onChange={(e) => updateCategory(categoryIndex, 'weight', parseFloat(e.target.value) || 1)}
                    className="w-20"
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeCategory(categoryIndex)}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Вопросы ({category.questions.length} выбрано)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: totalQuestions }, (_, questionIndex) => {
                    const isSelected = category.questions.includes(questionIndex);
                    const isAvailable = getAvailableQuestions(categoryIndex).includes(questionIndex);
                    
                    return (
                      <button
                        key={questionIndex}
                        type="button"
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        disabled={!isAvailable && !isSelected}
                        className={`
                          p-2 rounded text-sm font-medium transition-colors
                          ${isSelected 
                            ? 'bg-blue-600 text-white' 
                            : isAvailable 
                              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          }
                        `}
                      >
                        {questionIndex + 1}
                      </button>
                    );
                  })}
                </div>
                {category.questions.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-2">
                    ⚠️ В этой категории не выбрано ни одного вопроса
                  </p>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addCategory}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить ещё категорию
          </Button>
        </div>
      )}

      {categories.length > 0 && (
        <div className="space-y-2">
          {validation.hasDuplicates && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-300">
                ⚠️ <strong>Дублирующиеся вопросы:</strong> Вопросы {validation.duplicateQuestions.map(q => q + 1).join(', ')} назначены нескольким категориям.
              </p>
            </div>
          )}
          
          {validation.hasMissing && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-300">
                ℹ️ <strong>Неназначенные вопросы:</strong> Вопросы {validation.missingQuestions.map(q => q + 1).join(', ')} не назначены ни одной категории и будут оценены отдельно.
              </p>
            </div>
          )}
          
          {!validation.hasDuplicates && !validation.hasMissing && categories.length > 0 && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-sm text-green-300">
                ✅ <strong>Конфигурация корректна:</strong> Все вопросы правильно назначены категориям.
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
