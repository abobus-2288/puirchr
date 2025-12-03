import { CheckCircle } from 'lucide-react';

interface YesNoAnswerInputProps {
  questionText: string;
  value?: number;
  onChange: (value: number) => void;
}

export default function YesNoAnswerInput({ 
  questionText, 
  value, 
  onChange 
}: YesNoAnswerInputProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">
        {questionText}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onChange(1)}
          className={`p-6 rounded-lg text-center transition-colors border-2 ${
            value === 1
              ? 'bg-green-600 text-white border-transparent'
              : 'bg-white border-gray-300 text-gray-900 hover:border-green-400 hover:bg-green-50'
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
              value === 1
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              ✓
            </div>
            <span className="font-medium text-lg">Да</span>
            {value === 1 && (
              <CheckCircle className="w-5 h-5 text-white" />
            )}
          </div>
        </button>

        <button
          onClick={() => onChange(0)}
          className={`p-6 rounded-lg text-center transition-colors border-2 ${
            value === 0
              ? 'bg-red-600 text-white border-transparent'
              : 'bg-white border-gray-300 text-gray-900 hover:border-red-400 hover:bg-red-50'
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
              value === 0
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              ✗
            </div>
            <span className="font-medium text-lg">Нет</span>
            {value === 0 && (
              <CheckCircle className="w-5 h-5 text-white" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
