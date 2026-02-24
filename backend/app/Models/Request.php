<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Request extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'is_anonymous',
        'category',
        'description',
        'status',
        'response',
        'email_sent_at',
        'wa_link_opened_at',
        'email_error',
    ];

    protected $casts = [
        'is_anonymous'     => 'boolean',
        'email_sent_at'    => 'datetime',
        'wa_link_opened_at'=> 'datetime',
    ];
}
