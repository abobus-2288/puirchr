<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Test;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_has_many_tests(): void
    {
        $category = Category::factory()->create();
        $test1 = Test::factory()->create(['category_id' => $category->id]);
        $test2 = Test::factory()->create(['category_id' => $category->id]);

        $this->assertCount(2, $category->tests);
        $this->assertTrue($category->tests->contains($test1));
        $this->assertTrue($category->tests->contains($test2));
    }

    public function test_category_fillable_fields(): void
    {
        $fillable = [
            'name',
            'description',
        ];

        $this->assertEquals($fillable, (new Category())->getFillable());
    }

    public function test_category_can_be_created_with_name(): void
    {
        $category = Category::factory()->create(['name' => 'Psychology']);

        $this->assertEquals('Psychology', $category->name);
    }

    public function test_category_can_have_description(): void
    {
        $category = Category::factory()->create([
            'name' => 'Psychology',
            'description' => 'Psychological assessment tests'
        ]);

        $this->assertEquals('Psychology', $category->name);
        $this->assertEquals('Psychological assessment tests', $category->description);
    }
}
