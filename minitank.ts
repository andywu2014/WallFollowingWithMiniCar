
namespace miniTank {
	export class PWM {constructor(public readonly RPWM: number, public readonly LPWM: number) {
	}}

	type RealPWM = PWM
	type ExpectedPWM = PWM

	const diff = 0.7

	export const Straight = new PWM(120, 110)
	export const Left90 = new PWM(200, 0)
	export const Right90 = new PWM(0, 200)
	export const LeftSlight = new PWM(120, 110 * diff)
	export const RightSlight = new PWM(120 * diff, 110)

	export function GoForward(expectedPWM: ExpectedPWM) {
		let real = Settings(expectedPWM)
		bleLog.logLine("GoForward --- time:" + convertToText(control.millis())
			+ "; RPWM:" + convertToText(real.RPWM) + "; LPWM:" + convertToText(real.LPWM))
		pins.digitalWritePin(DigitalPin.P13, 0)
		pins.analogSetPeriod(AnalogPin.P14, 20000)
		pins.analogSetPeriod(AnalogPin.P15, 20000)
		pins.digitalWritePin(DigitalPin.P16, 0)
		pins.analogWritePin(AnalogPin.P14, real.LPWM)
		pins.analogWritePin(AnalogPin.P15, real.RPWM)

		adjust((lpwm)=>{
			pins.analogWritePin(AnalogPin.P14, lpwm)
		}, (rpwm)=>{
			pins.analogWritePin(AnalogPin.P15, rpwm)
		})
	}

	export function GoBack(expectedPWM: ExpectedPWM){
		let real = Settings(expectedPWM)
		bleLog.logLine("GoBack --- time:" + convertToText(control.millis())
			+ "; RPWM:" + convertToText(real.RPWM) + "; LPWM:" + convertToText(real.LPWM))
		pins.analogSetPeriod(AnalogPin.P13, 20000)
		pins.digitalWritePin(DigitalPin.P14, 0)
		pins.digitalWritePin(DigitalPin.P15, 0)
		pins.analogSetPeriod(AnalogPin.P16, 20000)
		pins.analogWritePin(AnalogPin.P13, real.LPWM)
		pins.analogWritePin(AnalogPin.P16, real.RPWM)

		adjust((lpwm)=>{
			pins.analogWritePin(AnalogPin.P13, lpwm)
		}, (rpwm)=>{
			pins.analogWritePin(AnalogPin.P16, rpwm)
		})
	}

	export function Stop() {
		lastExpected = new PWM(0, 0)
		bleLog.logLine("Stop --- time:" + convertToText(control.millis()))
		pins.digitalWritePin(DigitalPin.P13, 0)
		pins.digitalWritePin(DigitalPin.P14, 0)
		pins.digitalWritePin(DigitalPin.P15, 0)
		pins.digitalWritePin(DigitalPin.P16, 0)
	}

	let lastExpected = new PWM(0, 0)

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

		return new PWM(Math.round(realRPWM), Math.round(realLPWM))
	}

	let adjustL: (pwm: number) => void = () => {}
	let adjustR: (pwm: number) => void = () => {}

	function adjust(setL: (pwm: number)=>void, setR: (pwm: number)=>void) {
		adjustL = setL
		adjustR = setR

		control.raiseEvent(adjustEvent, 0)
	}

	const adjustEvent = control.allocateEventSource()

	control.onEvent(adjustEvent, 0, ()=>{
		let RV = standardVoltage * lastExpected.RPWM
		let LV = standardVoltage * lastExpected.LPWM
		let voltageP1 = pins.analogReadPin(AnalogPin.P1)
		let realLPWM = Math.round(LV / voltageP1)
		let realRPWM = Math.round(RV / voltageP1)
		adjustL(realLPWM)
		adjustR(realRPWM)
		// let voltage = voltageP1 * 3.31 / 1023
		// bleLog.logLine("adjust --- time:" + convertToText(control.millis()) + "; v:" + convertToText(voltage)
		// 	+ "; RPWM:" + convertToText(realRPWM) + "; LPWM:" + convertToText(realLPWM))

		basic.pause(100)

		if (lastExpected.RPWM > 0.1 || lastExpected.LPWM > 0.1) {
			control.raiseEvent(adjustEvent, 0)
		}
	})

	export function setLPWM(lpwm: number): ExpectedPWM {
		return new PWM(lastExpected.RPWM, lpwm)
	}

	export function setRPWM(rpwm: number): ExpectedPWM {
		return new PWM(rpwm, lastExpected.LPWM)
	}

}



