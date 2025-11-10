<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TestAnswer extends Model
{
    protected $fillable = [
        'test_result_id',
        'question_index',
        'answer_value',
        'answer_text',
    ];

    public function testResult(): BelongsTo
    {
        return $this->belongsTo(TestResult::class);
    }
}
