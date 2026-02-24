<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Controlador para la gestión de la Cartelera (Hero Billboard)
 * Maneja las diapositivas dinámicas que se muestran en el inicio.
 */
class BillboardController extends Controller
{
    /**
     * Lista todas las diapositivas ordenadas para la API pública y admin.
     */
    public function index()
    {
        return response()->json(\App\Models\Billboard::orderBy('order')->get());
    }

    /**
     * Crea un nuevo elemento en la cartelera.
     * Soporta carga de archivos locales y URLs externas.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'media_file' => 'nullable|image|max:5120', // Máximo 5MB
            'media_url' => 'nullable|string',
            'media_type' => 'required|in:image,video',
            'button_text' => 'nullable|string|max:50',
            'button_link' => 'nullable|string',
            'order' => 'integer',
            'is_active' => 'boolean',
        ]);

        // Si se sube un archivo local, se guarda en el storage público
        if ($request->hasFile('media_file')) {
            $path = $request->file('media_file')->store('billboards', 'public');
            $validated['media_url'] = '/storage/' . $path;
        }

        // Validación manual: Se requiere al menos un archivo o una URL
        if (empty($validated['media_url'])) {
            return response()->json(['message' => 'Se requiere el archivo de imagen o una URL de medio.'], 422);
        }

        $billboard = \App\Models\Billboard::create($validated);
        return response()->json($billboard, 201);
    }

    /**
     * Muestra el detalle de una diapositiva específica.
     */
    public function show(string $id)
    {
        $billboard = \App\Models\Billboard::findOrFail($id);
        return response()->json($billboard);
    }

    /**
     * Actualiza una diapositiva existente.
     * Permite cambiar el archivo de imagen, la URL o cualquier otro campo.
     */
    public function update(Request $request, string $id)
    {
        $billboard = \App\Models\Billboard::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'media_file' => 'nullable|image|max:5120',
            'media_url' => 'nullable|string',
            'media_type' => 'in:image,video',
            'button_text' => 'nullable|string|max:50',
            'button_link' => 'nullable|string',
            'order' => 'integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('media_file')) {
            $path = $request->file('media_file')->store('billboards', 'public');
            $validated['media_url'] = '/storage/' . $path;
        }

        // Solo actualizamos los campos enviados
        $billboard->update(array_filter($validated, fn($v) => !is_null($v)));
        return response()->json($billboard);
    }

    /**
     * Elimina una diapositiva del sistema.
     */
    public function destroy(string $id)
    {
        $billboard = \App\Models\Billboard::findOrFail($id);
        $billboard->delete();
        return response()->json(['message' => 'Elemento eliminado correctamente']);
    }
}
