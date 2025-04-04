<?php

use App\Http\Controllers\ListingController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TypeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Bulk Create Routes
    Route::get('/listings/bulk-create', [ListingController::class, 'bulkCreate']);
    Route::post('/listings/bulk', [ListingController::class, 'storeBulk']);

    // Listings Resource
    Route::resource('listings', ListingController::class);
    
    // Tags Resource
    Route::resource('tags', TagController::class)->only(['index', 'store', 'destroy']);

    // Types Resource
    Route::resource('types', TypeController::class)->only(['index', 'store', 'destroy']);

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
