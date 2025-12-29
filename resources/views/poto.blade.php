@extends('layouts.app')

@section('title', 'Poto - Potobut')

@section('content')
    @vite(['resources/js/poto.js'])
    <div class="min-h-screen relative overflow-hidden bg-transparent text-white">

        <main role="main"
            class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center">
            <div class="w-full max-w-5xl mx-auto">
                <div class="card-container bg-[#F8FAFC] rounded-2xl p-6 sm:p-8 lg:p-12 shadow-xl border border-white/20 flex flex-col space-y-6 sm:space-y-8 md:space-y-10"
                    data-aos="fade" data-aos-duration="900">
                    @php
                        $steps = ['Layout', 'Mode', 'Poto', 'Edit'];
                        $active = 3; // Poto active
                    @endphp

                    @include('partials.stepper', ['steps' => $steps, 'active' => $active])

                    <h2 data-aos="fade-up" data-aos-duration="700" data-aos-delay="200" data-aos-easing="ease-out-cubic"
                        class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-red-600 mb-4 sm:mb-4 md:mb-6">Snap your
                        pics!</h2>
                    <p data-aos="fade-up" data-aos-duration="700" data-aos-delay="300" data-aos-easing="ease-out-cubic"
                        class="text-red-700 mb-4 sm:mb-6 md:mb-8">Siap mengambil atau memilih foto sesuai layout yang
                        dipilih sebelumnya.</p>

                    <!-- Dynamic content area: camera or gallery -->
                    <div id="potoContent" class="mb-6"></div>

                    <div class="text-gray-700 font-medium mb-6 sm:mb-8" id="potoStatus">Status: idle</div>

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
