export interface VehicleSpec {
    id: string;
    name: string;
    maxRPM: number;
    idleRPM: number;
    gearRatios: number[];
    finalDrive: number;
    wheelCircumference: number; // in meters
    maxTorque: number; // in Nm
    torquePeakRPM: number; // RPM at peak torque
    torqueZeroRPM: number; // RPM where torque falls to zero
    engineInertia: number; // kg*m^2
    engineBrakeTorque: number; // Nm when throttle is zero
    soundProfile?: {
        basePitch: number; // Base pitch for engine sound
        pitchCurveFactor: number; // Factor to adjust pitch based on RPM
    };
}
