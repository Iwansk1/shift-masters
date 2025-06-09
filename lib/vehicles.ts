import { VehicleSpec } from "./types";

export const vehicles: VehicleSpec[] = [
    {
        id: "Civic_EK9",
        name: "Honda Civic Type R EK9",
        maxRPM: 8800,
        idleRPM: 900,
        gearRatios: [0, 3.23, 2.105, 1.458, 1.103, 0.87], // 1-5 + optional 6th if needed
        finalDrive: 4.4,
        wheelCircumference: 1.92, // ~0.61m diameter
        maxTorque: 157,
        torquePeakRPM: 7500,
        torqueZeroRPM: 9000,
        engineInertia: 0.09,
        engineBrakeTorque: 40,
    },
    {
        id: "MR2_AW11",
        name: "Toyota MR2 AW11",
        maxRPM: 7600,
        idleRPM: 850,
        gearRatios: [0, 3.54, 1.95, 1.32, 1.03, 0.85], // 1-5 + optional 6th if needed
        finalDrive: 4.1,
        wheelCircumference: 1.85, // ~0.61m diameter
        maxTorque: 140,
        torquePeakRPM: 6200,
        torqueZeroRPM: 8000,
        engineInertia: 0.085,
        engineBrakeTorque: 35,
    },
    {
        id: "Sprinter_Hayabusa",
        name: "Buggy Hayabusa 1600cc",
        maxRPM: 11500,
        idleRPM: 1200,
        gearRatios: [0, 2.9, 2.1, 1.6, 1.3, 1.1, 0.9], // 1-5 + optional 6th if needed
        finalDrive: 4.5,
        wheelCircumference: 1.7, // ~0.61m diameter
        maxTorque: 140,
        torquePeakRPM: 9500,
        torqueZeroRPM: 11500,
        engineInertia: 0.06,
        engineBrakeTorque: 25,
    },
];
