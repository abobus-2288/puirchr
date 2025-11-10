<?php

namespace Tests\Unit;

use App\Models\TestAnswer;
use App\Models\TestResult;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestAnswerTest extends TestCase
{
    use RefreshDatabase;

    public function test_test_answer_belongs_to_test_result(): void
    {
        $testResult = TestResult::factory()->create();
        $testAnswer = TestAnswer::factory()->create(['test_result_id' => $testResult->id]);

        $this->assertInstanceOf(TestResult::class, $testAnswer->testResult);
        $this->assertEquals($testResult->id, $testAnswer->testResult->id);
    }

    public function test_test_answer_fillable_fields(): void
    {
        $fillable = [
            'test_result_id',
            'question_index',
            'answer_value',
            'answer_text',
        ];

        $this->assertEquals($fillable, (new TestAnswer())->getFillable());
    }

    public function test_test_answer_can_store_likert_value(): void
    {
        $testAnswer = TestAnswer::factory()->create([
            'answer_value' => 5,
            'answer_text' => null
        ]);

        $this->assertEquals(5, $testAnswer->answer_value);
        $this->assertNull($testAnswer->answer_text);
    }

    public function test_test_answer_can_store_text_value(): void
    {
        $testAnswer = TestAnswer::factory()->create([
            'answer_value' => null,
            'answer_text' => 'yes'
        ]);

        $this->assertNull($testAnswer->answer_value);
        $this->assertEquals('yes', $testAnswer->answer_text);
    }

    public function test_test_answer_can_store_multiple_choice_value(): void
    {
        $testAnswer = TestAnswer::factory()->create([
            'answer_value' => null,
            'answer_text' => 'Option A'
        ]);

        $this->assertNull($testAnswer->answer_value);
        $this->assertEquals('Option A', $testAnswer->answer_text);
    }
}
