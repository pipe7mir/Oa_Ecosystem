<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Request as OasisRequest;
use App\Models\Setting;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class RequestController extends Controller
{
    // List all requests (Admin)
    public function index()
    {
        $requests = OasisRequest::orderBy('created_at', 'desc')->get();
        return response()->json($requests, 200);
    }

    // Create a new request (Public) — auto-sends email notification
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category'      => 'required|string|max:255',
            'description'   => 'required|string',
            'is_anonymous'  => 'boolean',
            'contact_name'  => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'email'         => 'nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $newRequest = OasisRequest::create([
                'category'     => $request->category,
                'description'  => $request->description,
                'is_anonymous' => $request->is_anonymous ?? false,
                'name'         => $request->contact_name,
                'phone'        => $request->contact_phone,
                'email'        => $request->email,
                'status'       => 'pendiente',
            ]);

            // ── Auto-send email notification ──────────────────────
            $emailResult = $this->autoSendEmail($newRequest);
            if ($emailResult['sent']) {
                $newRequest->email_sent_at = now();
            } else {
                $newRequest->email_error = $emailResult['error'] ?? 'Unknown error';
            }
            $newRequest->save();
            // ─────────────────────────────────────────────────────

            return response()->json([
                'success'    => true,
                'message'    => 'Solicitud creada correctamente',
                'data'       => $newRequest,
                'email_sent' => $emailResult['sent'],
                'email_info' => $emailResult['info'] ?? '',
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al crear solicitud: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Configure the mailer from DB settings and attempt to send.
     * Returns ['sent' => bool, 'error' => string|null, 'info' => string]
     */
    private function autoSendEmail(OasisRequest $oasisRequest): array
    {
        $destEmail  = Setting::get('notify_email', '');
        $churchName = Setting::get('church_name', 'Iglesia Oasis');

        if (!$destEmail) {
            return ['sent' => false, 'error' => 'Sin correo destino configurado', 'info' => 'No hay correo destino'];
        }

        $host       = Setting::get('mail_host',       'smtp.gmail.com');
        $port       = Setting::get('mail_port',       '587');
        $encryption = Setting::get('mail_encryption', 'tls') ?: null;
        $username   = Setting::get('mail_username',   '');
        $password   = Setting::get('mail_password',   '');
        $fromName   = Setting::get('mail_from_name',  $churchName);
        $fromAddr   = Setting::get('mail_from_address', $username);

        if (!$username || !$password) {
            return ['sent' => false, 'error' => 'Sin credenciales SMTP', 'info' => 'SMTP no configurado'];
        }

        \Illuminate\Support\Facades\Config::set('mail.mailers.smtp', [
            'transport'  => 'smtp',
            'host'       => $host,
            'port'       => (int) $port,
            'encryption' => $encryption,
            'username'   => $username,
            'password'   => $password,
            'timeout'    => 10,
        ]);
        \Illuminate\Support\Facades\Config::set('mail.from.address', $fromAddr ?: $username);
        \Illuminate\Support\Facades\Config::set('mail.from.name',    $fromName);
        \Illuminate\Support\Facades\Config::set('mail.default', 'smtp');

        try {
            $body  = "📩 Nueva Solicitud — {$churchName}\n\n";
            $body .= "📋 Categoría: {$oasisRequest->category}\n";
            $body .= "👤 Solicitante: " . ($oasisRequest->is_anonymous ? 'Anónimo' : ($oasisRequest->name ?? 'Sin nombre')) . "\n";
            if ($oasisRequest->phone && !$oasisRequest->is_anonymous) $body .= "📞 Teléfono: {$oasisRequest->phone}\n";
            if ($oasisRequest->email && !$oasisRequest->is_anonymous) $body .= "✉️  Email: {$oasisRequest->email}\n";
            $body .= "\n📝 Descripción:\n{$oasisRequest->description}\n\n";
            $body .= "⏰ Recibido: " . now()->format('d/m/Y H:i') . "\n";
            $body .= "🔗 Gestionalo en: " . (config('app.url') ?? 'tu panel admin') . "/admin/solicitudes";

            Mail::raw($body, function ($msg) use ($destEmail, $churchName, $oasisRequest) {
                $msg->to($destEmail)
                    ->subject("[{$churchName}] 🔔 Nueva Solicitud #{$oasisRequest->id} — {$oasisRequest->category}");
            });

            return ['sent' => true, 'info' => "Notificación enviada a {$destEmail}"];
        } catch (\Exception $e) {
            return ['sent' => false, 'error' => $e->getMessage(), 'info' => 'Error al enviar'];
        }
    }



    // Update status freely (pendiente / gestionada / sin_respuesta)
    public function updateStatus(Request $request, $id)
    {
        $oasisRequest = OasisRequest::find($id);
        if (!$oasisRequest) {
            return response()->json(['success' => false, 'message' => 'Solicitud no encontrada'], 404);
        }

        $request->validate([
            'status' => 'required|in:pendiente,gestionada,sin_respuesta',
            'notes'  => 'nullable|string',
        ]);

        $oasisRequest->status   = $request->status;
        $oasisRequest->response = $request->notes ?? $oasisRequest->response;
        $oasisRequest->save();

        return response()->json(['success' => true, 'data' => $oasisRequest]);
    }

    // Approve request (legacy / kept for compatibility)
    public function approve(Request $request, $id)
    {
        $oasisRequest = OasisRequest::find($id);
        if (!$oasisRequest) return response()->json(['success' => false, 'message' => 'Solicitud no encontrada'], 404);
        $oasisRequest->status   = 'gestionada';
        $oasisRequest->response = $request->input('response');
        $oasisRequest->save();
        return response()->json(['success' => true, 'data' => $oasisRequest]);
    }

    // Reject request (legacy / kept for compatibility)
    public function reject(Request $request, $id)
    {
        $oasisRequest = OasisRequest::find($id);
        if (!$oasisRequest) return response()->json(['success' => false, 'message' => 'Solicitud no encontrada'], 404);
        $oasisRequest->status   = 'sin_respuesta';
        $oasisRequest->response = $request->input('response');
        $oasisRequest->save();
        return response()->json(['success' => true, 'data' => $oasisRequest]);
    }

    // Send notification email to configured address
    public function sendEmail(Request $request, $id)
    {
        $oasisRequest = OasisRequest::find($id);
        if (!$oasisRequest) return response()->json(['success' => false, 'message' => 'Solicitud no encontrada'], 404);

        $destEmail  = Setting::get('notify_email');
        $churchName = Setting::get('church_name', 'Iglesia Oasis');

        if (!$destEmail) {
            return response()->json(['success' => false, 'message' => 'No hay correo destino configurado. Ve a Ajustes.'], 422);
        }

        $notes = $request->input('notes', '');

        // ── Configure mailer dynamically from DB settings ──
        $host       = Setting::get('mail_host',       'smtp.gmail.com');
        $port       = Setting::get('mail_port',       '587');
        $encryption = Setting::get('mail_encryption', 'tls') ?: null;
        $username   = Setting::get('mail_username',   '');
        $password   = Setting::get('mail_password',   '');
        $fromName   = Setting::get('mail_from_name',  $churchName);
        $fromAddr   = Setting::get('mail_from_address', $username);

        if ($username && $password) {
            \Illuminate\Support\Facades\Config::set('mail.mailers.smtp', [
                'transport'  => 'smtp',
                'host'       => $host,
                'port'       => (int) $port,
                'encryption' => $encryption,
                'username'   => $username,
                'password'   => $password,
                'timeout'    => 10,
            ]);
            \Illuminate\Support\Facades\Config::set('mail.from.address', $fromAddr ?: $username);
            \Illuminate\Support\Facades\Config::set('mail.from.name',    $fromName);
            \Illuminate\Support\Facades\Config::set('mail.default', 'smtp');
        }
        // ──────────────────────────────────────────────────

        try {
            $body = "📩 Nueva Solicitud — {$churchName}\n\n";
            $body .= "Categoría: {$oasisRequest->category}\n";
            $body .= "Solicitante: " . ($oasisRequest->is_anonymous ? 'Anónimo' : ($oasisRequest->name ?? 'Sin nombre')) . "\n";
            $body .= "Teléfono: " . ($oasisRequest->phone ?? 'No provisto') . "\n";
            $body .= "Email: " . ($oasisRequest->email ?? 'No provisto') . "\n\n";
            $body .= "Descripción:\n{$oasisRequest->description}\n";
            if ($notes) $body .= "\nNotas del admin:\n{$notes}";

            Mail::raw($body, function ($msg) use ($destEmail, $churchName, $oasisRequest) {
                $msg->to($destEmail)
                    ->subject("[{$churchName}] Solicitud #{$oasisRequest->id} — {$oasisRequest->category}");
            });

            return response()->json(['success' => true, 'message' => "Correo enviado a {$destEmail}"]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al enviar correo: ' . $e->getMessage()], 500);
        }
    }


    // Build WhatsApp pre-filled link and return it to the frontend
    public function getWhatsappLink(Request $request, $id)
    {
        $oasisRequest = OasisRequest::find($id);
        if (!$oasisRequest) return response()->json(['success' => false, 'message' => 'Solicitud no encontrada'], 404);

        $churchName  = Setting::get('church_name', 'Iglesia Oasis');
        $waNumber    = Setting::get('whatsapp_number', '');
        $waGroupLink = Setting::get('whatsapp_group_link', '');
        $notes       = $request->input('notes', '');

        // Build message text
        $text  = "📋 *Solicitud #{$oasisRequest->id}* — {$churchName}\n";
        $text .= "*Categoría:* {$oasisRequest->category}\n";
        $text .= "*Solicitante:* " . ($oasisRequest->is_anonymous ? 'Anónimo' : ($oasisRequest->name ?? 'Sin nombre')) . "\n";
        if ($oasisRequest->phone && !$oasisRequest->is_anonymous) $text .= "*Teléfono:* {$oasisRequest->phone}\n";
        $text .= "\n*Descripción:*\n{$oasisRequest->description}";
        if ($notes) $text .= "\n\n*Nota:* {$notes}";

        $encodedText = urlencode($text);

        // Priority: personal number > group link
        if ($waNumber) {
            $link = "https://wa.me/{$waNumber}?text={$encodedText}";
        } elseif ($waGroupLink) {
            // Group links don't support pre-filled text directly, return group link + message separately
            $link = $waGroupLink;
        } else {
            return response()->json(['success' => false, 'message' => 'No hay número ni grupo de WhatsApp configurado. Ve a Ajustes.'], 422);
        }

        // Stamp "wa notified" timestamp on first open
        if (!$oasisRequest->wa_link_opened_at) {
            $oasisRequest->wa_link_opened_at = now();
            $oasisRequest->save();
        }

        return response()->json([
            'success'    => true,
            'link'       => $link,
            'message'    => $text,
            'has_number' => (bool)$waNumber,
        ]);
    }
}
