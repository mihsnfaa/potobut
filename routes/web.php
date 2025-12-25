<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PotobutController;

// Landing page
Route::view('/', 'welcome')->name('welcome');

// Pilih layout step (UI only)
Route::view('/pilih-layout', 'pilih-layout')->name('pilih-layout');

// Mode step (Snap or Select)
Route::view('/mode', 'mode')->name('mode');

Route::get('/potobut', [PotobutController::class, 'index'])->name('potobut.index');
Route::post('/potobut', [PotobutController::class, 'store'])->name('potobut.store');
Route::get('/potobut/history', [PotobutController::class, 'history'])->name('potobut.history');