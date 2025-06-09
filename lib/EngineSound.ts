"use client";

import { useEffect, useRef } from "react";

export default function EngineSound({
    rpm,
    minRPM,
    maxRPM,
    isEngineOn = true,
}: {
    rpm: number;
    minRPM: number;
    maxRPM: number;
    isEngineOn?: boolean;
}) {
    const idleRef = useRef<HTMLAudioElement | null>(null);
    const accelRef = useRef<HTMLAudioElement | null>(null);
    const decelRef = useRef<HTMLAudioElement | null>(null);
    const startupRef = useRef<HTMLAudioElement | null>(null);
    const shutdownRef = useRef<HTMLAudioElement | null>(null);
    const prevRPMRef = useRef<number>(rpm);
    const playedRef = useRef(false);

    // Utility for smooth volume transitions
    const smoothVolume = (
        audio: HTMLAudioElement,
        target: number,
        rate: number = 0.1
    ) => {
        audio.volume += (target - audio.volume) * rate;
    };

    useEffect(() => {
        if (playedRef.current) return;
        playedRef.current = true;

        idleRef.current = new Audio("/sounds/Exhaust idle.wav");
        accelRef.current = new Audio("/sounds/Engine acceleration.wav");
        decelRef.current = new Audio("/sounds/Engine deceleration.wav");
        startupRef.current = new Audio("/sounds/Start up.wav");
        shutdownRef.current = new Audio("/sounds/Shut down.wav");

        [idleRef, accelRef, decelRef].forEach((ref) => {
            if (ref.current) {
                ref.current.loop = true;
                ref.current.volume = 0;
            }
        });

        const playAll = async () => {
            try {
                await startupRef.current?.play();

                await Promise.all([
                    idleRef.current?.play(),
                    accelRef.current?.play(),
                    decelRef.current?.play(),
                ]);

                idleRef.current!.volume = 1;
            } catch (e) {
                console.warn("User interaction needed to start sound.");
            }
        };

        playAll();
    }, []);

    // Handle engine on/off state
    useEffect(() => {
        const idle = idleRef.current;
        const accel = accelRef.current;
        const decel = decelRef.current;

        if (!idle || !accel || !decel) return;

        if (!isEngineOn) {
            idle.pause();
            accel.pause();
            decel.pause();
            shutdownRef.current?.play().catch(() => {});
        } else {
            idle.play().catch(() => {});
            accel.play().catch(() => {});
            decel.play().catch(() => {});
        }
    }, [isEngineOn]);

    // Main sound update loop
    useEffect(() => {
        const idle = idleRef.current;
        const accel = accelRef.current;
        const decel = decelRef.current;
        if (!idle || !accel || !decel || !isEngineOn) return;

        const rpmRatio = Math.min(
            Math.max((rpm - minRPM) / (maxRPM - minRPM), 0),
            1
        );
        const rpmDelta = rpm - prevRPMRef.current;
        prevRPMRef.current = rpm;

        const isIdling = rpm < 1200;
        const isAccelerating = rpmDelta > 10;
        const isDecelerating = rpmDelta < -10;

        const pitch = 0.8 + rpmRatio * 0.5;

        idle.playbackRate = pitch;
        accel.playbackRate = pitch;
        decel.playbackRate = pitch;

        const updateVolumes = () => {
            if (isIdling) {
                smoothVolume(idle, 0.5);
                smoothVolume(accel, 0);
                smoothVolume(decel, 0);
            } else if (isAccelerating) {
                smoothVolume(idle, 0.2);
                smoothVolume(accel, 0.7);
                smoothVolume(decel, 0);
            } else if (isDecelerating) {
                smoothVolume(idle, 0.2);
                smoothVolume(accel, 0);
                smoothVolume(decel, 0.7);
            } else {
                // Cruising
                smoothVolume(idle, 0.4);
                smoothVolume(accel, 0.3);
                smoothVolume(decel, 0.3);
            }

            requestAnimationFrame(updateVolumes); // continue smooth transitions
        };

        updateVolumes();
    }, [rpm, minRPM, maxRPM, isEngineOn]);

    return null;
}
