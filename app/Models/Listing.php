<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    use HasFactory;

    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    public function type()
    {
        return $this->belongsTo(Type::class);
    }
}
