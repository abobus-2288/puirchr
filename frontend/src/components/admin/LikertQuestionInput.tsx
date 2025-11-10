import { Textarea } from '@/components/ui/Textarea';

interface LikertQuestionInputProps {
  questionIndex: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function LikertQuestionInput({ 
  questionIndex, 
  value, 
  onChange, 
  error 
}: LikertQuestionInputProps) {
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
          Этот вопрос будет использовать 5-балльную шкалу Лайкерта:
        </p>
        <ul className="text-xs text-gray-400 mt-2 space-y-1">
          <li>1 - Полностью не согласен</li>
          <li>2 - Не согласен</li>
          <li>3 - Нейтрально/Частично согласен</li>
          <li>4 - Согласен</li>
          <li>5 - Полностью согласен</li>
        </ul>
      </div>
    </div>
  );
}
