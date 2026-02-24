<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'content',
        'description', // legacy alias
        'tag',
        'date',
        'event_date',  // legacy alias
        'image_url',
        'location',
    ];
}
