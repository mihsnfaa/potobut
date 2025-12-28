<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Potobut;
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
            'poto' => 'required|image|max:5120', // 5MB = 5120KB
        ]);

        $file = $request->file('poto');
        if (! $file) {
            return response()->json(['success' => false, 'message' => 'No file uploaded'], 422);
        }

        // store under a photos folder in the public disk
        $path = $file->store('photos', 'public');

        $potobut = Potobut::create([
            'user_id' => Auth::id(),
            'path' => $path,
        ]);

        return response()->json([
            'success' => true,
            'url' => Storage::url($path),
            'id' => $potobut->id,
        ]);
    }

    public function history()
    {
        Log::info('Auth check: ' . Auth::check());
        if (Auth::check()) {
            $photos = Potobut::where('user_id', Auth::id())->get();
        } else {
            $photos = Potobut::all();
        }
        return view('potobut.history', compact('photos'));
    }
}
