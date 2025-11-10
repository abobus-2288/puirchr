<?php

namespace Tests\Feature;

use App\Models\Test;
use App\Models\Category;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TestControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $admin;
    private User $user;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::factory()->create();

        $this->admin = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $this->admin->roles()->attach($adminRole->id);

        $this->user = User::factory()->create();
        $userRole = Role::factory()->create(['name' => 'user']);
        $this->user->roles()->attach($userRole->id);
    }

    public function test_can_list_tests(): void
    {
        Test::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/tests');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id', 'title', 'description', 'test_type', 'category'
                ]
            ]
        ]);
    }

    public function test_can_show_test(): void
    {
        $test = Test::factory()->create();

        $response = $this->getJson("/api/v1/tests/{$test->id}");

        $response->assertStatus(200);
        $response->assertJsonFragment(['id' => $test->id]);
    }

    public function test_can_create_likert_test(): void
    {
        $this->actingAs($this->admin);

        $testData = [
            'category_id' => $this->category->id,
            'title' => 'Test Title',
            'description' => 'Test Description',
            'test_type' => 'likert',
            'time_limit_minutes' => 30,
            'questions' => [
                ['text' => 'Question 1'],
                ['text' => 'Question 2']
            ]
        ];

        $response = $this->postJson('/api/v1/tests', $testData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tests', [
            'title' => 'Test Title',
            'test_type' => 'likert'
        ]);
    }

    public function test_can_create_yes_no_test(): void
    {
        $this->actingAs($this->admin);

        $testData = [
            'category_id' => $this->category->id,
            'title' => 'Yes/No Test',
            'description' => 'Test Description',
            'test_type' => 'yes_no',
            'questions' => [
                ['text' => 'Question 1'],
                ['text' => 'Question 2']
            ]
        ];

        $response = $this->postJson('/api/v1/tests', $testData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tests', [
            'title' => 'Yes/No Test',
            'test_type' => 'yes_no'
        ]);
    }

    public function test_can_create_multiple_choice_test(): void
    {
        $this->actingAs($this->admin);

        $testData = [
            'category_id' => $this->category->id,
            'title' => 'Multiple Choice Test',
            'description' => 'Test Description',
            'test_type' => 'multiple_choice',
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
        ];

        $response = $this->postJson('/api/v1/tests', $testData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tests', [
            'title' => 'Multiple Choice Test',
            'test_type' => 'multiple_choice'
        ]);
    }

    public function test_requires_admin_to_create_test(): void
    {
        $this->actingAs($this->user);

        $testData = [
            'category_id' => $this->category->id,
            'title' => 'Test Title',
            'test_type' => 'likert',
            'questions' => [['text' => 'Question 1']]
        ];

        $response = $this->postJson('/api/v1/tests', $testData);

        $response->assertStatus(403);
    }

    public function test_validates_test_type(): void
    {
        $this->actingAs($this->admin);

        $testData = [
            'category_id' => $this->category->id,
            'title' => 'Test Title',
            'test_type' => 'invalid_type',
            'questions' => [['text' => 'Question 1']]
        ];

        $response = $this->postJson('/api/v1/tests', $testData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['test_type']);
    }

    public function test_validates_multiple_choice_questions_have_options(): void
    {
        $this->actingAs($this->admin);

        $testData = [
            'category_id' => $this->category->id,
            'title' => 'Test Title',
            'test_type' => 'multiple_choice',
            'questions' => [
                ['text' => 'Question 1'] // Missing options
            ]
        ];

        $response = $this->postJson('/api/v1/tests', $testData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['questions.0.options']);
    }

    public function test_can_update_test(): void
    {
        $this->actingAs($this->admin);
        $test = Test::factory()->create(['test_type' => 'likert']);

        $updateData = [
            'title' => 'Updated Title',
            'test_type' => 'yes_no',
            'questions' => [['text' => 'Updated Question']]
        ];

        $response = $this->putJson("/api/v1/tests/{$test->id}", $updateData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tests', [
            'id' => $test->id,
            'title' => 'Updated Title',
            'test_type' => 'yes_no'
        ]);
    }

    public function test_can_delete_test(): void
    {
        $this->actingAs($this->admin);
        $test = Test::factory()->create();

        $response = $this->deleteJson("/api/v1/tests/{$test->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('tests', ['id' => $test->id]);
    }
}
