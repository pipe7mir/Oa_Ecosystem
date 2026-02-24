<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Resource;
use Illuminate\Support\Facades\Validator;

class ResourceController extends Controller
{
    // List all resources (Public/Admin)
    public function index()
    {
        $resources = Resource::orderBy('created_at', 'desc')->get();
        return response()->json($resources, 200);
    }

    // Create a new resource (Admin)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'download_url' => 'required|url',
            'action_type' => 'required|string|in:download,link',
            'category' => 'nullable|string',
            'thumbnail_url' => 'nullable|url'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $resource = Resource::create([
                'title' => $request->title,
                'category' => $request->category ?? 'oasis',
                'download_url' => $request->download_url,
                'thumbnail_url' => $request->thumbnail_url,
                'action_type' => $request->action_type
            ]);

            return response()->json(['success' => true, 'message' => 'Recurso creado', 'data' => $resource], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al crear recurso: ' . $e->getMessage()], 500);
        }
    }

    // Update a resource (Admin)
    public function update(Request $request, $id)
    {
        $resource = Resource::find($id);
        if (!$resource) {
            return response()->json(['success' => false, 'message' => 'Recurso no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'download_url' => 'required|url',
            'action_type' => 'required|string|in:download,link',
            'category' => 'nullable|string',
            'thumbnail_url' => 'nullable|url'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        try {
            $resource->update([
                'title' => $request->title,
                'category' => $request->category ?? 'oasis',
                'download_url' => $request->download_url,
                'thumbnail_url' => $request->thumbnail_url,
                'action_type' => $request->action_type
            ]);

            return response()->json(['success' => true, 'message' => 'Recurso actualizado', 'data' => $resource]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al actualizar: ' . $e->getMessage()], 500);
        }
    }

    // Delete a resource (Admin)
    public function destroy($id)
    {
        $resource = Resource::find($id);
        if (!$resource) {
            return response()->json(['success' => false, 'message' => 'Recurso no encontrado'], 404);
        }

        $resource->delete();
        return response()->json(['success' => true, 'message' => 'Recurso eliminado']);
    }
}
