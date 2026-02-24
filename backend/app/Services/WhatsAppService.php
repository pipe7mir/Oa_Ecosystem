<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Setting;

/**
 * WhatsAppService — Integración con Evolution API
 * ─────────────────────────────────────────────────
 * Implementa tres capas de protección anti-baneo:
 *   1. Configuración de instancia (user-agent Chrome/Windows, rechazar llamadas, ignorar grupos)
 *   2. Humanización: delay aleatorio + estado "Escribiendo..." antes de cada mensaje
 *   3. Detección de desconexión/baneo vía webhook (ver WhatsAppController)
 */
class WhatsAppService
{
    private string $baseUrl;
    private string $apiKey;
    private string $instanceName;

    public function __construct()
    {
        $this->baseUrl      = rtrim(Setting::get('evolution_url', config('services.evolution.url', '')), '/');
        $this->apiKey       = Setting::get('evolution_key', config('services.evolution.key', ''));
        $this->instanceName = Setting::get('evolution_instance', config('services.evolution.instance', 'oasis-iglesia'));
    }

    /* ══════════════════════════════════════════════════════
       1. GESTIÓN DE INSTANCIA
    ══════════════════════════════════════════════════════ */

    /**
     * Crea la instancia en Evolution API con configuración anti-baneo completa.
     *
     * Puntos clave:
     * - user_agent: Chrome 122 en Windows 10 → para Meta no parece un servidor Linux
     * - reject_call: true → evita que la cuenta sea molestada por llamadas
     * - groups_ignore: true → no procesa mensajes de grupos (reduce ruido y carga)
     */
    public function createInstance(): array
    {
        $webhook = url('/api/whatsapp/webhook');

        $payload = [
            'instanceName'  => $this->instanceName,
            'token'         => '',          // puede ser vacío; la API genera uno
            'qrcode'        => true,

            // ── Anti-baneo: simular Chrome en Windows ──────────────────
            'browserAgent'  => [
                'browser'  => 'Chrome',
                'version'  => '122.0.0.0',
                'platform' => 'Windows',
            ],
            // Alternativa string para versiones antiguas de la API:
            'user_agent'    => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                             . 'AppleWebKit/537.36 (KHTML, like Gecko) '
                             . 'Chrome/122.0.0.0 Safari/537.36',

            // ── Comportamiento de la instancia ─────────────────────────
            'reject_call'     => true,   // no atiende llamadas entrantes
            'msg_call'        => '📵 Hola, no podemos atender llamadas por este número. Por favor escríbenos.',
            'groups_ignore'   => true,   // ignora mensajes de grupos
            'always_online'   => false,  // ¡NO actives esto! suspicious pattern
            'read_messages'   => false,  // no marcar como leído automáticamente
            'read_status'     => false,

            // ── Webhook ────────────────────────────────────────────────
            'webhook' => [
                'url'      => $webhook,
                'enabled'  => true,
                'events'   => [
                    'APPLICATION_STARTUP',
                    'QRCODE_UPDATED',
                    'MESSAGES_SET',
                    'MESSAGES_UPSERT',
                    'CONNECTION_UPDATE',  // ← detecta desconexión / baneo
                ],
            ],
        ];

        return $this->post('/instance/create', $payload);
    }

    /**
     * Obtiene el status y QR de la instancia.
     */
    public function getInstanceStatus(): array
    {
        return $this->get("/instance/connectionState/{$this->instanceName}");
    }

    /**
     * Obtiene el QR code para conectar el número.
     */
    public function getQrCode(): array
    {
        return $this->get("/instance/connect/{$this->instanceName}");
    }

    /**
     * Desconecta la instancia (logout del número).
     */
    public function logoutInstance(): array
    {
        return $this->delete("/instance/logout/{$this->instanceName}");
    }

