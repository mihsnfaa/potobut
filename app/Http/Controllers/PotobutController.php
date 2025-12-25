<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Photo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PotobutController extends Controller
{
    public function index()
    {
        return view('potobut.index');
    }

    public function store(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:5120', // 5MB = 5120KB
        ]);

        $path = $request->file('photo')->store('photos', 'public');

        Photo::create([
            'user_id' => Auth::id(),
            'path' => $path,
        ]);

        return response()->json([
            'success' => true,
            'url' => Storage::url($path),
        ]);
    }

    public function history()
    {
        Log::info('Auth check: ' . Auth::check());
        if (Auth::check()) {
            $photos = Photo::where('user_id', Auth::id())->get();
        } else {
            $photos = Photo::all();
        }
        return view('potobut.history', compact('photos'));
    }
}