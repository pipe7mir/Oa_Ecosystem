<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo para los elementos de la Cartelera (Billboard)
 * Define las diapositivas del Hero en el frontend.
 */
class Billboard extends Model
{
    use HasFactory;

    // Campos permitidos para asignación masiva
    protected $fillable = [
        'title',        // Título principal (H1 en el Hero)
        'description',  // Subtítulo o descripción breve
        'media_url',    // Dirección de la imagen o video (local o remota)
        'media_type',   // Tipo de medio: 'image' o 'video'
        'button_text',  // Texto del botón de llamado a la acción
        'button_link',  // Enlace de destino del botón
        'order',        // Posición en el carrusel (1-5)
        'is_active',    // Estado de visibilidad
    ];

    // Casteo de tipos para asegurar integridad de datos
    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];
}
