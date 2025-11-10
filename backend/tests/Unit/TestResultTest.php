<?php

namespace Tests\Unit;

use App\Models\TestResult;
use App\Models\Test;
use App\Models\User;
use App\Models\TestAnswer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestResultTest extends TestCase
{
    use RefreshDatabase;

    public function test_test_result_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $testResult = TestResult::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $testResult->user);
        $this->assertEquals($user->id, $testResult->user->id);
    }

    public function test_test_result_belongs_to_test(): void
    {
        $test = Test::factory()->create();
        $testResult = TestResult::factory()->create(['test_id' => $test->id]);

        $this->assertInstanceOf(Test::class, $testResult->test);
        $this->assertEquals($test->id, $testResult->test->id);
    }

    public function test_test_result_has_many_answers(): void
    {
        $testResult = TestResult::factory()->create();
        $answer1 = TestAnswer::factory()->create(['test_result_id' => $testResult->id]);
        $answer2 = TestAnswer::factory()->create(['test_result_id' => $testResult->id]);

        $this->assertCount(2, $testResult->answers);
        $this->assertTrue($testResult->answers->contains($answer1));
        $this->assertTrue($testResult->answers->contains($answer2));
    }

    public function test_test_result_casts_scores_to_array(): void
    {
        $scores = ['total_score' => 15, 'average_score' => 3.0];
        $testResult = TestResult::factory()->create(['scores' => $scores]);

        $this->assertIsArray($testResult->scores);
        $this->assertEquals($scores, $testResult->scores);
    }

    public function test_test_result_casts_interpretation_to_array(): void
    {
        $interpretation = ['overall' => 'Test completed successfully'];
        $testResult = TestResult::factory()->create(['interpretation' => $interpretation]);

        $this->assertIsArray($testResult->interpretation);
        $this->assertEquals($interpretation, $testResult->interpretation);
    }

    public function test_test_result_casts_dates(): void
    {
        $testResult = TestResult::factory()->create([
            'started_at' => now(),
            'completed_at' => now()->addMinutes(10)
        ]);

        $this->assertInstanceOf(\Carbon\Carbon::class, $testResult->started_at);
        $this->assertInstanceOf(\Carbon\Carbon::class, $testResult->completed_at);
    }

    public function test_test_result_fillable_fields(): void
    {
        $fillable = [
            'user_id',
            'test_id',
            'scores',
            'interpretation',
            'started_at',
            'completed_at',
        ];

        $this->assertEquals($fillable, (new TestResult())->getFillable());
    }
}
