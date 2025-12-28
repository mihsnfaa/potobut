<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PotobutController;

// Landing page
Route::view('/', 'welcome')->name('welcome');

// Pilih layout step (UI only)
Route::view('/pilih-layout', 'pilih-layout')->name('pilih-layout');

// Mode step (Snap or Select)
Route::view('/mode', 'mode')->name('mode');
Route::view('/poto', 'poto')->name('poto');

Route::view('/edit', 'edit')->name('edit');

// Backend potobut endpoints removed — app currently handles flow client-side.

// Minimal backend endpoints (optional for API uploads/history). These do not affect client UI.
Route::post('/api/potobut', [PotobutController::class, 'store'])->name('potobut.store');
Route::get('/potobut/history', [PotobutController::class, 'history'])->name('potobut.history');
