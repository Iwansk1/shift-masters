import React from "react";

interface ThrottleSliderProps {
    throttle: number; // 0 to 1
    onChange: (value: number) => void;
}

export function ThrottleSlider({ throttle, onChange }: ThrottleSliderProps) {
    return (
        <div className="w-full max-w-md mx-auto mt-6 px-4">
            <label
                htmlFor="throttle"
                className="block mb-2 text-white font-semibold"
            >
                Throttle: {Math.round(throttle * 100)}%
            </label>
            <input
                id="throttle"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={throttle}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-4 rounded-lg appearance-none cursor-pointer bg-gray-700"
                style={{
                    background: `linear-gradient(to right, #f87171 0%, #f87171 ${
                        throttle * 100
                    }%, #4b5563 ${throttle * 100}%, #4b5563 100%)`,
                }}
            />
        </div>
    );
}
