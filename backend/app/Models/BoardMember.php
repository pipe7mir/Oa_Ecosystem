<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoardMember extends Model
{
    protected $fillable = ['name', 'role', 'type', 'description', 'image_url', 'fullscreen_image_url', 'order'];
}
