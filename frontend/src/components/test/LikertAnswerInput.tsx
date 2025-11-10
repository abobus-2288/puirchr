import { CheckCircle } from 'lucide-react';

const LIKERT_OPTIONS = [
  { value: 1, label: 'Полностью не согласен', color: 'bg-red-600 hover:bg-red-700' },
  { value: 2, label: 'Не согласен', color: 'bg-orange-500 hover:bg-orange-600' },
  { value: 3, label: 'Нейтрально', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { value: 4, label: 'Согласен', color: 'bg-green-500 hover:bg-green-600' },
  { value: 5, label: 'Полностью согласен', color: 'bg-green-600 hover:bg-green-700' },
];

interface LikertAnswerInputProps {
  questionText: string;
  value?: number;
  onChange: (value: number) => void;
}

export default function LikertAnswerInput({ 
  questionText, 
  value, 
  onChange 
}: LikertAnswerInputProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">
        {questionText}
      </h2>

      <div className="space-y-3">
        {LIKERT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`w-full p-4 rounded-lg text-left transition-colors ${
              value === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  value === option.value
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-600 text-gray-400'
                }`}>
                  {option.value}
                </div>
                <span className="font-medium">{option.label}</span>
              </div>
              {value === option.value && (
                <CheckCircle className="w-5 h-5 text-white" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
