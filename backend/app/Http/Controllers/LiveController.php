<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\LiveSetting;


class LiveController extends Controller
{
    private function getSettings()
    {
        return LiveSetting::firstOrCreate(['id' => 1], [
            'is_live' => false,
            'overlay_opacity' => 0.5
        ]);
    }

    public function index()
    {
        return response()->json($this->getSettings());
    }

    public function update(Request $request)
    {
        $settings = $this->getSettings();
        $settings->update($request->all());
        return response()->json($settings);
    }
}
