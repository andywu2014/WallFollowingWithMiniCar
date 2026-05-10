
namespace sensor {
	export function InitSensor () {
		pins.digitalWritePin(DigitalPin.P8, 0)
		pins.digitalWritePin(DigitalPin.P2, 0)
		pins.digitalWritePin(DigitalPin.P2, 1)
		// LeftSensor
		VL6180.initVL6180(leftSensorAddr)
		pins.digitalWritePin(DigitalPin.P8, 1)
		// FrontSensor
		VL6180.initVL6180(frontSensorAddr)
		VL6180.setRangOffsetCalibration(leftSensorAddr, leftOffset)
		VL6180.setRangOffsetCalibration(frontSensorAddr, frontOffset)
	}

	export function readFrontDis () {
		return VL6180.readRange(frontSensorAddr)
		// return VL6180.averageLastest(frontSensorAddr, 1)
	}

	export function readLeftDis () {
		return VL6180.readRange(leftSensorAddr)
	}

	const frontOffset = 20
	export const frontSensorAddr = 0x2b
	const leftOffset = 20
	export const leftSensorAddr = 0x2a
}
