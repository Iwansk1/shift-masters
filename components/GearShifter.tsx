import React, { useState, useRef } from "react";

interface GearPosition {
    gear: number;
    x: number; // % horizontal position
    y: number; // % vertical position
}

interface ManualShifterProps {
    currentGear: number;
    onGearChange: (gear: number) => void;
    maxGear?: number;
}

const gearPositions: GearPosition[] = [
    { gear: 1, x: 20, y: 30 },
    { gear: 2, x: 20, y: 70 },
    { gear: 3, x: 50, y: 30 },
    { gear: 4, x: 50, y: 70 },
    { gear: 5, x: 80, y: 30 },
];

export function ManualShifter({
    currentGear,
    onGearChange,
    maxGear = 5,
}: ManualShifterProps) {
    const leverRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);

    const currentPos =
        gearPositions.find((pos) => pos.gear === currentGear) ||
        gearPositions[0];

    const onPointerDown = (e: React.PointerEvent) => {
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragging || !leverRef.current) return;

        const rect = leverRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        let closestGear = currentGear;
        let closestDist = Infinity;

        for (const pos of gearPositions) {
            if (pos.gear > maxGear) continue;
            const posX = (pos.x / 100) * rect.width;
            const posY = (pos.y / 100) * rect.height;

            const dx = relativeX - posX;
            const dy = relativeY - posY;
            const dist = dx * dx + dy * dy;

            if (dist < closestDist) {
                closestDist = dist;
                closestGear = pos.gear;
            }
        }

        if (closestGear !== currentGear) {
            onGearChange(closestGear);
        }
    };

    const onPointerUp = (e: React.PointerEvent) => {
        setDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        // your existing keyboard logic here
    };

    return (
        <div className="flex flex-col items-center mt-8 select-none font-sans">
            <div
                ref={leverRef}
                className={`relative w-96 h-80 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-3xl border border-gray-700 shadow-lg ${
                    dragging ? "ring-4 ring-green-400 ring-opacity-60" : ""
                }`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                tabIndex={0}
                role="slider"
                aria-valuemin={1}
                aria-valuemax={maxGear}
                aria-valuenow={currentGear}
                aria-label="Manual gear shifter lever"
                onKeyDown={onKeyDown}
                style={{ userSelect: "none" }}
            >
                {/* Horizontal gates */}
                <div
                    className="absolute left-1/5 right-1/5 h-1 bg-gradient-to-r via-gray-400 rounded-full"
                    style={{ top: "50%" }}
                />

                {/* Vertical slots */}
                {[20, 50, 80].map((leftPercent, idx) => (
                    <div
                        key={idx}
                        className="absolute w-1 bg-gradient-to-b via-gray-400 rounded-full"
                        style={{
                            left: `${leftPercent}%`,
                            top: "30%",
                            bottom: leftPercent === 80 ? "50%" : "30%",
                        }}
                    />
                ))}

                {/* Gear labels */}
                {gearPositions.map(({ gear, x, y }) =>
                    gear <= maxGear ? (
                        <div
                            key={gear}
                            className={`absolute cursor-pointer select-none font-semibold text-xl transition-colors duration-200 ${
                                gear === currentGear
                                    ? "text-green-400 font-extrabold drop-shadow-lg"
                                    : "text-gray-100 hover:text-green-400"
                            }`}
                            style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                transform: "translate(-50%, -50%)",
                                userSelect: "none",
                                textShadow:
                                    gear === currentGear
                                        ? "0 0 6px rgba(72, 187, 120, 0.8)"
                                        : undefined,
                            }}
                            onClick={() => onGearChange(gear)}
                            tabIndex={0}
                            role="button"
                            aria-pressed={gear === currentGear}
                            aria-label={`Select gear ${gear}`}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ")
                                    onGearChange(gear);
                            }}
                        >
                            {gear}
                        </div>
                    ) : null
                )}

                {/* Lever handle */}
                <div
                    className={`absolute w-12 h-12 rounded-full cursor-grab touch-none transition-shadow duration-150 ${
                        dragging
                            ? "cursor-grabbing shadow-[0_0_15px_4px_rgba(72,187,120,0.6)]"
                            : "shadow-lg"
                    }`}
                    style={{
                        left: `${currentPos.x}%`,
                        top: `${currentPos.y}%`,
                        transform: "translate(-50%, -50%)",
                        background:
                            "radial-gradient(circle at 30% 30%, #32CD32, #006400)",
                        boxShadow:
                            "inset 0 -3px 5px rgba(255,255,255,0.3), 0 4px 12px rgba(0, 100, 0, 0.7)",
                        transition: dragging
                            ? "none"
                            : "left 0.2s ease, top 0.2s ease, box-shadow 0.15s ease",
                    }}
                    draggable={false}
                />
            </div>

            <div className="mt-3 text-gray-400 text-sm select-none">
                Drag lever in gate or click gear numbers
            </div>
        </div>
    );
}
