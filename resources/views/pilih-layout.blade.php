@extends('layouts.app')

@section('title', 'Pilih layout - Potobut')

@section('content')
    @vite(['resources/js/pilih-layout.js'])
    <div class="min-h-screen relative overflow-hidden bg-transparent text-white">

        <main role="main"
            class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center">
            <div class="w-full max-w-5xl mx-auto">
                <div class="card-container bg-[#F8FAFC] rounded-2xl p-6 sm:p-8 lg:p-12 shadow-xl border border-white/20 flex flex-col space-y-6 sm:space-y-8 md:space-y-10"
                    data-aos="fade" data-aos-duration="900">
                    <!-- Horizontal Stepper (Layout, Mode, Poto, Edit) with labels under circles -->
                    @php
                        $steps = ['Layout', 'Mode', 'Poto', 'Edit'];
                        $active = 1; // Layout active
                    @endphp

                    @include('partials.stepper', ['steps' => $steps, 'active' => $active])

                    <!-- Header -->
                    <h2 data-aos="fade-up" data-aos-duration="700" data-aos-delay="200" data-aos-easing="ease-out-cubic"
                        class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-red-600 mb-4 sm:mb-4 md:mb-6 mt-6">
                        Pilih layout</h2>
                        <p data-aos="fade-up" data-aos-duration="700" data-aos-delay="300" data-aos-easing="ease-out-cubic"
                            class="text-red-700 mb-4 sm:mb-6 md:mb-8">Pilih layoutnya terserah kamu, pokoknya bebas, sesuai selera 🙏</p>
                        <!-- Cards -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 mb-6">
                            <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="400"
                                data-aos-easing="ease-out-cubic" role="button" tabindex="0"
                                class="layout-card cursor-pointer rounded-xl bg-white text-[#0F172A] p-6 shadow-sm border border-gray-200 transform transition duration-200 hover:-translate-y-1 flex flex-col"
                                data-value="2">
                                <div class="mb-4">
                                    <!-- placeholder: two-photo layout (iconic, small) -->
                                    <div class="bg-gray-100 rounded-md p-4 flex flex-col items-center space-y-3 w-full">
                                        <div class="w-24 sm:w-28 md:w-32 bg-red-100 rounded-2xl h-8 sm:h-10 md:h-12"></div>
                                        <div class="w-24 sm:w-28 md:w-32 bg-red-100 rounded-2xl h-8 sm:h-10 md:h-12"></div>
                                    </div>
                                </div>
                                <div class="text-sm font-medium mt-2">Layout 2 foto</div>
                            </div>

                            <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="500"
                                data-aos-easing="ease-out-cubic" role="button" tabindex="0"
                                class="layout-card cursor-pointer rounded-xl bg-white text-[#0F172A] p-4 sm:p-6 shadow-sm border border-gray-200 transform transition duration-200 hover:-translate-y-1 flex flex-col"
                                data-value="3">
                                <div class="mb-4">
                                    <!-- placeholder: three-photo layout (iconic, small) -->
                                    <div class="bg-gray-100 rounded-md p-4 flex flex-col items-center space-y-3 w-full">
                                        <div class="w-24 sm:w-28 md:w-32 bg-red-100 rounded-2xl h-7 sm:h-9 md:h-11"></div>
                                        <div class="w-24 sm:w-28 md:w-32 bg-red-100 rounded-2xl h-7 sm:h-9 md:h-11"></div>
                                        <div class="w-24 sm:w-28 md:w-32 bg-red-100 rounded-2xl h-7 sm:h-9 md:h-11"></div>
                                    </div>
                                </div>
                                <div class="text-sm font-medium mt-2">Layout 3 foto</div>
                            </div>

                            <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="600"
                                data-aos-easing="ease-out-cubic" role="button" tabindex="0"
                                class="layout-card cursor-pointer rounded-xl bg-white text-[#0F172A] p-4 sm:p-6 shadow-sm border border-gray-200 transform transition duration-200 hover:-translate-y-1 flex flex-col"
                                data-value="4">
                                <div class="mb-4">
                                    <!-- placeholder: four-photo layout (iconic vertical strip) -->
                                    <div class="bg-gray-100 rounded-md p-4 flex flex-col items-center space-y-3 w-full">
                                        <div class="w-20 sm:w-24 md:w-28 bg-red-100 rounded-2xl h-6 sm:h-8 md:h-10"></div>
                                        <div class="w-20 sm:w-24 md:w-28 bg-red-100 rounded-2xl h-6 sm:h-8 md:h-10"></div>
                                        <div class="w-20 sm:w-24 md:w-28 bg-red-100 rounded-2xl h-6 sm:h-8 md:h-10"></div>
                                        <div class="w-20 sm:w-24 md:w-28 bg-red-100 rounded-2xl h-6 sm:h-8 md:h-10"></div>
                                    </div>
                                </div>
                                <div class="text-sm font-medium mt-2">Layout 4 foto</div>
                            </div>
                        </div>

                        <!-- Selected status -->
                        <div data-aos="fade" data-aos-duration="600" data-aos-delay="700" data-aos-easing="ease-out-cubic"
                            class="text-gray-700 font-medium mb-6 sm:mb-8" id="selectedStatus">Selected: none</div>

                        <!-- Navigation -->
                        <div class="flex flex-col-reverse sm:flex-row items-center sm:justify-between gap-3 sm:gap-0">
                            <button data-aos="fade-right" data-aos-delay="800" data-aos-duration="500"
                                data-aos-easing="ease-out-cubic" id="btnBack"
                                class="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-full border border-red-200 text-red-700 bg-transparent transition duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer">BACK</button>
                            <button data-aos="fade-left" data-aos-delay="800" data-aos-duration="500"
                                data-aos-easing="ease-out-cubic" id="btnNext" disabled
                                class="w-full sm:w-auto px-6 py-3 sm:py-2 rounded-full bg-red-500 text-white font-semibold disabled:opacity-80 disabled:cursor-not-allowed">NEXT</button>
                        </div>

                    </div>
                </div>
        </main>
    </div>
@endsection
