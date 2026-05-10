
namespace miniTank {
	export function Gohead () {
		pins.digitalWritePin(DigitalPin.P13, 0)
		pins.analogSetPeriod(AnalogPin.P14, 20000)
		pins.analogSetPeriod(AnalogPin.P15, 20000)
		pins.digitalWritePin(DigitalPin.P16, 0)
		pins.analogWritePin(AnalogPin.P14, LPWM)
		pins.analogWritePin(AnalogPin.P15, RPWM)
	}

	export function TurnLeft () {
		pins.digitalWritePin(DigitalPin.P13, 0)
		pins.analogSetPeriod(AnalogPin.P14, 20000)
		pins.analogSetPeriod(AnalogPin.P15, 20000)
		pins.digitalWritePin(DigitalPin.P16, 0)
		pins.analogWritePin(AnalogPin.P14, LPWM * diff)
		pins.analogWritePin(AnalogPin.P15, RPWM)
	}

	export function TurnRight () {
		pins.digitalWritePin(DigitalPin.P13, 0)
		pins.analogSetPeriod(AnalogPin.P14, 20000)
		pins.analogSetPeriod(AnalogPin.P15, 20000)
		pins.digitalWritePin(DigitalPin.P16, 0)
		pins.analogWritePin(AnalogPin.P14, LPWM)
		pins.analogWritePin(AnalogPin.P15, RPWM * diff)
	}

	export function Stop () {
		pins.digitalWritePin(DigitalPin.P13, 0)
		pins.digitalWritePin(DigitalPin.P14, 0)
		pins.digitalWritePin(DigitalPin.P15, 0)
		pins.digitalWritePin(DigitalPin.P16, 0)
	}

	export function ZeroRadiusRight () {
		pins.digitalWritePin(DigitalPin.P13, 0)
		pins.analogSetPeriod(AnalogPin.P14, 20000)
		pins.analogWritePin(AnalogPin.P14, 200)
		pins.analogSetPeriod(AnalogPin.P15, 20000)
		pins.analogWritePin(AnalogPin.P15, 100)
		pins.digitalWritePin(DigitalPin.P16, 0)
		basic.pause(500)
		Stop()
		basic.pause(100)
		pins.analogSetPeriod(AnalogPin.P13, 20000)
		pins.analogWritePin(AnalogPin.P13, 100)
		pins.digitalWritePin(DigitalPin.P14, 0)
		pins.digitalWritePin(DigitalPin.P15, 0)
		pins.analogSetPeriod(AnalogPin.P16, 20000)
		pins.analogWritePin(AnalogPin.P16, 200)
		basic.pause(500)
		Stop()
		basic.pause(100)
	}

	export function ZeroRadiusLeft () {
		pins.analogSetPeriod(AnalogPin.P13, 20000)
		pins.analogWritePin(AnalogPin.P13, 200)
		pins.digitalWritePin(DigitalPin.P14, 0)
		pins.digitalWritePin(DigitalPin.P15, 0)
		pins.analogSetPeriod(AnalogPin.P16, 20000)
		pins.analogWritePin(AnalogPin.P16, 100)
		bleLog.logLine("ZeroRadiusLeft front")
		basic.pause(500)
		Stop()
		basic.pause(100)
		pins.digitalWritePin(DigitalPin.P13, 0)
		pins.analogSetPeriod(AnalogPin.P14, 20000)
		pins.analogWritePin(AnalogPin.P14, 100)
		pins.analogSetPeriod(AnalogPin.P15, 20000)
		pins.analogWritePin(AnalogPin.P15, 200)
		pins.digitalWritePin(DigitalPin.P16, 0)
		bleLog.logLine("ZeroRadiusLeft back")
		basic.pause(500)
		Stop()
		basic.pause(100)
	}

	export function setLPWM(lpwm: number) {
		LPWM = lpwm
	}

	export function lPWM() {
		return LPWM
	}

	export function setRPWM(rpwm: number) {
		RPWM = rpwm
	}

	export function rPWM() {
		return rPWM
	}

	let diff = 0.7
	let LPWM = 200
	let RPWM = 175
}



