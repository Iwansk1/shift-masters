"use client";

import React, { useEffect, useState, useRef } from "react";
import { Gauge } from "@/components/Gauge";
import { ThrottleSlider } from "@/components/ThrottleSlider";
import { ManualShifter } from "@/components/GearShifter";
import { calculateRPM, calculateSpeed } from "@/lib/GearboxLogic";
import { vehicles } from "@/lib/vehicles";
import { VehicleSpec } from "@/lib/types";
import { ShiftLight } from "./ShiftLight";

export default function SimulatorCanvas() {
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleSpec>(
        vehicles[0]
    );

    const [gear, setGear] = useState<number>(1);
    const [throttle, setThrottle] = useState<number>(0.1);
    const [rpm, setRPM] = useState<number>(selectedVehicle.idleRPM);
    const [speed, setSpeed] = useState<number>(0);

    const throttleStep = 0.05;

    const rpmRef = useRef(rpm);
    const prevGearRef = useRef(gear);
    const speedRef = useRef(speed);

    useEffect(() => {
        rpmRef.current = rpm;
    }, [rpm]);

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    const handleShiftUp = () => {
        setGear((g) => (g < selectedVehicle.gearRatios.length - 1 ? g + 1 : g));
    };

    const handleShiftDown = () => {
        setGear((g) => (g > 1 ? g - 1 : g));
    };

    const increaseThrottle = () => {
        setThrottle((t) => Math.min(t + throttleStep, 1));
    };

    const decreaseThrottle = () => {
        setThrottle((t) => Math.max(t - throttleStep, 0));
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.repeat) return;

            switch (event.key.toLowerCase()) {
                case "q":
                    handleShiftDown();
                    break;
                case "e":
                    handleShiftUp();
                    break;
                case "w":
                    increaseThrottle();
                    break;
                case "s":
                    decreaseThrottle();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Adjust RPM based on gear ratio during shifts
    useEffect(() => {
        if (prevGearRef.current !== gear) {
            const prevRatio =
                selectedVehicle.gearRatios[prevGearRef.current] || 0;
            const newRatio = selectedVehicle.gearRatios[gear];

            if (prevRatio && newRatio) {
                const rpmAfterShift = rpm * (newRatio / prevRatio);
                const cappedRPM = Math.min(
                    rpmAfterShift,
                    selectedVehicle.maxRPM
                );
                setRPM(cappedRPM);
                rpmRef.current = cappedRPM;
            } else {
                setRPM(selectedVehicle.idleRPM);
                rpmRef.current = selectedVehicle.idleRPM;
            }

            prevGearRef.current = gear;
        }
    }, [gear, rpm, selectedVehicle]);

    // Update RPM and Speed in intervals
    useEffect(() => {
        let lastUpdate = Date.now();

        const interval = setInterval(() => {
            const now = Date.now();
            const timeElapsed = now - lastUpdate;
            lastUpdate = now;

            const newRPM = calculateRPM(
                rpmRef.current,
                gear,
                throttle,
                timeElapsed,
                speedRef.current,
                selectedVehicle
            );
            rpmRef.current = newRPM;
            setRPM(newRPM);

            const newSpeed = calculateSpeed(newRPM, gear, selectedVehicle);
            speedRef.current = newSpeed;
            setSpeed(newSpeed);
        }, 25);

        return () => clearInterval(interval);
    }, [gear, throttle, selectedVehicle]);

    return (
        <div className="p-4 bg-black text-white rounded-xl shadow-xl w-full max-w-md mx-auto mt-8 text-center space-y-4">
            <h2 className="text-xl font-bold">Shift Master Simulator</h2>

            <select
                value={selectedVehicle.id}
                onChange={(e) => {
                    const newVehicle = vehicles.find(
                        (v) => v.id === e.target.value
                    );
                    if (newVehicle) {
                        setSelectedVehicle(newVehicle);
                        setGear(1);
                        setRPM(newVehicle.idleRPM);
                        setSpeed(0);
                        rpmRef.current = newVehicle.idleRPM;
                        prevGearRef.current = 1;
                        speedRef.current = 0;
                    }
                }}
                className="mb-4 p-2 rounded bg-gray-800 text-white"
            >
                {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                        {v.name}
                    </option>
                ))}
            </select>
            <ShiftLight rpm={rpm} maxRPM={selectedVehicle.maxRPM} />

            <div className="flex justify-center space-x-8 mt-6">
                <Gauge
                    label="RPM"
                    value={rpm}
                    maxValue={selectedVehicle.maxRPM}
                    unit="rpm"
                />
                <Gauge label="Speed" value={speed} maxValue={250} unit="km/h" />
            </div>

            <ThrottleSlider throttle={throttle} onChange={setThrottle} />

            <ManualShifter
                currentGear={gear}
                onGearChange={setGear}
                maxGear={selectedVehicle.gearRatios.length - 1}
            />

            <div className="flex justify-center space-x-4 pt-4">
                <button
                    onClick={handleShiftDown}
                    className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
                >
                    Shift Down (Q)
                </button>
                <button
                    onClick={handleShiftUp}
                    className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600"
                >
                    Shift Up (E)
                </button>
            </div>

            <p className="mt-4 text-sm text-gray-400">
                Controls: <br />
                Throttle Down: S | Throttle Up: W
            </p>
        </div>
    );
}
