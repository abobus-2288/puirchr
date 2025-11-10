import { Textarea } from '@/components/ui/Textarea';

interface YesNoQuestionInputProps {
  questionIndex: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function YesNoQuestionInput({ 
  questionIndex, 
  value, 
  onChange, 
  error 
}: YesNoQuestionInputProps) {
  return (
    <div className="space-y-4">
      <Textarea
        label="Текст вопроса"
        placeholder="Введите вопрос"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />

      <div className="bg-gray-700 p-3 rounded-lg">
        <p className="text-sm text-gray-300">
          Этот вопрос будет использовать простые ответы Да/Нет:
        </p>
        <ul className="text-xs text-gray-400 mt-2 space-y-1">
          <li>Да - Положительный ответ</li>
          <li>Нет - Отрицательный ответ</li>
        </ul>
      </div>
    </div>
  );
}
