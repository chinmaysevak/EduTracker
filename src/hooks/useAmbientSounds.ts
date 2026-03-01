// ============================================
// Ambient Sounds Hook for Focus Mode
// ============================================
import { useState, useRef, useCallback, useEffect } from 'react';

export interface AmbientSound {
    id: string;
    name: string;
    icon: string;
    // We generate audio using oscillators and noise for offline-first approach
    type: 'brown-noise' | 'white-noise' | 'pink-noise' | 'rain' | 'binaural';
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
    { id: 'rain', name: 'Rain', icon: '🌧️', type: 'rain' },
    { id: 'brown-noise', name: 'Brown Noise', icon: '🟤', type: 'brown-noise' },
    { id: 'white-noise', name: 'White Noise', icon: '⚪', type: 'white-noise' },
    { id: 'pink-noise', name: 'Pink Noise', icon: '🩷', type: 'pink-noise' },
    { id: 'binaural', name: 'Focus Beats', icon: '🧠', type: 'binaural' },
];

export function useAmbientSounds() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSoundId, setCurrentSoundId] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.3);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodesRef = useRef<AudioNode[]>([]);
    const gainNodeRef = useRef<GainNode | null>(null);

    const stopSound = useCallback(() => {
        sourceNodesRef.current.forEach(node => {
            try {
                if (node instanceof AudioBufferSourceNode) {
                    node.stop();
                } else if (node instanceof OscillatorNode) {
                    node.stop();
                }
            } catch {
                // Already stopped
            }
        });
        sourceNodesRef.current = [];

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => { });
        }
        audioContextRef.current = null;
        gainNodeRef.current = null;
        setIsPlaying(false);
        setCurrentSoundId(null);
    }, []);

    // Create different noise types using Web Audio API
    const createNoise = useCallback((ctx: AudioContext, type: AmbientSound['type'], gainNode: GainNode) => {
        const bufferSize = ctx.sampleRate * 4; // 4 seconds of noise in a loop
        const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        const nodes: AudioNode[] = [];

        if (type === 'white-noise') {
            for (let channel = 0; channel < 2; channel++) {
                const data = buffer.getChannelData(channel);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(gainNode);
            source.start();
            nodes.push(source);
        } else if (type === 'brown-noise') {
            for (let channel = 0; channel < 2; channel++) {
                const data = buffer.getChannelData(channel);
                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    data[i] = (lastOut + 0.02 * white) / 1.02;
                    lastOut = data[i];
                    data[i] *= 3.5; // Compensate for volume
                }
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(gainNode);
            source.start();
            nodes.push(source);
        } else if (type === 'pink-noise') {
            for (let channel = 0; channel < 2; channel++) {
                const data = buffer.getChannelData(channel);
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    data[i] *= 0.11;
                    b6 = white * 0.115926;
                }
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(gainNode);
            source.start();
            nodes.push(source);
        } else if (type === 'rain') {
            // Rain = filtered white noise + occasional low rumbles
            for (let channel = 0; channel < 2; channel++) {
                const data = buffer.getChannelData(channel);
                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    // Mix brown + pink characteristics for rain-like sound
                    data[i] = (lastOut + 0.04 * white) / 1.04;
                    lastOut = data[i];
                    data[i] *= 4;
                    // Add occasional "drop" sounds
                    if (Math.random() < 0.001) {
                        data[i] += (Math.random() - 0.5) * 0.3;
                    }
                }
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            // Apply a bandpass filter for rainy character
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 800;
            filter.Q.value = 0.5;

            source.connect(filter);
            filter.connect(gainNode);
            source.start();
            nodes.push(source);
        } else if (type === 'binaural') {
            // Binaural beats: two slightly different frequencies (alpha waves ~10Hz difference for focus)
            const oscL = ctx.createOscillator();
            const oscR = ctx.createOscillator();
            const merger = ctx.createChannelMerger(2);

            oscL.frequency.value = 200; // Left ear
            oscR.frequency.value = 210; // Right ear (10Hz difference = alpha waves)
            oscL.type = 'sine';
            oscR.type = 'sine';

            const gainL = ctx.createGain();
            const gainR = ctx.createGain();
            gainL.gain.value = 0.5;
            gainR.gain.value = 0.5;

            oscL.connect(gainL);
            oscR.connect(gainR);
            gainL.connect(merger, 0, 0);
            gainR.connect(merger, 0, 1);
            merger.connect(gainNode);

            oscL.start();
            oscR.start();
            nodes.push(oscL, oscR);
        }

        return nodes;
    }, []);

    const playSound = useCallback((soundId: string) => {
        // Stop any existing sound first
        stopSound();

        const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
        if (!sound) return;

        try {
            const ctx = new AudioContext();
            audioContextRef.current = ctx;

            const gainNode = ctx.createGain();
            gainNode.gain.value = volume;
            gainNode.connect(ctx.destination);
            gainNodeRef.current = gainNode;

            const nodes = createNoise(ctx, sound.type, gainNode);
            sourceNodesRef.current = nodes;

            setIsPlaying(true);
            setCurrentSoundId(soundId);
        } catch (error) {
            console.error('Failed to play ambient sound:', error);
        }
    }, [volume, createNoise, stopSound]);

    const toggleSound = useCallback((soundId: string) => {
        if (currentSoundId === soundId && isPlaying) {
            stopSound();
        } else {
            playSound(soundId);
        }
    }, [currentSoundId, isPlaying, playSound, stopSound]);

    // Update volume in real-time
    const updateVolume = useCallback((newVolume: number) => {
        setVolume(newVolume);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = newVolume;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSound();
        };
    }, [stopSound]);

    return {
        isPlaying,
        currentSoundId,
        volume,
        playSound,
        stopSound,
        toggleSound,
        updateVolume,
        sounds: AMBIENT_SOUNDS
    };
}
