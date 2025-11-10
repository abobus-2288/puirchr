<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * @return HasMany<Test>
     */
    public function tests(): HasMany
    {
        return $this->hasMany(Test::class);
    }
}
