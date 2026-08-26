import Driving = carState.Driving
import State = carState.State

input.onButtonPressed(Button.B, function () {
    control.raiseEvent(
    EventBusSource.MES_BROADCAST_GENERAL_ID,
    EventBusValue.MES_ALERT_EVT_ALARM1
    )
})


input.onButtonPressed(Button.A, function () {
	end()
	input.calibrateCompass()
})

function end() {
	miniTank.Stop()
	carState.ending()
}

bluetooth.startUartService()
bluetooth.uartWriteLine("inited")

class cmd {
	constructor(public name: string, public helpInfo: string, public doWhat: (args: string[])=>void) {}
}

const allCmds = [
	new cmd("start", "start wall following", ()=>{
		bleLog.response("start OK")
		control.raiseEvent(
			EventBusSource.MES_BROADCAST_GENERAL_ID,
			EventBusValue.MES_ALERT_EVT_ALARM1
		)
	}),
	new cmd("stop", "stop car", ()=>{
		bleLog.response("stop OK")
		carState.ending()
		miniTank.Stop()
	}),

	new cmd("leftSensor", "leftSensor", ()=>{
		bleLog.response("leftSensor OK")
		bluetooth.uartWriteLine(convertToText(VL6180.averageLastest(sensor.leftSensorAddr, 1)))
	}),
	new cmd("frontSensor", "frontSensor", ()=>{
		bleLog.response("frontSensor OK")
		bluetooth.uartWriteLine(convertToText(VL6180.averageLastest(sensor.frontSensorAddr, 1)))
	}),
	new cmd("frontoffset", "show front offset", ()=>{
		bleLog.response(convertToText(VL6180.rangOffsetCalibration(sensor.frontSensorAddr)))
	}),
	new cmd("calfront", "CalibrateFrontSensor", ()=>{
		VL6180.offsetCalibrationAt50mm(sensor.frontSensorAddr, 50)
		bleLog.response("CalibrateFrontSensor OK")
	}),
	new cmd("calleft", "CalibrateLeftSensor", ()=> {
		VL6180.offsetCalibrationAt50mm(sensor.leftSensorAddr, 50)
		bleLog.response("CalibrateLeftSensor OK")
	}),
	new cmd("leftoffset", "show left offset", ()=>{
		bleLog.response(convertToText(VL6180.rangOffsetCalibration(sensor.leftSensorAddr)))
	}),

	new cmd("setRpwm", "setrpwm xxx -- set rpwm = xxx(number)", (bleargs)=>{
		let real = miniTank.Settings(miniTank.setRPWM(parseInt(bleargs.shift())))
		bleLog.response("LPWM=" + convertToText(real.LPWM) + "; RPWM=" + convertToText(real.RPWM))
	}),
	new cmd("setLpwm", "setlpwm xxx -- set lpwm = xxx(number)", (bleargs)=>{
		let real = miniTank.Settings(miniTank.setLPWM(parseInt(bleargs.shift())))
		bleLog.response("LPWM=" + convertToText(real.LPWM) + "; RPWM=" + convertToText(real.RPWM))
	}),

	new cmd("goforward", "goforward xxx -- time = xxx(ms)", (bleargs)=>{
		let time = parseInt(bleargs.shift())
		bleLog.response("goforward OK")
		miniTank.GoForward(miniTank.LastExpected())
		basic.pause(time)
		miniTank.Stop()
	}),
	new cmd("goback", "goback xxx -- time = xxx(ms)", (bleargs)=>{
		let time = parseInt(bleargs.shift())
		bleLog.response("goback OK")
		miniTank.GoBack(miniTank.LastExpected())
		basic.pause(time)
		miniTank.Stop()
	})
]

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.Hash), function () {
	let bleargs = bluetooth.uartReadUntil(serial.delimiters(Delimiters.Hash)).split(" ")
	let blecmd = bleargs.shift()

	let found = false
	for (const c of allCmds) {
		if (blecmd.compare(c.name) != 0) {
			continue
		}

		found = true
		c.doWhat(bleargs)
		break
	}

	if (!found) {
		for (const c of allCmds) {
			bleLog.response(c.name + ": " + c.helpInfo)
		}
	}

})

function bleCalCmd (cmdstr: string, blearg: string, addr: number) {
	if (blearg.compare("offset") == 0) {
		bluetooth.uartWriteValue("cal-offset", VL6180.rangOffsetCalibration(addr))
	} else if (blearg.compare("write") == 0) {
		VL6180.offsetCalibrationAt50mm(addr)
		bluetooth.uartWriteValue("cal-offset", VL6180.rangOffsetCalibration(addr))
	} else if (blearg.compare("10times") == 0) {
		basic.pause(1000)
		bluetooth.uartWriteValue("left-sensor", VL6180.averageLastest(addr, 10, false))
	} else {
		bluetooth.uartWriteLine("" + cmdstr + ":offset --- show offset")
		bluetooth.uartWriteLine("" + cmdstr + ":write --- cal offset")
		bluetooth.uartWriteLine("" + cmdstr + ":10times --- the average of latest 10 value")
	}
}

control.onEvent(EventBusSource.MES_BROADCAST_GENERAL_ID, EventBusValue.MES_ALERT_EVT_ALARM1, function () {
	wallFollowing2.start()
})

sensor.InitSensor()
