@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">Photo History</h1>

    @if($photos->count() > 0)
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @foreach($photos as $photo)
                <div class="border border-gray-300 rounded-lg p-4 shadow-lg">
                    <img src="{{ Storage::url($photo->path) }}" alt="Photo" class="w-full h-auto rounded-lg mb-4">
                    <a href="{{ Storage::url($photo->path) }}" download class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block text-center">Download</a>
                </div>
            @endforeach
        </div>
    @else
        <p class="text-center text-gray-500">No photos yet.</p>
    @endif

    <div class="text-center mt-8">
        <a href="{{ route('photobooth.index') }}" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Back to Photobooth</a>
    </div>
</div>
@endsection