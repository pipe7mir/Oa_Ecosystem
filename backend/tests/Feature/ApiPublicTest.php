<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiPublicTest extends TestCase
{
    use RefreshDatabase;

    public function test_announcements_index_returns_ok()
    {
        $this->getJson('/api/announcements')
            ->assertStatus(200);
    }
}
