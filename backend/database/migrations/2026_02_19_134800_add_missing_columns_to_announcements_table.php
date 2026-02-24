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
        Schema::table('announcements', function (Blueprint $table) {
            // Add 'tag' column if it doesn't exist
            if (!Schema::hasColumn('announcements', 'tag')) {
                $table->string('tag')->nullable()->after('title');
            }
            // Add 'content' column (friendly alias for 'description') if it doesn't exist
            if (!Schema::hasColumn('announcements', 'content')) {
                $table->text('content')->nullable()->after('tag');
            }
            // Add 'date' column (friendly alias for 'event_date') if it doesn't exist
            if (!Schema::hasColumn('announcements', 'date')) {
                $table->date('date')->nullable()->after('content');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn(['tag', 'content', 'date']);
        });
    }
};
