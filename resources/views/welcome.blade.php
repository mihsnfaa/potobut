@extends('layouts.app')

@section('title', 'Potobut')

@section('content')
    <div class="min-h-screen relative overflow-hidden bg-[#2b0505] text-white">
        <div id="stars" aria-hidden="true" class="pointer-events-none absolute inset-0"></div>

        <main role="main"
            class="relative z-10 flex flex-col items-center justify-center min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 data-aos="fade" data-aos-duration="1100" data-aos-delay="300" data-aos-easing="ease-out-cubic"
                class="text-white font-medium text-4xl sm:text-6xl md:text-7xl lg:text-[8rem] leading-tight tracking-tight drop-shadow-lg break-words">
                Potobut</h1>
            <p data-aos="fade" data-aos-duration="1200" data-aos-delay="600" data-aos-easing="ease-out-cubic"
                class="mt-4 text-base sm:text-lg text-white/70">potobut gausah ribet.</p>

            <div class="mt-10">
                <button id="startBtn" aria-label="Mulai Potobut" data-aos="fade" data-aos-duration="1200"
                    data-aos-delay="1000" data-aos-easing="ease-out-cubic"
                    class="transform-gpu bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base tracking-wide shadow-lg hover:shadow-xl transition transform duration-200 ease-out hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-transparent">
                    MULAI
                </button>
            </div>
        </main>
    </div>
@endsection
