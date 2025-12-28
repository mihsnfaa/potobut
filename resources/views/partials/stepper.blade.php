@php
    // expects $steps (array of labels) and $active (1-based index)
    $count = is_countable($steps) ? count($steps) : 0;
    $activeIndex = isset($active) ? intval($active) : 1;
@endphp
<div class="mb-6 sm:mb-8">
    <div class="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
        <div class="flex items-center justify-center space-x-2 sm:space-x-6 md:space-x-8">
            @foreach ($steps as $i => $label)
                @php
                    $stepIndex = $i + 1;
                    $isActive = $stepIndex === $activeIndex;
                @endphp

                <div class="flex flex-col items-center">
                    <div data-aos="fade-down" data-aos-duration="600" data-aos-easing="ease-out-cubic"
                        data-aos-delay="{{ $i * 100 }}"
                        class="step-circle w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm md:text-base font-semibold transition-all duration-200 {{ $isActive ? 'bg-red-500 text-white shadow-md' : 'bg-white/30 text-red-300' }}">
                        {{ $stepIndex }}
                    </div>
                    <div class="mt-2 text-sm sm:text-sm md:text-sm {{ $isActive ? 'text-red-600 font-semibold' : 'text-red-400' }}">{{ $label }}</div>
                </div>

                @if ($i < $count - 1)
                    <div class="flex items-center">
                        <div class="w-8 sm:w-20 h-0.5 bg-red-200 mx-3"></div>
                    </div>
                @endif
            @endforeach
        </div>
    </div>
</div>
