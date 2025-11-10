<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\TestResult;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_many_test_results(): void
    {
        $user = User::factory()->create();
        $result1 = TestResult::factory()->create(['user_id' => $user->id]);
        $result2 = TestResult::factory()->create(['user_id' => $user->id]);

        $this->assertCount(2, $user->testResults);
        $this->assertTrue($user->testResults->contains($result1));
        $this->assertTrue($user->testResults->contains($result2));
    }

    public function test_user_belongs_to_many_roles(): void
    {
        $user = User::factory()->create();
        $role1 = Role::factory()->create(['name' => 'admin']);
        $role2 = Role::factory()->create(['name' => 'user']);

        $user->roles()->attach([$role1->id, $role2->id]);

        $this->assertCount(2, $user->roles);
        $this->assertTrue($user->roles->contains($role1));
        $this->assertTrue($user->roles->contains($role2));
    }

    public function test_user_can_have_admin_role(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $user->roles()->attach($adminRole->id);

        $this->assertTrue($user->hasRole('admin'));
    }

    public function test_user_can_have_multiple_roles(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $userRole = Role::factory()->create(['name' => 'user']);

        $user->roles()->attach([$adminRole->id, $userRole->id]);

        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->hasRole('user'));
    }

    public function test_user_fillable_fields(): void
    {
        $fillable = [
            'name',
            'email',
            'password',
        ];

        $this->assertEquals($fillable, (new User())->getFillable());
    }

    public function test_user_password_is_hidden(): void
    {
        $user = User::factory()->create();

        $this->assertArrayNotHasKey('password', $user->toArray());
    }
}
