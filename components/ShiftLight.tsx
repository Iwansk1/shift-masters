import React, { useEffect, useState, useRef } from "react";

export function ShiftLight({ rpm, maxRPM }: { rpm: number; maxRPM: number }) {
    const [visible, setVisible] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const shiftThreshold = maxRPM * 0.9;
    const blinkSpeed = rpm >= maxRPM ? 100 : 300;
    const shouldBlink = rpm >= shiftThreshold;

    useEffect(() => {
        if (shouldBlink && !intervalRef.current) {
            // Start blinking
            intervalRef.current = setInterval(() => {
                setVisible((prev) => !prev);
            }, blinkSpeed);
        } else if (!shouldBlink && intervalRef.current) {
            // Stop blinking
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setVisible(false); // Ensure it's off when not blinking
        }

        // Update blink speed dynamically
        if (intervalRef.current && shouldBlink) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                setVisible((prev) => !prev);
            }, blinkSpeed);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [shouldBlink, blinkSpeed]);

    return (
        <div
            className={`w-6 h-6 mx-auto mt-2 rounded-full transition-colors duration-150 ${
                visible
                    ? rpm >= maxRPM
                        ? "bg-red-700"
                        : "bg-red-400"
                    : "bg-gray-800"
            } shadow-md`}
            title="Shift Indicator"
        />
    );
}
