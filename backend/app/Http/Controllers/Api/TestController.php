<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $tests = Test::query()
            ->with('category:id,name')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 15));

        return response()->json($tests);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'test_type' => ['required', 'string', 'in:likert,yes_no,multiple_choice'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.text' => ['required', 'string'],
            'questions.*.options' => ['required_if:test_type,multiple_choice', 'array'],
            'questions.*.options.*' => ['required_with:questions.*.options', 'string'],
            'scoring_logic' => ['nullable', 'array'],
            'result_interpretation' => ['nullable', 'array'],
        ]);

        $test = Test::create($validated);

        return response()->json($test->load('category:id,name'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Test $test): JsonResponse
    {
        $test->load('category:id,name');
        return response()->json($test);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Test $test): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'test_type' => ['sometimes', 'required', 'string', 'in:likert,yes_no,multiple_choice'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1'],
            'questions' => ['sometimes', 'required', 'array', 'min:1'],
            'questions.*.text' => ['required_with:questions', 'string'],
            'questions.*.options' => ['required_if:test_type,multiple_choice', 'array'],
            'questions.*.options.*' => ['required_with:questions.*.options', 'string'],
            'scoring_logic' => ['nullable', 'array'],
            'result_interpretation' => ['nullable', 'array'],
        ]);

        $test->update($validated);

        return response()->json($test->load('category:id,name'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Test $test): JsonResponse
    {
        $test->delete();
        return response()->json(status: 204);
    }
}
