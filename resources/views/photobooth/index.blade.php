@extends('layouts.app')

@section('content')
<div class="min-h-screen animated-bg py-12" x-data="photobooth()">
    <div class="max-w-5xl mx-auto px-4">
        <div class="photobooth-panel p-6">
            <h1 class="text-4xl font-bold text-center text-white mb-6 drop-shadow-lg">🎉 Photo Booth Fun! 🎉</h1>

            <!-- Photo Strip Selection -->
            <div class="max-w-md mx-auto my-4">
                <div class="bg-white/80 rounded-xl p-4 shadow-inner">
                    <h2 class="text-xl font-semibold text-center mb-4 text-gray-800">Choose Your Strip</h2>
                    <div class="flex justify-center gap-4">
                        <button @click="setStripCount(3)" :class="stripCount === 3 ? 'bg-blue-600' : 'bg-blue-500'" class="control-btn text-white font-bold py-2 px-6 rounded-lg transition-all duration-200">3 Photos</button>
                        <button @click="setStripCount(4)" :class="stripCount === 4 ? 'bg-blue-600' : 'bg-blue-500'" class="control-btn text-white font-bold py-2 px-6 rounded-lg transition-all duration-200">4 Photos</button>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <!-- Camera Preview and Controls -->
                <div class="bg-white/80 rounded-xl p-4">
                    <div class="relative mb-4">
                        <video id="video" autoplay playsinline class="w-full h-auto rounded-lg shadow-lg border-4 border-gray-200" aria-label="Camera preview"></video>
                        <canvas id="canvas" class="hidden w-full h-auto rounded-lg shadow-lg"></canvas>
                        <div id="camera-loader" x-show="!stream" class="absolute top-4 left-4">
                            <div class="spinner" aria-hidden="true"></div>
                        </div>
                        <div id="countdown" class="absolute inset-0 flex items-center justify-center text-7xl font-bold text-white bg-black bg-opacity-65 rounded-lg hidden">3</div>
                        <div x-show="isCapturing" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                            <div class="text-white text-lg font-semibold">Capturing photo @{{ currentPhoto + 1 }} of @{{ stripCount }}...</div>
                        </div>
                    </div>

                    <!-- Controls -->
                    <div class="space-y-4">
                        <div class="flex flex-wrap gap-2 justify-center">
                            <button @click="startCamera()" :disabled="isLoading || stream" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg control-btn disabled:opacity-50 flex items-center gap-2" aria-pressed="false">
                                <span>📹</span> Start Camera
                            </button>
                            <button @click="startCapture()" :disabled="isLoading || !stream || isCapturing" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg control-btn disabled:opacity-50 flex items-center gap-2">
                                <span>📸</span> Start Capture
                            </button>
                        </div>

                        <!-- Filters -->
                        <div class="border-t pt-4">
                            <h3 class="text-lg font-semibold mb-3 text-center text-gray-800">Filters</h3>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <button @click="applyFilter('none')" :class="currentFilter === 'none' ? 'ring-2 ring-blue-500' : ''" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg">None</button>
                                <button @click="applyFilter('grayscale')" :class="currentFilter === 'grayscale' ? 'ring-2 ring-blue-500' : ''" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg">Grayscale</button>
                                <button @click="applyFilter('sepia')" :class="currentFilter === 'sepia' ? 'ring-2 ring-blue-500' : ''" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg">Sepia</button>
                                <button @click="applyFilter('brightness')" :class="currentFilter === 'brightness' ? 'ring-2 ring-blue-500' : ''" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg">Bright</button>
                                <button @click="applyFilter('contrast')" :class="currentFilter === 'contrast' ? 'ring-2 ring-blue-500' : ''" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg">Contrast</button>
                                <button @click="applyFilter('hue-rotate')" :class="currentFilter === 'hue-rotate' ? 'ring-2 ring-blue-500' : ''" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg">Hue</button>
                                <button @click="applyFilter('blur')" :class="currentFilter === 'blur' ? 'ring-2 ring-blue-500' : ''" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg">Blur</button>
                                <button @click="applyFilter('invert')" :class="currentFilter === 'invert' ? 'ring-2 ring-blue-500' : ''" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg">Invert</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Captured Photos and Strip -->
                <div class="bg-white/80 rounded-xl p-4">
                    <h2 class="text-2xl font-semibold mb-4 text-center text-gray-800">Your Photo Strip</h2>
                    <div id="photo-strip" class="text-center mb-4">
                        <p class="text-gray-500">No photos captured yet. Start capturing!</p>
                    </div>
                    <div class="flex flex-col gap-4">
                        <button @click="saveStrip()" x-show="photos.length === stripCount" class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg control-btn flex items-center justify-center gap-2">
                            <span>💾</span> Save Strip
                        </button>
                        <button @click="resetStrip()" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg control-btn flex items-center justify-center gap-2">
                            <span>🔄</span> Reset
                        </button>
                        <div class="text-center">
                            <a href="{{ route('photobooth.history') }}" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center gap-2">
                                <span>📚</span> View History
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="{{ asset('js/photobooth_index.js') }}"></script>
</div>
@endsection