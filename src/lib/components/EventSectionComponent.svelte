<script lang="ts">
    import { onDestroy } from 'svelte';

    // Image modal state
    let selectedImage: { src: string; alt: string } | null = null;

    const flyers = [
        {
            src: '/events/neurotech_panel_media/panel_flyer_1.png',
            alt: 'Neurotech Panel Official Flyer'
        },
        {
            src: '/events/neurotech_panel_media/panel_flyer_2.png',
            alt: 'Neurotech Panel Speakers and Moderators'
        }
    ];

    const speakers = [
        {
            name: 'Dr. Dario Ringach',
            topic: 'Neural population coding & computational neuroscience'
        },
        {
            name: 'Dr. Paul Mathews',
            topic: 'Brain circuits, behavior & therapeutic insights'
        },
        {
            name: 'Dr. Ahmet Arac',
            topic: 'Motor decoding & neuro-rehabilitation'
        },
        {
            name: 'Dr. Jonathan Kao',
            topic: 'Brain-machine interfaces powered by AI'
        },
        {
            name: 'Dr. Wentai Liu',
            topic: 'FDA-approved neural prosthetics & implantable tech'
        }
    ];

    function openModal(img: { src: string; alt: string }) {
        selectedImage = img;
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', handleKeydown);
        }
    }

    function closeModal() {
        selectedImage = null;
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', handleKeydown);
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') closeModal();
    }

    onDestroy(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', handleKeydown);
        }
    });
</script>

