import React from "react";

interface GaugeProps {
    label: string;
    value: number;
    maxValue: number;
    unit: string;
    size?: number;
}

export function Gauge({
    label,
    value,
    maxValue,
    unit,
    size = 150,
}: GaugeProps) {
    const radius = size / 2 - 10;
    const center = size / 2;
    const angle = (value / maxValue) * 270 - 135; // Map value to -135° to +135°

    // Convert angle to radians for SVG
    const radians = (angle * Math.PI) / 180;
    const needleX = center + radius * Math.cos(radians);
    const needleY = center + radius * Math.sin(radians);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Outer circle */}
            <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#555"
                strokeWidth="5"
                fill="#222"
            />

            {/* Tick marks */}
            {[...Array(11)].map((_, i) => {
                const tickAngle = (-135 + (270 / 10) * i) * (Math.PI / 180);
                const x1 = center + (radius - 10) * Math.cos(tickAngle);
                const y1 = center + (radius - 10) * Math.sin(tickAngle);
                const x2 = center + radius * Math.cos(tickAngle);
                const y2 = center + radius * Math.sin(tickAngle);
                return (
                    <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#888"
                        strokeWidth="2"
                    />
                );
            })}

            {/* Needle */}
            <line
                x1={center}
                y1={center}
                x2={needleX}
                y2={needleY}
                stroke="red"
                strokeWidth="3"
                strokeLinecap="round"
            />

            {/* Center dot */}
            <circle cx={center} cy={center} r={5} fill="red" />

            {/* Label */}
            <text
                x={center}
                y={size - 20}
                fill="#ccc"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
            >
                {label}
            </text>

            {/* Value */}
            <text
                x={center}
                y={center + 10}
                fill="#fff"
                fontSize="20"
                fontWeight="bold"
                textAnchor="middle"
            >
                {value} {unit}
            </text>
        </svg>
    );
}
