<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\BoardMember;
use App\Models\GalleryItem;

class ManagementController extends Controller
{
    // BOARD MEMBERS
    public function indexBoardMembers()
    {
        return response()->json(BoardMember::orderBy('order')->get());
    }

    public function storeBoardMember(Request $request)
    {
        $data = $request->validate([
            'id' => 'nullable|integer',
            'name' => 'required|string',
            'role' => 'required|string',
            'type' => 'nullable|string',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'fullscreen_image_url' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        $member = BoardMember::updateOrCreate(
            ['id' => $data['id'] ?? null],
            $data
        );

        return response()->json($member);
    }

    public function deleteBoardMember($id)
    {
        BoardMember::destroy($id);
        return response()->json(['success' => true]);
    }

    // GALLERY ITEMS
    public function indexGalleryItems()
    {
        return response()->json(GalleryItem::orderBy('order')->get());
    }

    public function storeGalleryItem(Request $request)
    {
        $data = $request->validate([
            'id' => 'nullable|integer',
            'title' => 'nullable|string',
            'description' => 'nullable|string',
            'image_url' => 'required|string',
            'order' => 'nullable|integer',
        ]);

        $item = GalleryItem::updateOrCreate(
            ['id' => $data['id'] ?? null],
            $data
        );

        return response()->json($item);
    }

    public function deleteGalleryItem($id)
    {
        GalleryItem::destroy($id);
        return response()->json(['success' => true]);
    }
}
