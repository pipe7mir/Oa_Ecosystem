<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Controlador para la creación y gestión de formularios personalizados.
 * Permite a los administradores crear campos dinámicos para inscripciones.
 */
class EventFormController extends Controller
{
    /**
     * Lista todos los formularios creados, ordenados por los más recientes.
     */
    public function index()
    {
        return response()->json(\App\Models\EventForm::latest()->get());
    }

    /**
     * Guarda un nuevo formulario con sus campos dinámicos (JSON).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'fields' => 'required|array', // Configuración de campos del formulario
            'is_active' => 'boolean',
        ]);

        $form = \App\Models\EventForm::create($validated);
        return response()->json($form, 201);
    }

    /**
     * Muestra la estructura de un formulario específico.
     */
    public function show(string $id)
    {
        $form = \App\Models\EventForm::findOrFail($id);
        return response()->json($form);
    }

    /**
     * Actualiza la configuración de un formulario (campos, título, estado).
     */
    public function update(Request $request, string $id)
    {
        $form = \App\Models\EventForm::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'fields' => 'array',
            'is_active' => 'boolean',
        ]);

        $form->update($validated);
        return response()->json($form);
    }

    /**
     * Elimina el formulario y lógicamente deja de estar disponible para inscripciones.
     */
    public function destroy(string $id)
    {
        $form = \App\Models\EventForm::findOrFail($id);
        $form->delete();
        return response()->json(['message' => 'Formulario eliminado correctamente']);
    }
}
