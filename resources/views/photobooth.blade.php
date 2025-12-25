@extends('layouts.app')

@section('content')
<div class="min-h-screen animated-bg py-12">
    <div class="max-w-3xl mx-auto px-4">
        <div class="photobooth-panel p-6">
            <h1 class="text-3xl font-bold text-center mb-4">Photobooth</h1>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                    <div class="bg-white/80 rounded-lg p-4">
                        <h2 class="font-semibold mb-3">Upload Photo</h2>
                        <form id="photoForm" enctype="multipart/form-data">
                            <div class="mb-3">
                                <label for="photo" class="form-label">Pilih Foto</label>
                                <input type="file" class="form-control" id="photo" name="photo" accept="image/*" required>
                            </div>
                            <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-shadow shadow-sm">Upload</button>
                        </form>
                        <div id="result" class="mt-3"></div>

                        <div class="mt-4 text-center">
                            <a href="{{ route('photobooth.history') }}" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-shadow shadow-sm">Lihat History</a>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="bg-white/80 rounded-lg p-4 text-center">
                        <h3 class="font-semibold mb-3">Tips</h3>
                        <ul class="text-left list-disc ml-5 text-sm text-gray-700">
                            <li>Gunakan browser yang mendukung upload file.</li>
                            <li>Periksa ukuran file maksimal 5MB.</li>
                            <li>Gunakan tombol history untuk melihat upload sebelumnya.</li>
                        </ul>
                        <div class="mt-4">
                            <div class="spinner mx-auto" id="upload-spinner" style="display:none" aria-hidden="true"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    window.PHOTOBOOTH = { storeRoute: '{{ route("photobooth.store") }}' };
</script>
<script src="{{ asset('js/photobooth_upload.js') }}"></script>
@endsection