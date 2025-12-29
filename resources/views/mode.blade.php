@extends('layouts.app')

@section('title', 'Mode - Potobut')

@section('content')
    @vite(['resources/js/mode.js'])
    <div class="min-h-screen relative overflow-hidden bg-transparent text-white">

        <main role="main"
            class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center">
            <div class="w-full max-w-5xl mx-auto">
                <div class="card-container bg-[#F8FAFC] rounded-2xl p-6 sm:p-8 lg:p-12 shadow-xl border border-white/20 flex flex-col space-y-6 sm:space-y-8 md:space-y-10"
                    data-aos="fade" data-aos-duration="900">
                    @php
                        $steps = ['Layout', 'Mode', 'Poto', 'Edit'];
                        $active = 2; // Mode active
                    @endphp

                    @include('partials.stepper', ['steps' => $steps, 'active' => $active])

                    <h2 data-aos="fade-up" data-aos-duration="700" data-aos-delay="200" data-aos-easing="ease-out-cubic"
                        class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-red-600 mb-4 sm:mb-4 md:mb-6">Poto atau Upload?</h2>
                    <p data-aos="fade-up" data-aos-duration="700" data-aos-delay="300" data-aos-easing="ease-out-cubic"
                        class="text-red-700 mb-4 sm:mb-6 md:mb-8">Pilih mau poto atau mau upload poto dari galeri.</p>

                    <!-- Mode Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6">
                        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="400"
                            class="mode-card cursor-pointer rounded-xl bg-red-100 text-[#0F172A] p-6 sm:p-8 shadow-sm border border-transparent transform transition duration-200 hover:shadow-lg hover:scale-[1.01] flex flex-col items-center justify-center space-y-4"
                            data-value="snap" tabindex="0">
                            <!-- camera icon -->
                            <div class="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-600" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 7h2l1.5-2h11L19 7h2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                                    <circle cx="12" cy="13" r="3" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                            </div>
                            <div class="text-lg font-semibold text-red-700">Take a Picture</div>
                            <div class="text-sm text-red-600/80">Gunakan kamera untuk langsung memotret</div>
                        </div>

                        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="500"
                            class="mode-card cursor-pointer rounded-xl bg-red-100 text-[#0F172A] p-6 sm:p-8 shadow-sm border border-transparent transform transition duration-200 hover:shadow-lg hover:scale-[1.01] flex flex-col items-center justify-center space-y-4"
                            data-value="select" tabindex="0">
                            <!-- gallery icon -->
                            <div class="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-600" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 7l-6 6-4-4-6 6" />
                                </svg>
                            </div>
                            <div class="text-lg font-semibold text-red-700">Choose from Gallery</div>
                            <div class="text-sm text-red-600/80">Pilih foto yang sudah ada di perangkatmu</div>
                        </div>
                    </div>

                    <div class="text-gray-700 font-medium mb-6 sm:mb-8" id="modeStatus">Mode: none</div>

                    <!-- Navigation -->
                    <div class="flex flex-col-reverse sm:flex-row items-center sm:justify-between gap-3 sm:gap-0">
                        <button id="btnBack" data-aos="fade-right" data-aos-delay="800" data-aos-duration="500"
                            data-aos-easing="ease-out-cubic"
                            class="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-full border border-red-200 text-red-700 bg-transparent transition duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer">BACK</button>
                        <button id="btnNext" data-aos="fade-left" data-aos-delay="800" data-aos-duration="500"
                            data-aos-easing="ease-out-cubic" disabled
                            class="w-full sm:w-auto px-6 py-3 sm:py-2 rounded-full bg-red-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed">NEXT</button>
                    </div>
                </div>
            </div>
        </main>
    </div>
@endsection
