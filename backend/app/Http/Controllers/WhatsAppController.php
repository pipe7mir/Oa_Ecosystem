<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\WhatsAppService;
use App\Models\Setting;

class WhatsAppController extends Controller
{
    private WhatsAppService $wa;

    public function __construct(WhatsAppService $wa)
    {
        $this->wa = $wa;
    }

    /* ══════════════════════════════════════════════════════
       WEBHOOK — Recibe eventos de Evolution API
    ══════════════════════════════════════════════════════ */

    /**
     * Evolution API llama a este endpoint con cada evento.
     * REGLA DE ORO: Si detecta desconexión o baneo → activa el kill-switch.
     *
     * Eventos importantes de CONNECTION_UPDATE:
     *   state = "close"      → sesión cerrada (posible baneo o cerraron la sesión)
     *   state = "connecting" → reconectando (ok)
     *   state = "open"       → conectada (ok)
     *   statusReason = 401   → 📛 BANEO — WhatsApp bloqueó el número
     *   statusReason = 408   → timeout de conexión
     */
    public function webhook(Request $request): \Illuminate\Http\JsonResponse
    {
        $event = $request->input('event');
        $data  = $request->input('data', []);

        Log::info("WhatsApp Webhook: {$event}", ['data' => $data]);

        switch ($event) {
            case 'CONNECTION_UPDATE':
                $this->handleConnectionUpdate($data);
                break;

            case 'QRCODE_UPDATED':
                // El QR cambia cada ~20s. Guardamos el último para mostrarlo en el panel.
                $qrBase64 = $data['qrcode']['base64'] ?? null;
                if ($qrBase64) {
                    Setting::set('wa_qr_code', $qrBase64);
                    Setting::set('wa_status', 'qr_pending');
                }
                break;

            case 'APPLICATION_STARTUP':
                Log::info('WhatsApp: instancia iniciada');
                break;
        }

        return response()->json(['received' => true]);
    }

    /**
     * Procesa eventos de conexión/desconexión.
     * Esta es la CAPA DE SEGURIDAD más importante.
     */
    private function handleConnectionUpdate(array $data): void
    {
        $state        = $data['state']        ?? '';
        $statusReason = $data['statusReason'] ?? null;

        match (true) {
            // ── Número BANEADO ────────────────────────────────────────
            ($statusReason === 401) => $this->activateKillSwitch(
                '🚫 NÚMERO BANEADO por WhatsApp (código 401). Kill-switch activado. Envíos detenidos.'
            ),

            // ── Sesión cerrada ────────────────────────────────────────
            ($state === 'close' && $statusReason !== 200) => $this->activateKillSwitch(
                "⚠️ Sesión cerrada inesperadamente (reason: {$statusReason}). Kill-switch activado."
            ),

            // ── Conectado correctamente ───────────────────────────────
            ($state === 'open') => $this->deactivateKillSwitch(),

            // ── Reconectando ──────────────────────────────────────────
            ($state === 'connecting') => Setting::set('wa_status', 'connecting'),

            default => Log::info("WhatsApp: estado desconocido: {$state} / reason: {$statusReason}"),
        };
    }

    /**
     * Kill-switch: deshabilita todos los envíos automáticos.
     * El admin tendrá que revisarlo manualmente desde el panel.
     */
    private function activateKillSwitch(string $reason): void
    {
        Setting::set('wa_kill_switch', '1');
        Setting::set('wa_kill_reason', $reason);
        Setting::set('wa_status', 'banned_or_disconnected');
        Log::critical("WhatsApp Kill-Switch ACTIVADO: {$reason}");
    }

    private function deactivateKillSwitch(): void
    {
        Setting::set('wa_kill_switch', '0');
        Setting::set('wa_kill_reason', '');
        Setting::set('wa_status', 'connected');
    }

    /* ══════════════════════════════════════════════════════
       ENDPOINTS ADMIN
    ══════════════════════════════════════════════════════ */