    /**
     * Verifica si la instancia está conectada y activa.
     */
    public function isConnected(): bool
    {
        try {
            $status = $this->getInstanceStatus();
            return ($status['instance']['state'] ?? '') === 'open';
        } catch (\Exception $e) {
            Log::warning('WhatsApp: no se pudo verificar estado de instancia', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /* ══════════════════════════════════════════════════════
       2. ENVÍO DE MENSAJES CON HUMANIZACIÓN
    ══════════════════════════════════════════════════════ */

    /**
     * Envía un mensaje de texto con humanización completa:
     *   a) Espera un delay aleatorio entre $minDelay y $maxDelay segundos
     *   b) Activa "Escribiendo..." durante 3 segundos
     *   c) Envía el mensaje real
     *
     * @param string $to       Número en formato internacional sin +  (ej: 573001234567)
     * @param string $message  Texto del mensaje
     * @param int    $minDelay Delay mínimo en segundos (default: 15)
     * @param int    $maxDelay Delay máximo en segundos (default: 45)
     */
    public function sendText(string $to, string $message, int $minDelay = 15, int $maxDelay = 45): array
    {
        // ── a) Delay aleatorio (simula comportamiento humano) ──────────
        $delay = rand($minDelay, $maxDelay);
        Log::info("WhatsApp: esperando {$delay}s antes de enviar a {$to}");
        sleep($delay);

        // ── b) Activar estado "Escribiendo..." durante 3 segundos ──────
        $this->sendPresence($to, 'composing', 3);

        // ── c) Enviar mensaje ──────────────────────────────────────────
        $payload = [
            'number'  => $this->normalizeNumber($to),
            'options' => [
                'delay'    => 1500,    // delay adicional en ms dentro de la API
                'presence' => 'composing',
            ],
            'textMessage' => ['text' => $message],
        ];

        $result = $this->post("/message/sendText/{$this->instanceName}", $payload);
        Log::info("WhatsApp: mensaje enviado a {$to}", ['result' => $result]);
        return $result;
    }

    /**
     * Envía un PDF o archivo con humanización.
     *
     * @param string $to       Número destino (ej: 573001234567)
     * @param string $fileUrl  URL pública del archivo
     * @param string $caption  Texto descriptivo que acompaña el archivo
     * @param string $fileName Nombre del archivo (ej: "Recurso-Biblia.pdf")
     */
    public function sendDocument(
        string $to,
        string $fileUrl,
        string $caption  = '',
        string $fileName = 'documento.pdf',
        int    $minDelay = 10,
        int    $maxDelay = 30
    ): array {
        $delay = rand($minDelay, $maxDelay);
        sleep($delay);

        // Presencia "grabando" imita adjuntar un archivo
        $this->sendPresence($to, 'recording', 2);

        $payload = [
            'number'  => $this->normalizeNumber($to),
            'options' => ['delay' => 1200],
            'mediaMessage' => [
                'mediatype' => 'document',
                'media'     => $fileUrl,
                'fileName'  => $fileName,
                'caption'   => $caption,
            ],
        ];

        $result = $this->post("/message/sendMedia/{$this->instanceName}", $payload);
        Log::info("WhatsApp: documento enviado a {$to}", ['file' => $fileName]);
        return $result;
    }

    /**
     * Envía una imagen.
     */
    public function sendImage(string $to, string $imageUrl, string $caption = '', int $minDelay = 5, int $maxDelay = 20): array
    {
        $delay = rand($minDelay, $maxDelay);
        sleep($delay);
        $this->sendPresence($to, 'composing', 2);

        $payload = [
            'number'  => $this->normalizeNumber($to),
            'options' => ['delay' => 1000],
            'mediaMessage' => [
                'mediatype' => 'image',
                'media'     => $imageUrl,
                'caption'   => $caption,
            ],
        ];

        return $this->post("/message/sendMedia/{$this->instanceName}", $payload);
    }

    /**
     * Activa el estado de presencia (typing / recording) durante $seconds.
     *
     * @param string $to       Número destino
     * @param string $type     'composing' (escribiendo) | 'recording' (grabando) | 'paused'
     * @param int    $seconds  Cuántos segundos mantener el estado
     */
    public function sendPresence(string $to, string $type = 'composing', int $seconds = 3): void
    {
        try {
            $this->post("/chat/sendPresence/{$this->instanceName}", [
                'number'   => $this->normalizeNumber($to),
                'options'  => ['presence' => $type, 'delay' => $seconds * 1000],
            ]);
            sleep($seconds); // esperar el tiempo que dura el estado
        } catch (\Exception $e) {
            // La presencia es opcional, no debe romper el flujo
            Log::warning("WhatsApp: no se pudo enviar presencia: " . $e->getMessage());
        }
    }

    /* ══════════════════════════════════════════════════════
       3. HELPERS DE NORMALIZACIÓN
    ══════════════════════════════════════════════════════ */

    /**
     * Normaliza un número: elimina espacios, guiones, + y agrega @s.whatsapp.net
     * Ej: "+57 300-123-4567" → "573001234567@s.whatsapp.net"
     */
    private function normalizeNumber(string $number): string
    {
        $clean = preg_replace('/\D/', '', $number); // solo dígitos
        // Evolution API acepta número solo o con @s.whatsapp.net
        return $clean . '@s.whatsapp.net';
    }

    /* ══════════════════════════════════════════════════════
       4. HTTP CLIENT (con headers de autenticación)
    ══════════════════════════════════════════════════════ */

    private function httpClient()
    {
        return Http::withHeaders([
            'apikey'       => $this->apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(30);
    }

    private function post(string $endpoint, array $data): array
    {
        $response = $this->httpClient()->post($this->baseUrl . $endpoint, $data);
        if ($response->failed()) {
            Log::error("WhatsApp API POST error", ['endpoint' => $endpoint, 'status' => $response->status(), 'body' => $response->body()]);
            throw new \RuntimeException("Evolution API error ({$response->status()}): " . $response->body());
        }
        return $response->json() ?? [];
    }

    private function get(string $endpoint): array
    {
        $response = $this->httpClient()->get($this->baseUrl . $endpoint);
        if ($response->failed()) {
            throw new \RuntimeException("Evolution API GET error ({$response->status()}): " . $response->body());
        }
        return $response->json() ?? [];
    }

    private function delete(string $endpoint): array
    {
        $response = $this->httpClient()->delete($this->baseUrl . $endpoint);
        return $response->json() ?? [];
    }
}
