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
	new cmd("GoStraight", "GoStraight", function (){
		bleLog.response("GoStraight OK")
		wallFollowing.GoStraight()
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
	new cmd("stop", "stop car", ()=>{
		bleLog.response("stop OK")
		carState.ending()
		miniTank.Stop()
	}),
	new cmd("gohead1000", "gohead1000", ()=>{
		bleLog.response("gohead1000 OK")
		TestGohead1000()
	}),
	new cmd("calleft", "CalibrateLeftSensor", ()=> {
		VL6180.offsetCalibrationAt50mm(sensor.leftSensorAddr, 50)
		bleLog.response("CalibrateLeftSensor OK")
	}),
	new cmd("leftoffset", "show left offset", ()=>{
		bleLog.response(convertToText(VL6180.rangOffsetCalibration(sensor.leftSensorAddr)))
	}),
	new cmd("gohead", "test gohead", ()=>{
		bleLog.response("LPWM=" + convertToText(miniTank.lPWM())
			+ "; RPWM=" + convertToText(miniTank.rPWM()))
		TestGohead()
	}),
	new cmd("setrpwm", "setrpwm xxx -- set rpwm = xxx(number)", (bleargs)=>{
		miniTank.setRPWM(parseFloat(bleargs.shift()))
		bleLog.response("LPWM=" + convertToText(miniTank.lPWM()) + "; RPWM=" + convertToText(miniTank.rPWM()))
	}),
	new cmd("setlpwm", "setlpwm xxx -- set lpwm = xxx(number)", (bleargs)=>{
		miniTank.setLPWM(parseFloat(bleargs.shift()))
		bleLog.response("LPWM=" + convertToText(miniTank.lPWM()) + "; RPWM=" + convertToText(miniTank.rPWM()))
	}),
	new cmd("start", "start wall following", ()=>{
		bleLog.response("start OK")
		control.raiseEvent(
			EventBusSource.MES_BROADCAST_GENERAL_ID,
			EventBusValue.MES_ALERT_EVT_ALARM1
		)
	}),
	new cmd("turnleft90", "turnleft90", ()=>{
		bleLog.response("Turnleft90 OK")
		wallFollowing.Left90Turning()
		miniTank.Stop()
	}),
	new cmd("frontoffset", "show front offset", ()=>{
		bleLog.response(convertToText(VL6180.rangOffsetCalibration(sensor.frontSensorAddr)))
	}),
	new cmd("calfront", "CalibrateFrontSensor", ()=>{
		VL6180.offsetCalibrationAt50mm(sensor.frontSensorAddr, 50)
		bleLog.response("CalibrateFrontSensor OK")
	}),
	new cmd("left90", "carLeft90", ()=>{
		bleLog.response("left90 OK")
		miniTank.Left90()
		return 5000
	}),
	new cmd("right90", "carRight", ()=>{
		miniTank.Right90()
		bleLog.response("right90 OK")
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

	// todo: delete
	// if (blecmd.compare("GoStraight") == 0) {
	// 	bleLog.response("GoStraight OK")
	// 	wallFollowing.GoStraight()
	// 	miniTank.Stop()
	// } else if (blecmd.compare("leftSensor") == 0) {
	// 	bleLog.response("leftSensor OK")
	// 	bluetooth.uartWriteLine(convertToText(VL6180.averageLastest(sensor.leftSensorAddr, 1)))
	// } else if (blecmd.compare("frontSensor") == 0) {
	// 	bluetooth.uartWriteLine(">>frontSensor OK")
	// 	bluetooth.uartWriteLine(convertToText(VL6180.averageLastest(sensor.frontSensorAddr, 1)))
	// } else if (blecmd.compare("stop") == 0) {
	// 	bluetooth.uartWriteLine(">>Stop OK")
	// 	carState.ending()
	// 	miniTank.Stop()
	// } else if (blecmd.compare("calleft") == 0) {
	// 	VL6180.offsetCalibrationAt50mm(sensor.leftSensorAddr, 50)
	// 	bluetooth.uartWriteLine(">>CalibrateLeftSensor OK")
	// } else if (blecmd.compare("leftoffset") == 0) {
	// 	bluetooth.uartWriteLine(">>"
	// 		+ convertToText(VL6180.rangOffsetCalibration(wallFollowing.LeftSensorLocation)))
	// } else if (blecmd.compare("gohead") == 0) {
	// 	bluetooth.uartWriteLine(">>" + "LPWM=" + convertToText(miniTank.lPWM())
	// 		+ "; RPWM=" + convertToText(miniTank.rPWM()))
	// 	TestGohead()
	// } else if (blecmd.compare("setrpwm") == 0 && bleargs.length == 1) {
	// 	miniTank.setRPWM(parseFloat(bleargs.shift()))
	// 	bluetooth.uartWriteLine(">>" + "LPWM=" + convertToText(miniTank.lPWM()) + "; RPWM=" + convertToText(miniTank.rPWM()))
	// } else if (blecmd.compare("start") == 0) {
	// 	bluetooth.uartWriteLine(">>Start OK")
	// 	control.raiseEvent(
	// 		EventBusSource.MES_BROADCAST_GENERAL_ID,
	// 		EventBusValue.MES_ALERT_EVT_ALARM1
	// 	)
	// } else if (blecmd.compare("turnleft90") == 0) {
	// 	bluetooth.uartWriteLine(">>Turnleft90 OK")
	// 	wallFollowing.Left90Turning()
	// 	miniTank.Stop()
	// } else if (blecmd.compare("frontoffset") == 0) {
	// 	bluetooth.uartWriteLine(">>" + convertToText(VL6180.rangOffsetCalibration(sensor.frontSensorAddr)))
	// } else if (blecmd.compare("calfront") == 0) {
	// 	VL6180.offsetCalibrationAt50mm(sensor.frontSensorAddr, 50)
	// 	bluetooth.uartWriteLine(">>CalibrateFrontSensor OK")
	// } else {
	// 	bluetooth.uartWriteLine(">>leftSensor: leftSensor")
	// 	bluetooth.uartWriteLine(">>frontSensor: frontSensor")
	// 	bluetooth.uartWriteLine(">>GoStraight: GoStraight")
	// 	bluetooth.uartWriteLine(">>stop: stop car")
	// 	bluetooth.uartWriteLine(">>calleft: CalibrateLeftSensor")
	// 	bluetooth.uartWriteLine(">>calfront: CalibrateFrontSensor")
	// 	bluetooth.uartWriteLine(">>leftoffset: show left offset")
	// 	bluetooth.uartWriteLine(">>frontoffset: show front offset")
	// 	bluetooth.uartWriteLine(">>gohead: test gohead")
	// 	bluetooth.uartWriteLine(">>setrpwm xxx: set rpwm = xxx(number)")
	// 	bluetooth.uartWriteLine(">>start: start wall following")
	// 	bluetooth.uartWriteLine(">>turnleft90: turnleft90")
	// }
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

function TestGohead () {
	miniTank.Gohead()
	for (let index = 0; index < 50; index++) {
		bluetooth.uartWriteValue("left", sensor.readLeftDis())
		basic.pause(100)
	}
	miniTank.Stop()
}

function TestGohead1000 () {
	miniTank.Gohead()
	for (let index = 0; index < 10; index++) {
		bluetooth.uartWriteValue("left", sensor.readLeftDis())
		basic.pause(100)
	}
	miniTank.Stop()
}

function testFunction (arg: string) {
    if (arg.compare("right") == 0) {
        bluetooth.uartWriteLine(">>ok")
        miniTank.TurnRight()
    } else {
        bluetooth.uartWriteLine(">> only support--- test right: call TurnRight")
    }
}

control.onEvent(EventBusSource.MES_BROADCAST_GENERAL_ID, EventBusValue.MES_ALERT_EVT_ALARM1, function () {
	wallFollowing2.start()
})

sensor.InitSensor()
