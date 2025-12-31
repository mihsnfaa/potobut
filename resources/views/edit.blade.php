@extends('layouts.app')

@section('title', 'Edit - Potobut')

@section('content')
    @vite(['resources/js/edit.js'])
    <div class="min-h-screen relative overflow-hidden bg-transparent text-white">

        <main role="main" class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center">
            <div class="w-full max-w-5xl mx-auto">
                <div class="card-container bg-[#F8FAFC] rounded-2xl p-6 sm:p-8 lg:p-12 shadow-xl border border-white/20 flex flex-col space-y-6 sm:space-y-8 md:space-y-10" data-aos="fade" data-aos-duration="900">
                    @php
                        $steps = ['Layout', 'Mode', 'Poto', 'Edit'];
                        $active = 4; // Edit active
                    @endphp

                    @include('partials.stepper', ['steps' => $steps, 'active' => $active])

                    <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-red-600 mb-2">Pick a style!</h2>
                    <p class="text-red-700 mb-4 sm:mb-6 md:mb-8">Give your photos a final touch — choose background, pattern, filter and a short caption.</p>

                    <div id="editApp" class="w-full flex flex-col sm:flex-row items-start gap-6">
                        <!-- Preview strip -->
                        <div id="previewColumn" class="flex-1 flex flex-col items-center">
                            <div id="previewStrip" class="w-full max-w-xs flex flex-col items-center space-y-3 p-4 rounded-lg shadow-sm border border-white/10 bg-white/50"></div>
                            <!-- dedicated holder for composed thumbnail (keeps slot previews intact) -->
                            <div id="composedPreviewHolder" class="w-full max-w-xs mt-4 flex items-center justify-center"></div>
                        </div>

                        <!-- Controls panel -->
                        <div id="controls" class="w-full sm:w-80 flex-shrink-0 bg-transparent">
                            <div class="space-y-4">
                                <div class="card p-4 rounded-2xl bg-[#F8FAFC] shadow-md shadow-pink-50 transition-all duration-200 hover:shadow-lg hover:ring-1 hover:ring-red-100">
                                    <div class="text-sm font-semibold text-red-600 mb-3">Background</div>
                                    <input id="bgColor" type="color" class="w-full h-10 p-0 rounded-lg border border-white/20 cursor-pointer" value="#E0F2FE">
                                    <div class="mt-3 flex gap-2">
                                        <button data-color="#E0F2FE" class="preset w-8 h-8 rounded-lg bg-[#E0F2FE] border border-white/20 cursor-pointer" aria-label="preset 1"></button>
                                        <button data-color="#F8FAFC" class="preset w-8 h-8 rounded-lg bg-[#F8FAFC] border border-white/20 cursor-pointer" aria-label="preset 2"></button>
                                        <button data-color="#E0F2FE" class="preset w-8 h-8 rounded-lg bg-[#E0F2FE] border border-white/20 cursor-pointer" aria-label="preset 3"></button>
                                        <button data-color="#F8FAFC" class="preset w-8 h-8 rounded-lg bg-[#F8FAFC] border border-white/20 cursor-pointer" aria-label="preset 4"></button>
                                    </div>
                                </div>

                                <div class="card p-4 rounded-2xl bg-[#F8FAFC] shadow-md transition-all duration-200 hover:shadow-lg hover:ring-1 hover:ring-red-100">
                                    <div class="text-sm font-semibold text-red-600 mb-3">Pattern</div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <button data-pattern="plain" class="pattern-option p-3 rounded-lg bg-white/20 cursor-pointer">Plain</button>
                                        <button data-pattern="polka" class="pattern-option p-3 rounded-lg bg-white/20 cursor-pointer">Polka dots</button>
                                        <button data-pattern="stripes" class="pattern-option p-3 rounded-lg bg-white/20 cursor-pointer">Stripes</button>
                                        <button data-pattern="dots-min" class="pattern-option p-3 rounded-lg bg-white/20 cursor-pointer">Minimal dots</button>
                                    </div>
                                </div>

                                <div class="card p-4 rounded-2xl bg-[#F8FAFC] shadow-md transition-all duration-200 hover:shadow-lg hover:ring-1 hover:ring-red-100">
                                    <div class="text-sm font-semibold text-red-600 mb-3">Filters</div>
                                    <div class="flex flex-wrap gap-2">
                                        <button data-filter="normal" class="filter-btn px-3 py-2 rounded-lg bg-white/20 cursor-pointer">Normal</button>
                                        <button data-filter="warm" class="filter-btn px-3 py-2 rounded-lg bg-white/20 cursor-pointer">Warm</button>
                                        <button data-filter="cool" class="filter-btn px-3 py-2 rounded-lg bg-white/20 cursor-pointer">Cool</button>
                                        <button data-filter="vintage" class="filter-btn px-3 py-2 rounded-lg bg-white/20 cursor-pointer">Vintage</button>
                                        <button data-filter="bw" class="filter-btn px-3 py-2 rounded-lg bg-white/20 cursor-pointer">B&amp;W</button>
                                    </div>
                                </div>

                                <div class="card p-4 rounded-2xl bg-[#F8FAFC] shadow-md transition-all duration-200 hover:shadow-lg hover:ring-1 hover:ring-red-100">
                                    <div class="text-sm font-semibold text-red-600 mb-3">Caption</div>
                                    <input id="captionInput" maxlength="10" type="text" placeholder="10 chars max" class="w-full p-3 rounded-lg border border-white/20 text-sm text-[#0F172A]" />
                                    <div class="mt-1 text-xs text-gray-600"><span id="captionCount">0</span> / 10</div>
                                </div>

                                <div class="pt-2">
                                    <div class="flex items-center gap-3">
                                        <button id="btnDownload" class="flex-1 px-4 py-2 rounded-full bg-red-500 text-white font-semibold transition duration-200 hover:scale-105 active:scale-95 cursor-pointer">Download Photo</button>
                                    </div>
                                    <div class="mt-3 flex items-center gap-3">
                                        <button id="btnBackEdit" class="flex-1 px-4 py-2 rounded-full border border-red-200 text-red-700 bg-transparent cursor-pointer">Back</button>
                                        <button id="btnAgain" class="flex-1 px-4 py-2 rounded-full bg-white/20 text-[#0F172A] cursor-pointer">Again</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    </div>
@endsection
