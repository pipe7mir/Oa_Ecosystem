<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            // Tracks when the auto-email was sent (null = not sent yet / failed)
            $table->timestamp('email_sent_at')->nullable()->after('response');
            // Tracks whether admin opened the WhatsApp link (null = not yet)
            $table->timestamp('wa_link_opened_at')->nullable()->after('email_sent_at');
            // Optional: store error if auto-email fails
            $table->string('email_error', 500)->nullable()->after('wa_link_opened_at');
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn(['email_sent_at', 'wa_link_opened_at', 'email_error']);
        });
    }
};
