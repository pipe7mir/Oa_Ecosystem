<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiveSetting extends Model
{
    protected $fillable = [
        'is_live', 
        'youtube_video_id', 
        'youtube_playlist_id', 
        'youtube_channel_id', 
        'bg_image', 
        'overlay_opacity'
    ];
}
