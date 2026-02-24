<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('live_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_live')->default(false);
            $table->string('youtube_video_id')->nullable();
            $table->string('youtube_playlist_id')->nullable();
            $table->string('youtube_channel_id')->nullable();
            $table->string('bg_image')->nullable();
            $table->float('overlay_opacity')->default(0.5);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('live_settings');
    }
};
