<?php

namespace Tests\Feature;

use App\Models\Test;
use App\Models\TestResult;
use App\Models\TestAnswer;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TestResultControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;
    private Test $likertTest;
    private Test $yesNoTest;
    private Test $multipleChoiceTest;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $category = Category::factory()->create();

        $this->likertTest = Test::factory()->create([
            'test_type' => 'likert',
            'category_id' => $category->id,
            'questions' => [
                ['text' => 'Question 1'],
                ['text' => 'Question 2']
            ]
        ]);

        $this->yesNoTest = Test::factory()->create([
            'test_type' => 'yes_no',
            'category_id' => $category->id,
            'questions' => [
                ['text' => 'Question 1'],
                ['text' => 'Question 2']
            ]
        ]);

        $this->multipleChoiceTest = Test::factory()->create([
            'test_type' => 'multiple_choice',
            'category_id' => $category->id,
            'questions' => [
                [
                    'text' => 'Question 1',
                    'options' => ['Option A', 'Option B', 'Option C']
                ],
                [
                    'text' => 'Question 2',
                    'options' => ['Option 1', 'Option 2']
                ]
            ]
        ]);
    }

    public function test_can_start_test(): void
    {
        $this->actingAs($this->user);

        $response = $this->postJson("/api/v1/tests/{$this->likertTest->id}/start");

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'test_result' => ['id', 'user_id', 'test_id', 'started_at']
        ]);

        $this->assertDatabaseHas('test_results', [
            'user_id' => $this->user->id,
            'test_id' => $this->likertTest->id
        ]);
    }

    public function test_cannot_start_test_twice(): void
    {
        $this->actingAs($this->user);

        // Start test first time
        $this->postJson("/api/v1/tests/{$this->likertTest->id}/start");

        // Try to start again
        $response = $this->postJson("/api/v1/tests/{$this->likertTest->id}/start");

        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Тест уже начат']);
    }

    public function test_can_submit_likert_answers(): void
    {
        $this->actingAs($this->user);

        $testResult = TestResult::factory()->create([
            'user_id' => $this->user->id,
            'test_id' => $this->likertTest->id,
            'started_at' => now()
        ]);

        $answers = [
            ['question_index' => 0, 'answer_value' => 5],
            ['question_index' => 1, 'answer_value' => 3]
        ];

        $response = $this->postJson("/api/v1/test-results/{$testResult->id}/submit", [
            'answers' => $answers
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Тест успешно завершён']);

        $this->assertDatabaseHas('test_answers', [
            'test_result_id' => $testResult->id,
            'question_index' => 0,
            'answer_value' => 5
        ]);
    }

    public function test_can_submit_yes_no_answers(): void
    {
        $this->actingAs($this->user);

        $testResult = TestResult::factory()->create([
            'user_id' => $this->user->id,
            'test_id' => $this->yesNoTest->id,
            'started_at' => now()
        ]);

        $answers = [
            ['question_index' => 0, 'answer_text' => 'yes'],
            ['question_index' => 1, 'answer_text' => 'no']
        ];

        $response = $this->postJson("/api/v1/test-results/{$testResult->id}/submit", [
            'answers' => $answers
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('test_answers', [
            'test_result_id' => $testResult->id,
            'question_index' => 0,
            'answer_text' => 'yes'
        ]);
    }

    public function test_can_submit_multiple_choice_answers(): void
    {
        $this->actingAs($this->user);

        $testResult = TestResult::factory()->create([
            'user_id' => $this->user->id,
            'test_id' => $this->multipleChoiceTest->id,
            'started_at' => now()
        ]);

        $answers = [
            ['question_index' => 0, 'answer_text' => 'Option A'],
            ['question_index' => 1, 'answer_text' => 'Option 1']
        ];

        $response = $this->postJson("/api/v1/test-results/{$testResult->id}/submit", [
            'answers' => $answers
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('test_answers', [
            'test_result_id' => $testResult->id,
            'question_index' => 0,
            'answer_text' => 'Option A'
        ]);
    }

    public function test_validates_likert_answer_values(): void
    {
        $this->actingAs($this->user);

        $testResult = TestResult::factory()->create([
            'user_id' => $this->user->id,
            'test_id' => $this->likertTest->id,
            'started_at' => now()
        ]);

        $answers = [
            ['question_index' => 0, 'answer_value' => 6] // Invalid: should be 1-5
        ];

        $response = $this->postJson("/api/v1/test-results/{$testResult->id}/submit", [
            'answers' => $answers
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['answers.0.answer_value']);
    }

    public function test_validates_yes_no_answer_values(): void
    {
        $this->actingAs($this->user);

        $testResult = TestResult::factory()->create([
            'user_id' => $this->user->id,
            'test_id' => $this->yesNoTest->id,
            'started_at' => now()
        ]);

        $answers = [
            ['question_index' => 0, 'answer_text' => 'maybe'] // Invalid: should be 'yes' or 'no'
        ];

        $response = $this->postJson("/api/v1/test-results/{$testResult->id}/submit", [
            'answers' => $answers
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['answers.0.answer_text']);
    }

    public function test_cannot_submit_answers_for_other_user(): void
    {
        $otherUser = User::factory()->create();
        $this->actingAs($this->user);

        $testResult = TestResult::factory()->create([
            'user_id' => $otherUser->id,
            'test_id' => $this->likertTest->id,
            'started_at' => now()
        ]);

        $answers = [
            ['question_index' => 0, 'answer_value' => 5]
        ];

        $response = $this->postJson("/api/v1/test-results/{$testResult->id}/submit", [
            'answers' => $answers
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_submit_answers_twice(): void
    {
        $this->actingAs($this->user);

        $testResult = TestResult::factory()->create([
            'user_id' => $this->user->id,
            'test_id' => $this->likertTest->id,
            'started_at' => now(),
            'completed_at' => now()
        ]);

        $answers = [
            ['question_index' => 0, 'answer_value' => 5]
        ];

        $response = $this->postJson("/api/v1/test-results/{$testResult->id}/submit", [
            'answers' => $answers
        ]);

        $response->assertStatus(400);
        $response->assertJsonFragment(['message' => 'Тест уже завершён']);
    }

    public function test_can_get_test_result(): void
    {
        $this->actingAs($this->user);

        $testResult = TestResult::factory()->create([
            'user_id' => $this->user->id,
            'test_id' => $this->likertTest->id
        ]);

        $response = $this->getJson("/api/v1/test-results/{$testResult->id}");

        $response->assertStatus(200);
        $response->assertJsonFragment(['id' => $testResult->id]);
    }

    public function test_can_get_user_results(): void
    {
        $this->actingAs($this->user);

        TestResult::factory()->count(3)->create(['user_id' => $this->user->id]);

        $response = $this->getJson('/api/v1/my-test-results');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'user_id', 'test_id', 'scores', 'interpretation']
            ]
        ]);
    }
}
