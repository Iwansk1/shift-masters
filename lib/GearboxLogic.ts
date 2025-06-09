// GearboxLogic.ts
import { VehicleSpec } from "./types";

// 🧠 Tunable constants
const BASE_ENGINE_TORQUE = 50; // Nm at idle, simulates engine assist
const LOAD_FACTOR = 0.02; // Lower load torque multiplier
// const MIN_THROTTLE_FOR_LOAD = 0.05;

const WOBBLE_FREQUENCY = 5; // Hz (5 oscillations per second)
const MAX_WOBBLE_AMPLITUDE = 50; // Max RPM wobble amplitude
// 🚗 Engine torque curve with base torque added

function engineTorqueCurve(rpm: number, vehicle: VehicleSpec): number {
    const { idleRPM, torquePeakRPM, torqueZeroRPM, maxTorque } = vehicle;

    if (rpm < idleRPM) return 0;

    if (rpm < torquePeakRPM) {
        const progressiveTorque =
            (rpm / torquePeakRPM) * (maxTorque - BASE_ENGINE_TORQUE);
        return BASE_ENGINE_TORQUE + progressiveTorque;
    } else if (rpm < torqueZeroRPM) {
        return (
            ((torqueZeroRPM - rpm) / (torqueZeroRPM - torquePeakRPM)) *
            maxTorque
        );
    } else {
        return 0;
    }
}

let wobblePhase = 0;

/**
 * Calculates engine RPM based on torque vs load dynamics.
 */
export function calculateRPM(
    currentRPM: number,
    currentGear: number,
    throttle: number,
    timeElapsed: number,
    speed: number,
    vehicle: VehicleSpec
): number {
    const {
        idleRPM,
        maxRPM,
        gearRatios,
        finalDrive,
        engineInertia,
        engineBrakeTorque,
    } = vehicle;

    if (currentGear < 1 || currentGear >= gearRatios.length) return idleRPM;

    const gearRatio = gearRatios[currentGear];

    const engineTorque = engineTorqueCurve(currentRPM, vehicle) * throttle;
    const loadTorque = speed * gearRatio * finalDrive * LOAD_FACTOR;

    // --- Engine braking torque increases with RPM and lack of throttle ---
    const throttleEffect = Math.min(1, Math.max(0, throttle));
    const rpmFactor = Math.min(1, currentRPM / maxRPM);

    // Braking torque fades out as throttle increases and grows with RPM
    const dynamicEngineBrake =
        (1 - throttleEffect) * rpmFactor * engineBrakeTorque;

    const totalLoadTorque = loadTorque + dynamicEngineBrake;

    const netTorque = engineTorque - totalLoadTorque;
    const rpmAcceleration = netTorque / engineInertia;

    let newRPM = currentRPM + rpmAcceleration * (timeElapsed / 1000);

    // Clamp RPM
    newRPM = Math.min(Math.max(newRPM, idleRPM), maxRPM);

    // Update wobble phase
    wobblePhase += 2 * Math.PI * WOBBLE_FREQUENCY * (timeElapsed / 1000);
    if (wobblePhase > 2 * Math.PI) wobblePhase -= 2 * Math.PI;

    // Calculate wobble amplitude based on throttle (more wobble near idle/low throttle)
    const wobbleAmplitude =
        (1 - throttle * 0.8) *
        (newRPM < idleRPM + 500
            ? MAX_WOBBLE_AMPLITUDE
            : MAX_WOBBLE_AMPLITUDE / 2);

    // Apply wobble as sinusoidal variation
    const wobbleRPM = wobbleAmplitude * Math.sin(wobblePhase);

    newRPM = Math.min(Math.max(newRPM + wobbleRPM, idleRPM), maxRPM);

    return Math.round(newRPM);
}

/**
 * Calculates speed (km/h) from engine RPM.
 */
export function calculateSpeed(
    rpm: number,
    gear: number,
    vehicle: VehicleSpec
): number {
    if (gear < 1 || gear >= vehicle.gearRatios.length) return 0;

    const gearRatio = vehicle.gearRatios[gear];
    const wheelRPM = rpm / (gearRatio * vehicle.finalDrive);
    const speedMS = (wheelRPM * vehicle.wheelCircumference) / 60;

    return Math.round(speedMS * 3.6);
}
