<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Setting;

class ConfigureNotifications extends Command
{
    protected $signature = 'oasis:config
                            {--email=      : Correo destino de notificaciones}
                            {--wa-number=  : Número de WhatsApp (código país + número, sin +)}
                            {--wa-group=   : Enlace del grupo de WhatsApp}
                            {--church=     : Nombre de la iglesia}
                            {--show        : Mostrar la configuración actual}';

    protected $description = 'Configura email y WhatsApp para las notificaciones de solicitudes';

    public function handle(): int
    {
        if ($this->option('show')) {
            $this->showCurrentConfig();
            return self::SUCCESS;
        }

        $changed = false;

        if ($email = $this->option('email')) {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->error("❌ El correo '{$email}' no es válido.");
                return self::FAILURE;
            }
            Setting::set('notify_email', $email);
            $this->info("✅ Correo destino guardado: {$email}");
            $changed = true;
        }

        if ($waNumber = $this->option('wa-number')) {
            $clean = preg_replace('/\D/', '', $waNumber);
            Setting::set('whatsapp_number', $clean);
            $link = "https://wa.me/{$clean}";
            $this->info("✅ Número WhatsApp guardado: {$clean}  →  {$link}");
            $changed = true;
        }

        if ($waGroup = $this->option('wa-group')) {
            Setting::set('whatsapp_group_link', $waGroup);
            $this->info("✅ Enlace de grupo WhatsApp guardado: {$waGroup}");
            $changed = true;
        }

        if ($church = $this->option('church')) {
            Setting::set('church_name', $church);
            $this->info("✅ Nombre de iglesia guardado: {$church}");
            $changed = true;
        }

        if (!$changed) {
            $this->warn('No se pasó ninguna opción. Usa --help para ver las opciones disponibles.');
            $this->newLine();
            $this->showCurrentConfig();
            return self::SUCCESS;
        }

        $this->newLine();
        $this->showCurrentConfig();
        return self::SUCCESS;
    }

    private function showCurrentConfig(): void
    {
        $this->newLine();
        $this->components->twoColumnDetail('<fg=blue;options=bold>⚙  Configuración actual</>', '');
        $this->newLine();

        $rows = [
            ['Nombre iglesia',     Setting::get('church_name',         '(no configurado)')],
            ['Correo destino',     Setting::get('notify_email',        '(no configurado)')],
            ['Número WhatsApp',    Setting::get('whatsapp_number',     '(no configurado)')],
            ['Link grupo WA',      Setting::get('whatsapp_group_link', '(no configurado)')],
        ];

        $this->table(['Parámetro', 'Valor'], $rows);

        $waNum = Setting::get('whatsapp_number');
        if ($waNum) {
            $this->newLine();
            $this->line("  <fg=green>Link wa.me generado:</> https://wa.me/{$waNum}");
        }

        $this->newLine();
    }
}
