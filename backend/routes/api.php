<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Public routes
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout',   [AuthController::class, 'logout']);

// Public Announcements
Route::get('/announcements', [\App\Http\Controllers\AnnouncementController::class, 'index']);

// Public Management Data
Route::get('/board-members', [\App\Http\Controllers\ManagementController::class, 'indexBoardMembers']);
Route::get('/gallery-items',  [\App\Http\Controllers\ManagementController::class, 'indexGalleryItems']);
Route::get('/billboards',     [\App\Http\Controllers\BillboardController::class, 'index']);

// Public Requests & Forms Submission
Route::post('/requests', [\App\Http\Controllers\RequestController::class, 'store']);
Route::post('/event-submissions', [\App\Http\Controllers\FormSubmissionController::class, 'store']);
Route::get('/event-forms',       [\App\Http\Controllers\EventFormController::class, 'index']);
Route::get('/event-forms/{id}',  [\App\Http\Controllers\EventFormController::class, 'show']);

// Public Resources (Read-only)
Route::get('/resources', [\App\Http\Controllers\ResourceController::class, 'index']);

// ── WhatsApp Webhook (público — Evolution API no envía auth header) ──────────
Route::post('/whatsapp/webhook', [\App\Http\Controllers\WhatsAppController::class, 'webhook']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ── Announcements (Admin) ────────────────────────────────
    Route::post('/announcements',        [\App\Http\Controllers\AnnouncementController::class, 'store']);
    Route::post('/announcements/{id}',   [\App\Http\Controllers\AnnouncementController::class, 'update']);
    Route::put('/announcements/{id}',    [\App\Http\Controllers\AnnouncementController::class, 'update']);
    Route::delete('/announcements/{id}', [\App\Http\Controllers\AnnouncementController::class, 'destroy']);

    // ── Admin Users ──────────────────────────────────────────
    Route::get('/users',               [\App\Http\Controllers\AdminUserController::class, 'index']);
    Route::post('/users',              [\App\Http\Controllers\AdminUserController::class, 'store']);
    Route::put('/users/{id}',          [\App\Http\Controllers\AdminUserController::class, 'update']);
    Route::patch('/users/{id}/approve',[\App\Http\Controllers\AdminUserController::class, 'approve']);
    Route::patch('/users/{id}/role',   [\App\Http\Controllers\AdminUserController::class, 'updateRole']);
    Route::delete('/users/{id}',       [\App\Http\Controllers\AdminUserController::class, 'destroy']);

    // ── Solicitudes (Admin) ──────────────────────────────────
    Route::get('/requests',                    [\App\Http\Controllers\RequestController::class, 'index']);
    Route::patch('/requests/{id}/status',      [\App\Http\Controllers\RequestController::class, 'updateStatus']);
    Route::patch('/requests/{id}/approve',     [\App\Http\Controllers\RequestController::class, 'approve']);
    Route::patch('/requests/{id}/reject',      [\App\Http\Controllers\RequestController::class, 'reject']);
    Route::post('/requests/{id}/send-email',   [\App\Http\Controllers\RequestController::class, 'sendEmail']);
    Route::get('/requests/{id}/whatsapp-link', [\App\Http\Controllers\RequestController::class, 'getWhatsappLink']);

    // ── Live Settings ────────────────────────────────────────
    Route::get('/live/settings',        [\App\Http\Controllers\LiveController::class, 'index']);
    Route::post('/live/settings',       [\App\Http\Controllers\LiveController::class, 'update']);

    // ── Settings (Admin) ─────────────────────────────────────
    Route::get('/settings',             [\App\Http\Controllers\SettingsController::class, 'index']);
    Route::post('/settings',            [\App\Http\Controllers\SettingsController::class, 'update']);
    Route::post('/upload',              [\App\Http\Controllers\SettingsController::class, 'upload']);
    Route::post('/settings/test-email', [\App\Http\Controllers\SettingsController::class, 'testEmail']);

    // ── Resources (Admin) ────────────────────────────────────
    Route::post('/resources',        [\App\Http\Controllers\ResourceController::class, 'store']);
    Route::put('/resources/{id}',    [\App\Http\Controllers\ResourceController::class, 'update']);
    Route::delete('/resources/{id}', [\App\Http\Controllers\ResourceController::class, 'destroy']);

    // ── WhatsApp / Evolution API (Admin) ─────────────────────
    Route::prefix('whatsapp')->group(function () {
        Route::get('/status',             [\App\Http\Controllers\WhatsAppController::class, 'status']);
        Route::post('/create-instance',   [\App\Http\Controllers\WhatsAppController::class, 'createInstance']);
        Route::get('/qr',                 [\App\Http\Controllers\WhatsAppController::class, 'getQr']);
        Route::post('/logout',            [\App\Http\Controllers\WhatsAppController::class, 'logout']);
        Route::post('/reset-kill-switch', [\App\Http\Controllers\WhatsAppController::class, 'resetKillSwitch']);
        Route::post('/send-test',         [\App\Http\Controllers\WhatsAppController::class, 'sendTest']);
        Route::post('/send-document',     [\App\Http\Controllers\WhatsAppController::class, 'sendDocument']);
    });

    // ── Management (Admin) ───────────────────────────────────
    Route::post('/board-members',        [\App\Http\Controllers\ManagementController::class, 'storeBoardMember']);
    Route::delete('/board-members/{id}', [\App\Http\Controllers\ManagementController::class, 'deleteBoardMember']);
    Route::post('/gallery-items',        [\App\Http\Controllers\ManagementController::class, 'storeGalleryItem']);
    Route::delete('/gallery-items/{id}', [\App\Http\Controllers\ManagementController::class, 'deleteGalleryItem']);

    // ── Dynamic Forms (Admin) ────────────────────────────────
    Route::apiResource('admin/event-forms', \App\Http\Controllers\EventFormController::class)->names('admin.event-forms');
    Route::get('admin/event-submissions', [\App\Http\Controllers\FormSubmissionController::class, 'index']);
    Route::delete('admin/event-submissions/{id}', [\App\Http\Controllers\FormSubmissionController::class, 'destroy']);

    // ── Billboard (Admin) ────────────────────────────────
    Route::apiResource('admin/billboards', \App\Http\Controllers\BillboardController::class)->names('admin.billboards');
});
