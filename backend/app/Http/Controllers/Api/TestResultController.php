<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\TestResult;
use App\Models\TestAnswer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TestResultController extends Controller
{
    public function startTest(Request $request, Test $test): JsonResponse
    {
        $user = Auth::user();

        $existingResult = TestResult::where('user_id', $user->id)
            ->where('test_id', $test->id)
            ->whereNull('completed_at')
            ->first();

        if ($existingResult) {
            return response()->json([
                'test_result' => $existingResult->load('test'),
                'message' => 'Тест уже начат'
            ]);
        }

        $testResult = TestResult::create([
            'user_id' => $user->id,
            'test_id' => $test->id,
            'started_at' => now(),
        ]);

        return response()->json([
            'test_result' => $testResult->load('test'),
            'message' => 'Тест успешно начат'
        ], 201);
    }

    public function submitAnswers(Request $request, TestResult $testResult): JsonResponse
    {
        $user = Auth::user();

        if ($testResult->user_id !== $user->id) {
            return response()->json(['message' => 'Не авторизован'], 403);
        }

        if ($testResult->completed_at) {
            return response()->json(['message' => 'Тест уже завершён'], 400);
        }

        $test = $testResult->test;
        $validationRules = [
            'answers' => ['required', 'array'],
            'answers.*.question_index' => ['required', 'integer', 'min:0'],
        ];

        if ($test->test_type === 'likert') {
            $validationRules['answers.*.answer_value'] = ['required', 'integer', 'min:1', 'max:5'];
        } elseif ($test->test_type === 'yes_no') {
            $validationRules['answers.*.answer_value'] = ['required', 'integer', 'in:0,1'];
        }

        $validated = $request->validate($validationRules);

        DB::transaction(function () use ($testResult, $validated) {
            TestAnswer::where('test_result_id', $testResult->id)->delete();

            foreach ($validated['answers'] as $answer) {
                TestAnswer::create([
                    'test_result_id' => $testResult->id,
                    'question_index' => $answer['question_index'],
                    'answer_value' => $answer['answer_value'],
                ]);
            }

            $scores = $this->calculateScores($testResult);
            $interpretation = $this->generateInterpretation($testResult->test, $scores);

            $testResult->update([
                'scores' => $scores,
                'interpretation' => $interpretation,
                'completed_at' => now(),
            ]);
        });

        return response()->json([
            'test_result' => $testResult->fresh(['test', 'answers']),
            'message' => 'Тест успешно завершён'
        ]);
    }

    public function getResult(TestResult $testResult): JsonResponse
    {
        $user = Auth::user();

        if ($testResult->user_id !== $user->id) {
            return response()->json(['message' => 'Не авторизован'], 403);
        }

        return response()->json($testResult->load(['test', 'answers']));
    }

    public function getUserResults(Request $request): JsonResponse
    {
        $user = Auth::user();

        $results = TestResult::where('user_id', $user->id)
            ->with(['test:id,title,category_id', 'test.category:id,name'])
            ->orderByDesc('completed_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json($results);
    }

    private function calculateScores(TestResult $testResult): array
    {
        $test = $testResult->test;
        $answers = $testResult->answers;
        $scoringLogic = $test->scoring_logic ?? [];

        if ($test->test_type === 'likert') {
            return $this->calculateLikertScores($answers, $scoringLogic);
        } elseif ($test->test_type === 'yes_no') {
            return $this->calculateYesNoScores($answers, $scoringLogic);
        }

        return [];
    }

    private function calculateLikertScores($answers, $scoringLogic): array
    {
        if (empty($scoringLogic)) {
            $totalScore = $answers->sum('answer_value');
            $averageScore = $answers->avg('answer_value');

            return [
                'total_score' => $totalScore,
                'average_score' => round($averageScore, 2),
                'max_possible_score' => $answers->count() * 5,
                'percentage' => round(($totalScore / ($answers->count() * 5)) * 100, 2),
            ];
        }

        $scores = [];
        foreach ($scoringLogic as $category => $config) {
            $categoryQuestions = $config['questions'] ?? [];
            $categoryAnswers = $answers->whereIn('question_index', $categoryQuestions);
            $categoryScore = $categoryAnswers->sum('answer_value');
            $maxCategoryScore = count($categoryQuestions) * 5;

            $scores[$category] = [
                'score' => $categoryScore,
                'max_score' => $maxCategoryScore,
                'percentage' => $maxCategoryScore > 0 ? round(($categoryScore / $maxCategoryScore) * 100, 2) : 0,
            ];
        }

        return $scores;
    }

    private function calculateYesNoScores($answers, $scoringLogic): array
    {
        $yesCount = $answers->where('answer_value', 1)->count();
        $totalCount = $answers->count();
        $yesPercentage = $totalCount > 0 ? round(($yesCount / $totalCount) * 100, 2) : 0;

        if (empty($scoringLogic)) {
            return [
                'yes_count' => $yesCount,
                'no_count' => $totalCount - $yesCount,
                'total_questions' => $totalCount,
                'yes_percentage' => $yesPercentage,
            ];
        }

        $scores = [];
        foreach ($scoringLogic as $category => $config) {
            $categoryQuestions = $config['questions'] ?? [];
            $categoryAnswers = $answers->whereIn('question_index', $categoryQuestions);
            $categoryYesCount = $categoryAnswers->where('answer_text', 'yes')->count();
            $categoryTotal = $categoryAnswers->count();

            $scores[$category] = [
                'yes_count' => $categoryYesCount,
                'no_count' => $categoryTotal - $categoryYesCount,
                'total_questions' => $categoryTotal,
                'yes_percentage' => $categoryTotal > 0 ? round(($categoryYesCount / $categoryTotal) * 100, 2) : 0,
            ];
        }

        return $scores;
    }


    private function generateInterpretation(Test $test, array $scores): array
    {
        $interpretation = $test->result_interpretation ?? [];

        if (empty($interpretation)) {
        return [
            'overall' => 'Тест завершён. Пожалуйста, обратитесь к специалисту для подробной интерпретации.',
        ];
        }

        $result = [];

        foreach ($interpretation as $category => $ranges) {
            $categoryScore = $scores[$category]['percentage'] ?? $scores['percentage'] ?? 0;

            foreach ($ranges as $range) {
                if ($categoryScore >= $range['min'] && $categoryScore <= $range['max']) {
                    $result[$category] = $range['interpretation'];
                    break;
                }
            }
        }

        return $result;
    }
}
