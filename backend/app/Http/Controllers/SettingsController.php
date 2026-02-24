<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

class SettingsController extends Controller
{
    /**
     * Return all settings as { key: value }.
     */
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        // Never expose the mail password in plain text — return masked
        if ($settings->has('mail_password') && $settings['mail_password']) {
            $settings['mail_password'] = '••••••••';
        }
        return response()->json($settings);
    }

    /**
     * Save multiple settings at once.
     */
    public function update(Request $request)
    {
        $allowed = [
            'church_name', 'notify_email',
            'whatsapp_number', 'whatsapp_group_link',
            'youtube_channel_id', 'youtube_live_video_id', 'stream_is_live', 'youtube_playlist_id',
            'live_bg_image', 'live_overlay_opacity',
            'mail_provider', 'mail_host', 'mail_port',
            'mail_encryption', 'mail_username', 'mail_password',
            'mail_from_name', 'mail_from_address',
            'about_hero_title', 'about_hero_content',
            'about_mission_title', 'about_mission_content', 'about_mission_icon',
            'about_vision_title', 'about_vision_content', 'about_vision_icon',
            'about_values_title', 'about_values_content', 'about_values_icon',
            'about_history_title', 'about_history_content', 'about_history_image',
        ];

        foreach ($allowed as $key) {
            if ($request->has($key)) {
                $value = $request->input($key, '');
                // Don't overwrite password if client sent masked value
                if ($key === 'mail_password' && str_contains($value, '•')) {
                    continue;
                }
                Setting::set($key, $value);
            }
        }

        return response()->json(['success' => true, 'message' => 'Configuración guardada correctamente']);
    }

    /**
     * Send a test email using the configured SMTP settings.
     */
    public function testEmail(Request $request)
    {
        $request->validate(['test_to' => 'required|email']);

        $to = $request->test_to;

        // Load SMTP settings from DB
        $host       = Setting::get('mail_host',         'smtp.gmail.com');
        $port       = Setting::get('mail_port',         '587');
        $encryption = Setting::get('mail_encryption',   'tls') ?: null;
        $username   = Setting::get('mail_username',     '');
        $password   = Setting::get('mail_password',     '');
        $fromName   = Setting::get('mail_from_name',    Setting::get('church_name', 'Oasis'));
        $fromAddr   = Setting::get('mail_from_address', $username);
        $church     = Setting::get('church_name',       'Iglesia Oasis');

        if (!$username || !$password) {
            return response()->json([
                'success' => false,
                'message' => 'Configura el usuario y contraseña SMTP antes de enviar una prueba.',
            ], 422);
        }

        // Override mail config at runtime
        Config::set('mail.mailers.smtp', [
            'transport'  => 'smtp',
            'host'       => $host,
            'port'       => (int) $port,
            'encryption' => $encryption,
            'username'   => $username,
            'password'   => $password,
            'timeout'    => 10,
        ]);
        Config::set('mail.from.address', $fromAddr ?: $username);
        Config::set('mail.from.name',    $fromName);
        Config::set('mail.default', 'smtp');

        try {
            Mail::raw(
                "✅ Este es un correo de prueba enviado desde {$church}.\n\n" .
                "Si recibes este mensaje, la configuración SMTP está funcionando correctamente.\n\n" .
                "Servidor: {$host}:{$port}\n" .
                "Cifrado:  " . ($encryption ?: 'Ninguno'),
                function ($msg) use ($to, $church) {
                    $msg->to($to)->subject("[{$church}] Correo de prueba — configuración OK");
                }
            );

            return response()->json([
                'success' => true,
                'message' => "Correo de prueba enviado exitosamente a {$to}",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar: ' . $e->getMessage(),
            ], 500);
        }

    }

    /**
     * Upload a file and return its public URL.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|image|max:10240', // Max 10MB
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('uploads', 'public');
            return response()->json([
                'url' => '/storage/' . $path
            ]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }
}
