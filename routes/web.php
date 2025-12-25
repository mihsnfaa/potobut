<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PhotoboothController;

// Landing page
Route::view('/', 'welcome')->name('welcome');

Route::get('/photobooth', [PhotoboothController::class, 'index'])->name('photobooth.index');
Route::post('/photobooth', [PhotoboothController::class, 'store'])->name('photobooth.store');
Route::get('/photobooth/history', [PhotoboothController::class, 'history'])->name('photobooth.history');
