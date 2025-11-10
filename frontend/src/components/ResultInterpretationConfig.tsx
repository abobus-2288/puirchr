'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Plus, Trash2, Info } from 'lucide-react';

interface InterpretationRange {
  min: number;
  max: number;
  interpretation: string;
}

interface CategoryInterpretation {
  categoryName: string;
  ranges: InterpretationRange[];
}

interface ResultInterpretationConfigProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  scoringCategories: string[];
  error?: string;
}

export default function ResultInterpretationConfig({ 
  value, 
  onChange, 
  scoringCategories, 
  error 
}: ResultInterpretationConfigProps) {
  const [categories, setCategories] = useState<CategoryInterpretation[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      const parsedCategories = Object.entries(value).map(([categoryName, ranges]) => ({
        categoryName,
        ranges: Array.isArray(ranges) ? ranges : [],
      }));
      setCategories(parsedCategories);
    }
  }, [value]);

  const addCategory = () => {
    const newCategory: CategoryInterpretation = {
      categoryName: scoringCategories.length > 0 ? scoringCategories[0] : 'Overall',
      ranges: [
        { min: 0, max: 50, interpretation: 'Low score' },
        { min: 51, max: 100, interpretation: 'High score' },
      ],
    };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    updateInterpretation(updatedCategories);
  };

  const removeCategory = (index: number) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    updateInterpretation(updatedCategories);
  };

  const updateCategory = (index: number, field: keyof CategoryInterpretation, newValue: any) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: newValue };
    setCategories(updatedCategories);
    updateInterpretation(updatedCategories);
  };

  const addRange = (categoryIndex: number) => {
    const category = categories[categoryIndex];
    const newRange: InterpretationRange = {
      min: 0,
      max: 100,
      interpretation: 'New interpretation',
    };
    const updatedRanges = [...category.ranges, newRange];
    updateCategory(categoryIndex, 'ranges', updatedRanges);
  };

  const removeRange = (categoryIndex: number, rangeIndex: number) => {
    const category = categories[categoryIndex];
    const updatedRanges = category.ranges.filter((_, i) => i !== rangeIndex);
    updateCategory(categoryIndex, 'ranges', updatedRanges);
  };

  const updateRange = (categoryIndex: number, rangeIndex: number, field: keyof InterpretationRange, newValue: any) => {
    const category = categories[categoryIndex];
    const updatedRanges = [...category.ranges];
    updatedRanges[rangeIndex] = { ...updatedRanges[rangeIndex], [field]: newValue };
    updateCategory(categoryIndex, 'ranges', updatedRanges);
  };

  const updateInterpretation = (categories: CategoryInterpretation[]) => {
    const interpretation: Record<string, any> = {};
    categories.forEach(category => {
      if (category.categoryName.trim() && category.ranges.length > 0) {
        interpretation[category.categoryName] = category.ranges;
      }
    });
    onChange(interpretation);
  };

  const validateRanges = (ranges: InterpretationRange[]) => {
    const sortedRanges = [...ranges].sort((a, b) => a.min - b.min);
    const issues = [];
    
    for (let i = 0; i < sortedRanges.length; i++) {
      const current = sortedRanges[i];
      const next = sortedRanges[i + 1];
      
      if (current.min > current.max) {
        issues.push(`Range ${i + 1}: Min (${current.min}%) cannot be greater than Max (${current.max}%)`);
      }
      
      if (next && current.max >= next.min) {
        issues.push(`Ranges ${i + 1} and ${i + 2}: Overlapping ranges (${current.min}-${current.max}% and ${next.min}-${next.max}%)`);
      }
    }
    
    const totalCoverage = sortedRanges.reduce((acc, range) => acc + (range.max - range.min + 1), 0);
    const hasGaps = totalCoverage < 101;
    
    return {
      issues,
      hasGaps,
      totalCoverage,
    };
  };

  const getAvailableCategories = () => {
    const usedCategories = categories.map(cat => cat.categoryName);
    return ['Overall', ...scoringCategories].filter(cat => !usedCategories.includes(cat));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Настройка интерпретации результатов</h3>
          <p className="text-sm text-gray-300">
            Определите диапазоны интерпретации для различных категорий оценок. Оставьте пустым для базовой интерпретации.
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
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="font-medium text-green-300 mb-2">Как работает интерпретация результатов:</h4>
          <ul className="text-sm text-green-200 space-y-1">
            <li>• <strong>Категории:</strong> Соответствуйте вашим категориям оценки или используйте "Общий" для общих оценок</li>
            <li>• <strong>Диапазоны:</strong> Определите минимальные/максимальные процентные диапазоны для каждой интерпретации</li>
            <li>• <strong>Интерпретации:</strong> Предоставьте осмысленные описания для каждого диапазона оценок</li>
            <li>• <strong>Покрытие:</strong> Убедитесь, что диапазоны покрывают 0-100% без пробелов или перекрытий</li>
          </ul>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
          <p className="text-gray-400 mb-4">Категории интерпретации не определены</p>
          <p className="text-sm text-gray-500 mb-4">
            Базовая интерпретация будет предоставлена автоматически
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={addCategory}
            className="flex items-center mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить категорию интерпретации
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 mr-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Категория
                  </label>
                  <select
                    value={category.categoryName}
                    onChange={(e) => updateCategory(categoryIndex, 'categoryName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getAvailableCategories().map(cat => (
                      <option key={cat} value={cat}>{cat === 'Overall' ? 'Общий' : cat}</option>
                    ))}
                    <option value={category.categoryName}>{category.categoryName === 'Overall' ? 'Общий' : category.categoryName}</option>
                  </select>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeCategory(categoryIndex)}
                  className="mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Диапазоны интерпретации
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addRange(categoryIndex)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить диапазон
                  </Button>
                </div>

                <div className="space-y-3">
                  {category.ranges.map((range, rangeIndex) => {
                    const validation = validateRanges(category.ranges);
                    return (
                      <div key={rangeIndex} className="bg-gray-600 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Мин %</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={range.min}
                              onChange={(e) => updateRange(categoryIndex, rangeIndex, 'min', parseInt(e.target.value) || 0)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Макс %</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={range.max}
                              onChange={(e) => updateRange(categoryIndex, rangeIndex, 'max', parseInt(e.target.value) || 100)}
                              className="text-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">Интерпретация</label>
                            <div className="flex">
                              <Textarea
                                value={range.interpretation}
                                onChange={(e) => updateRange(categoryIndex, rangeIndex, 'interpretation', e.target.value)}
                                rows={1}
                                className="flex-1 text-sm"
                                placeholder="Опишите, что означает этот диапазон оценок..."
                              />
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => removeRange(categoryIndex, rangeIndex)}
                                className="ml-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {validation.issues.length > 0 && (
                          <div className="mt-2 bg-red-900/20 border border-red-500/30 rounded p-2">
                            {validation.issues.map((issue, idx) => (
                              <p key={idx} className="text-xs text-red-300">{issue}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {category.ranges.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-2">
                    ⚠️ В этой категории нет диапазонов интерпретации
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

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
