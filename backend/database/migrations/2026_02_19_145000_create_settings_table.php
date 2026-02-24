<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Seed default values
        DB::table('settings')->insert([
            ['key' => 'notify_email',    'value' => '',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'whatsapp_number', 'value' => '',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'whatsapp_group_link', 'value' => '', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'church_name',     'value' => 'Iglesia Adventista Oasis', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
