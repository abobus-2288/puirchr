<?php

namespace Tests\Unit;

use App\Models\Test;
use App\Models\Category;
use App\Models\TestResult;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestTest extends TestCase
{
    use RefreshDatabase;

    public function test_test_belongs_to_category(): void
    {
        $category = Category::factory()->create();
        $test = Test::factory()->create(['category_id' => $category->id]);

        $this->assertInstanceOf(Category::class, $test->category);
        $this->assertEquals($category->id, $test->category->id);
    }

    public function test_test_has_many_results(): void
    {
        $test = Test::factory()->create();
        $result1 = TestResult::factory()->create(['test_id' => $test->id]);
        $result2 = TestResult::factory()->create(['test_id' => $test->id]);

        $this->assertCount(2, $test->results);
        $this->assertTrue($test->results->contains($result1));
        $this->assertTrue($test->results->contains($result2));
    }

    public function test_test_type_constants(): void
    {
        $this->assertEquals('likert', Test::TEST_TYPES['likert']);
        $this->assertEquals('yes_no', Test::TEST_TYPES['yes_no']);
        $this->assertEquals('multiple_choice', Test::TEST_TYPES['multiple_choice']);
    }

    public function test_test_casts_questions_to_array(): void
    {
        $test = Test::factory()->create([
            'questions' => [['text' => 'Question 1'], ['text' => 'Question 2']]
        ]);

        $this->assertIsArray($test->questions);
        $this->assertCount(2, $test->questions);
    }

    public function test_test_casts_scoring_logic_to_array(): void
    {
        $scoringLogic = ['category1' => ['questions' => [0, 1]]];
        $test = Test::factory()->create(['scoring_logic' => $scoringLogic]);

        $this->assertIsArray($test->scoring_logic);
        $this->assertEquals($scoringLogic, $test->scoring_logic);
    }

    public function test_test_casts_result_interpretation_to_array(): void
    {
        $interpretation = ['category1' => [['min' => 0, 'max' => 50, 'interpretation' => 'Low']]];
        $test = Test::factory()->create(['result_interpretation' => $interpretation]);

        $this->assertIsArray($test->result_interpretation);
        $this->assertEquals($interpretation, $test->result_interpretation);
    }

    public function test_test_fillable_fields(): void
    {
        $fillable = [
            'category_id',
            'title',
            'description',
            'test_type',
            'questions',
            'time_limit_minutes',
            'scoring_logic',
            'result_interpretation',
        ];

        $this->assertEquals($fillable, (new Test())->getFillable());
    }
}