<!-- Events Section -->
<div class="mx-auto px-3 w-full md:w-3/4 lg:w-3/5 md:mt-6 z-20 mb-6">
    <div class="flex flex-col h-full">
        <!-- Section Header -->
        <div
            class="flex-none w-full bg-gradient-to-r from-[#315AB0] to-[#07d1f9c1] p-3 rounded-t-lg md:bg-transparent md:p-0 md:rounded-none md:mb-3"
        >
            <h2 class="text-3xl font-bold text-zinc-100 md:text-zinc-900">Events</h2>
        </div>

        <!-- Event Card -->
        <div
            class="grow w-full duration-200 ease-in bg-white md:bg-white/75 rounded-b-lg shadow hover:shadow-lg overflow-hidden p-5 md:p-7"
        >
            <!-- Event Badge and Date -->
            <div class="flex flex-wrap items-center gap-2 mb-3">
                <span class="bg-[#315AB0] text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Panel Discussion
                </span>
                <span class="text-sm font-medium text-zinc-600">
                    Nov 20, 2025 • 6:00 PM – 7:00 PM PST • Gonda 1357
                </span>
            </div>

            <!-- Event Title -->
            <h3 class="text-2xl md:text-3xl font-bold text-zinc-900 mb-2 leading-tight">
                Neurotechnology Panel: Decoding the Brain From Neural Signals to Neurotech
            </h3>

            <!-- Host & Moderators -->
            <p class="text-sm text-zinc-600 mb-4">
                <span class="font-semibold text-zinc-800">Hosted by CruX</span> | UCLA Neurotechnology Organization
                <span class="hidden sm:inline mx-1.5 text-zinc-400">•</span>
                <span class="block sm:inline mt-1 sm:mt-0 text-zinc-600">
                    Co-moderated by <span class="font-medium text-zinc-800">Chandni Sacheti</span> &amp; <span class="font-medium text-zinc-800">Shivang Kulkarni</span>
                </span>
            </p>

            <!-- Flyer Images & Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start my-5">
                <!-- Flyers Display -->
                <div class="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-center">
                    <div class="flex flex-row gap-3 w-full justify-center">
                        {#each flyers as flyer}
                            <button
                                type="button"
                                class="relative group cursor-pointer overflow-hidden rounded-lg shadow-md border border-zinc-200 bg-zinc-900 max-w-[210px] flex-1 text-left p-0 focus:outline-none focus:ring-2 focus:ring-[#315AB0]"
                                on:click={() => openModal(flyer)}
                            >
                                <img
                                    src={flyer.src}
                                    alt={flyer.alt}
                                    class="w-full h-auto object-cover transform duration-200 ease-out group-hover:scale-105 pointer-events-none"
                                />
                                <span
                                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold tracking-wider uppercase transition-opacity"
                                >
                                    Click to Enlarge
                                </span>
                            </button>
                        {/each}
                    </div>
                    <p class="text-xs text-zinc-500 italic text-center">
                        Click either flyer to view high-resolution poster
                    </p>
                </div>

                <!-- Event Description and Speakers -->
                <div class="lg:col-span-7 flex flex-col gap-4 text-zinc-700">
                    <div class="text-base leading-relaxed space-y-3">
                        <p>
                            From how neurons encode information to how we translate those signals into cutting-edge technologies. This dynamic panel brought together UCLA’s leading minds across the neurotech spectrum to showcase how foundational brain science transforms into real-world devices and systems.
                        </p>
                        <p>
                            Experts in neural coding, circuit neuroscience, brain-machine interfaces, and clinical neuroengineering explored:
                        </p>
                        <ul class="list-disc list-inside space-y-1 text-sm text-zinc-600 pl-1">
                            <li>Cutting-edge trends in decoding brain signals and building neurotech</li>
                            <li>How neural theory, engineering, and clinical translation converge</li>
                            <li>Pathways for UCLA students to get involved in research labs and industry</li>
                        </ul>
                    </div>

                    <!-- Featured Speakers -->
                    <div class="mt-2 pt-3 border-t border-zinc-200">
                        <h4 class="text-sm font-semibold uppercase tracking-wider text-zinc-800 mb-2.5">
                            Featured Panelists
                        </h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                            {#each speakers as speaker}
                                <div class="bg-zinc-50/80 border border-zinc-200/80 rounded-md p-2.5">
                                    <div class="font-semibold text-zinc-900">{speaker.name}</div>
                                    <div class="text-xs text-zinc-600 mt-0.5">{speaker.topic}</div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Audio Recording Player -->
            <div class="mt-6 pt-5 border-t border-zinc-200 bg-gradient-to-r from-zinc-50 to-blue-50/40 p-4 md:p-5 rounded-lg border">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div class="flex items-center gap-2">
                        <span class="flex h-3 w-3 relative">
                            <span class="relative inline-flex rounded-full h-3 w-3 bg-[#315AB0]"></span>
                        </span>
                        <h4 class="text-base font-bold text-zinc-900">
                            Listen to the Panel Recording
                        </h4>
                    </div>
                    <a
                        href="/events/neurotech_panel_media/panel_audio.mp3"
                        download="Neurotech_Panel_Recording.mp3"
                        class="text-xs font-mono text-[#315AB0] hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        Download Audio (.mp3)
                    </a>
                </div>
                <p class="text-xs text-zinc-500 mb-3">
                    Tune in to the complete live conversation with UCLA researchers discussing brain-machine interfaces, motor decoding, and neuroprosthetics.
                </p>
                <audio
                    controls
                    preload="metadata"
                    class="w-full accent-[#315AB0] rounded"
                    aria-label="Neurotechnology Panel Audio Recording"
                >
                    <source src="/events/neurotech_panel_media/panel_audio.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            </div>
        </div>
    </div>
</div>

<!-- High-Resolution Flyer Modal -->
{#if selectedImage}
    <!-- Backdrop -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        aria-label="Close image viewer"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        on:click={closeModal}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && closeModal()}
    >
        <!-- Modal Content -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Flyer image preview"
            tabindex="-1"
            class="relative max-w-2xl max-h-[90vh] flex flex-col items-center"
            on:click|stopPropagation
        >
            <button
                type="button"
                aria-label="Close"
                class="absolute -top-10 right-0 text-white hover:text-zinc-300 text-2xl font-bold cursor-pointer"
                on:click={closeModal}
            >
                ✕
            </button>
            <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-zinc-700"
            />
        </div>
    </div>
{/if}