    /**
     * GET /api/whatsapp/status
     * Retorna estado de la instancia para el panel admin.
     */
    public function status(): \Illuminate\Http\JsonResponse
    {
        $killSwitch = Setting::get('wa_kill_switch', '0') === '1';
        $waStatus   = Setting::get('wa_status', 'unknown');
        $killReason = Setting::get('wa_kill_reason', '');
        $qr         = Setting::get('wa_qr_code', '');

        // También verificamos en tiempo real con la API
        try {
            $apiStatus = $this->wa->getInstanceStatus();
            $liveState = $apiStatus['instance']['state'] ?? 'unknown';
        } catch (\Exception $e) {
            $liveState = 'api_unreachable';
        }

        return response()->json([
            'kill_switch' => $killSwitch,
            'kill_reason' => $killReason,
            'status'      => $waStatus,
            'live_state'  => $liveState,
            'has_qr'      => !empty($qr),
            'qr_base64'   => $qr,
        ]);
    }

    /**
     * POST /api/whatsapp/create-instance
     * Crea la instancia en Evolution API con la configuración anti-baneo.
     */
    public function createInstance(): \Illuminate\Http\JsonResponse
    {
        try {
            $result = $this->wa->createInstance();
            Setting::set('wa_status', 'created');
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/whatsapp/qr
     * Obtiene el QR code para conectar el número.
     */
    public function getQr(): \Illuminate\Http\JsonResponse
    {
        try {
            $result = $this->wa->getQrCode();
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/whatsapp/logout
     * Desconecta el número de Evolution API.
     */
    public function logout(): \Illuminate\Http\JsonResponse
    {
        try {
            $this->wa->logoutInstance();
            Setting::set('wa_status', 'disconnected');
            Setting::set('wa_qr_code', '');
            return response()->json(['success' => true, 'message' => 'Instancia desconectada']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/whatsapp/reset-kill-switch
     * Permite al admin reactivar los envíos después de revisar el problema.
     */
    public function resetKillSwitch(): \Illuminate\Http\JsonResponse
    {
        Setting::set('wa_kill_switch', '0');
        Setting::set('wa_kill_reason', '');
        return response()->json(['success' => true, 'message' => 'Kill-switch desactivado. Los envíos se reanudan.']);
    }

    /**
     * POST /api/whatsapp/send-test
     * Envía un mensaje de prueba a un número específico.
     * Body: { "to": "573001234567", "message": "Hola prueba" }
     */
    public function sendTest(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'to'      => 'required|string',
            'message' => 'required|string|max:4096',
        ]);

        // ── Verificar kill-switch ────────────────────────────────────
        if (Setting::get('wa_kill_switch', '0') === '1') {
            return response()->json([
                'success' => false,
                'message' => 'Kill-switch activo: ' . Setting::get('wa_kill_reason'),
            ], 403);
        }

        try {
            // Para prueba usamos delay corto (1-3s)
            $result = $this->wa->sendText($request->to, $request->message, 1, 3);
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/whatsapp/send-document
     * Envía un PDF o documento.
     * Body: { "to": "573001234567", "file_url": "https://...", "caption": "Recurso", "file_name": "biblia.pdf" }
     */
    public function sendDocument(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'to'        => 'required|string',
            'file_url'  => 'required|url',
            'caption'   => 'nullable|string|max:1024',
            'file_name' => 'nullable|string|max:255',
        ]);

        if (Setting::get('wa_kill_switch', '0') === '1') {
            return response()->json([
                'success' => false,
                'message' => 'Kill-switch activo: ' . Setting::get('wa_kill_reason'),
            ], 403);
        }

        try {
            $result = $this->wa->sendDocument(
                $request->to,
                $request->file_url,
                $request->caption   ?? '',
                $request->file_name ?? 'documento.pdf',
                5, 15  // delay más corto para documentos
            );
            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
