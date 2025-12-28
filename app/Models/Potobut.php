<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Potobut extends Model
{
    /**
     * Explicit table name to match migration 'photos'
     *
     * @var string
     */
    protected $table = 'photos';

    protected $fillable = ['user_id', 'path'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
