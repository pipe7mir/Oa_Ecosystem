<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Controlador para gestionar las respuestas de los formularios.
 * Maneja el almacenamiento de datos y archivos enviados por los usuarios.
 */
class FormSubmissionController extends Controller
{
    /**
     * Lista todas las respuestas recibidas. 
     * Puede filtrarse por 'event_form_id' para ver las respuestas de un evento específico.
     */
    public function index(Request $request)
    {
        $query = \App\Models\FormSubmission::with('form')->latest();
        
        if ($request->has('event_form_id')) {
            $query->where('event_form_id', $request->event_form_id);
        }

        return response()->json($query->get());
    }

    /**
     * Guarda una respuesta enviada desde el formulario público.
     * Procesa automáticamente archivos adjuntos (fotos, PDFs).
     */
    public function store(Request $request)
    {
        $request->validate([
            'event_form_id' => 'required|exists:event_forms,id',
        ]);

        $form = \App\Models\EventForm::findOrFail($request->event_form_id);
        $submissionData = $request->all();
        
        // El ID del formulario no debe estar dentro del JSON de datos
        unset($submissionData['event_form_id']);

        // Procesar archivos si existen
        foreach ($request->allFiles() as $key => $file) {
            $path = $file->store('submissions', 'public');
            // Guardamos la ruta absoluta al archivo para que el Admin pueda verla/descargarla
            $submissionData[$key] = '/storage/' . $path;
        }

        // Limpiar campos internos de Laravel
        unset($submissionData['_token']);

        $submission = \App\Models\FormSubmission::create([
            'event_form_id' => $request->event_form_id,
            'data' => $submissionData
        ]);

        return response()->json($submission, 201);
    }

    /**
     * Muestra el detalle de una respuesta específica.
     */
    public function show(string $id)
    {
        $submission = \App\Models\FormSubmission::with('form')->findOrFail($id);
        return response()->json($submission);
    }

    /**
     * Elimina una respuesta.
     */
    public function destroy(string $id)
    {
        $submission = \App\Models\FormSubmission::findOrFail($id);
        $submission->delete();
        return response()->json(['message' => 'Respuesta eliminada correctamente']);
    }
}
