
namespace miniTank {
	export class PWM {constructor(public readonly RPWM: number, public readonly LPWM: number) {
	}}

	type RealPWM = PWM
	type ExpectedPWM = PWM

	const diff = 0.7

	export const Straight = new PWM(120, 100)
	export const Left90 = new PWM(150, 0)
	export const Right90 = new PWM(0, 160)
	export const LeftSlight = new PWM(120, 100 * diff)
	export const RightSlight = new PWM(120 * diff, 100)

	export function GoForward(expectedPWM: ExpectedPWM) {
		let real = Settings(expectedPWM)
		pins.digitalWritePin(DigitalPin.P13, 0)
		pins.analogSetPeriod(AnalogPin.P14, 20000)
		pins.analogSetPeriod(AnalogPin.P15, 20000)
		pins.digitalWritePin(DigitalPin.P16, 0)
		pins.analogWritePin(AnalogPin.P14, real.LPWM)
		pins.analogWritePin(AnalogPin.P15, real.RPWM)
	}

	export function GoBack(expectedPWM: ExpectedPWM){
		let real = Settings(expectedPWM)
		pins.analogSetPeriod(AnalogPin.P13, 20000)
		pins.digitalWritePin(DigitalPin.P14, 0)
		pins.digitalWritePin(DigitalPin.P15, 0)
		pins.analogSetPeriod(AnalogPin.P16, 20000)
		pins.analogWritePin(AnalogPin.P13, real.LPWM)
		pins.analogWritePin(AnalogPin.P16, real.RPWM)
	}

	export function Stop() {
		pins.digitalWritePin(DigitalPin.P13, 0)
		pins.digitalWritePin(DigitalPin.P14, 0)
		pins.digitalWritePin(DigitalPin.P15, 0)
		pins.digitalWritePin(DigitalPin.P16, 0)
	}

	let lastExpected = new PWM(120, 100)

	export function LastExpected(): ExpectedPWM {
		return lastExpected
	}

	const standardVoltage = Math.round(1023 * 2.9 / 3.31)

	export function Settings(expectedPWM: PWM): RealPWM {
		lastExpected = expectedPWM

		let RV = standardVoltage * expectedPWM.RPWM
		let LV = standardVoltage * expectedPWM.LPWM
		let realLPWM = LV / (pins.analogReadPin(AnalogPin.P1))
		let realRPWM = RV / (pins.analogReadPin(AnalogPin.P1))

		return new PWM(realRPWM, realLPWM)
	}

	export function setLPWM(lpwm: number): ExpectedPWM {
		return new PWM(lastExpected.RPWM, lpwm)
	}

	export function setRPWM(rpwm: number): ExpectedPWM {
		return new PWM(rpwm, lastExpected.LPWM)
	}

}



