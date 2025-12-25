@extends('layouts.app')

@section('title', 'Potobut')

<!-- removed unused 'fullpage' section -->

@section('content')
<div class="min-h-screen relative overflow-hidden bg-[#2b0505] text-white">
    <div id="stars" aria-hidden="true" class="pointer-events-none absolute inset-0"></div>

    <main role="main" class="relative z-10 flex flex-col items-center justify-center min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-white font-medium text-4xl sm:text-6xl md:text-7xl lg:text-[8rem] leading-tight tracking-tight drop-shadow-lg break-words">Potobut</h1>
        <p class="mt-4 text-base sm:text-lg text-white/70">potobut gausah ribet.</p>

        <div class="mt-10">
            <button id="startBtn" aria-label="Mulai PhotoBooth"
                class="transform-gpu transition-all duration-300 hover:scale-105 active:scale-95 bg-transparent border border-white text-white rounded-full px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base tracking-wide shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2">
                MULAI
            </button>
        </div>
    </main>
</div>
@endsection
