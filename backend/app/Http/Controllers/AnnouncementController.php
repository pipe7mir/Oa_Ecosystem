<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnnouncementController extends Controller
{
    public function index()
    {
        return Announcement::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'      => 'nullable|string|max:255',
            'content'    => 'nullable|string',
            'tag'        => 'nullable|string|max:50',
            'date'       => 'nullable|string|max:50',
            'image_url'  => 'nullable|string',
            'image_file' => 'nullable|image|max:5120', // Max 5MB
        ]);

        // Handle uploaded image file
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('announcements', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        // Populate legacy aliases so old code still works
        $validated['description'] = $validated['content'] ?? null;
        $validated['event_date']  = $validated['date'] ?? null;

        $announcement = Announcement::create($validated);

        return response()->json($announcement, 201);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $validated = $request->validate([
            'title'      => 'nullable|string|max:255',
            'content'    => 'nullable|string',
            'tag'        => 'nullable|string|max:50',
            'date'       => 'nullable|string|max:50',
            'image_url'  => 'nullable|string',
            'image_file' => 'nullable|image|max:5120',
        ]);

        // Handle uploaded image file
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('announcements', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        // Populate legacy aliases
        $validated['description'] = $validated['content'] ?? $announcement->description;
        $validated['event_date']  = $validated['date'] ?? $announcement->event_date;

        $announcement->update($validated);

        return response()->json($announcement);
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);

        // Delete associated image if stored locally
        if ($announcement->image_url && str_starts_with($announcement->image_url, '/storage/')) {
            $relativePath = str_replace('/storage/', '', $announcement->image_url);
            Storage::disk('public')->delete($relativePath);
        }

        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted successfully']);
    }
}
