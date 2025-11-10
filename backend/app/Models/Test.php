<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Test extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'description',
        'test_type',
        'questions',
        'time_limit_minutes',
        'scoring_logic',
        'result_interpretation',
    ];

    protected $casts = [
        'questions' => 'array',
        'scoring_logic' => 'array',
        'result_interpretation' => 'array',
    ];

    const TEST_TYPES = [
        'likert' => 'likert',
        'yes_no' => 'yes_no',
        'multiple_choice' => 'multiple_choice',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(TestResult::class);
    }
}
