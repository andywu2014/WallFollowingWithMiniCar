
input.onButtonPressed(Button.A, function () {
	Stop()
	input.calibrateCompass()
})

bluetooth.startUartService()
bluetooth.uartWriteLine("inited")

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.Hash), function () {
	bleargs = bluetooth.uartReadUntil(serial.delimiters(Delimiters.Hash)).split(" ")
	blecmd = bleargs.shift()
	if (blecmd.compare("GoStraight") == 0) {
		bluetooth.uartWriteLine(">>GoStraight OK")
		GoStraight()
		Stop()
	} else if (blecmd.compare("leftSensor") == 0) {
		bluetooth.uartWriteLine(">>leftSensor OK")
		bluetooth.uartWriteLine(convertToText(VL6180.averageLastest(leftSensorAddr, 1)))
	} else if (blecmd.compare("frontSensor") == 0) {
		bluetooth.uartWriteLine(">>frontSensor OK")
		bluetooth.uartWriteLine(convertToText(VL6180.averageLastest(frontSensorAddr, 1)))
	} else if (blecmd.compare("stop") == 0) {
		bluetooth.uartWriteLine(">>Stop OK")
		stop = 1
		Stop()
	} else if (blecmd.compare("calleft") == 0) {
		VL6180.offsetCalibrationAt50mm(leftSensorAddr, 50)
		bluetooth.uartWriteLine(">>CalibrateLeftSensor OK")
	} else if (blecmd.compare("leftoffset") == 0) {
		bluetooth.uartWriteLine(">>" + convertToText(VL6180.rangOffsetCalibration(LeftSensorLocation)))
	} else if (blecmd.compare("gohead") == 0) {
		bluetooth.uartWriteLine(">>" + "LPWM=" + convertToText(LPWM) + "; RPWM=" + convertToText(RPWM))
		TestGohead()
	} else if (blecmd.compare("setrpwm") == 0 && bleargs.length == 1) {
		RPWM = parseFloat(bleargs.shift())
		bluetooth.uartWriteLine(">>" + "LPWM=" + convertToText(LPWM) + "; RPWM=" + convertToText(RPWM))
	} else if (blecmd.compare("start") == 0) {
		bluetooth.uartWriteLine(">>Start OK")
		control.raiseEvent(
			EventBusSource.MES_BROADCAST_GENERAL_ID,
			EventBusValue.MES_ALERT_EVT_ALARM1
		)
	} else if (blecmd.compare("turnleft90") == 0) {
		bluetooth.uartWriteLine(">>Turnleft90 OK")
		Left90Turning()
		Stop()
	} else if (blecmd.compare("frontoffset") == 0) {
		bluetooth.uartWriteLine(">>" + convertToText(VL6180.rangOffsetCalibration(frontSensorAddr)))
	} else if (blecmd.compare("calfront") == 0) {
		VL6180.offsetCalibrationAt50mm(frontSensorAddr, 50)
		bluetooth.uartWriteLine(">>CalibrateFrontSensor OK")
	} else {
		bluetooth.uartWriteLine(">>leftSensor: leftSensor")
		bluetooth.uartWriteLine(">>frontSensor: frontSensor")
		bluetooth.uartWriteLine(">>GoStraight: GoStraight")
		bluetooth.uartWriteLine(">>stop: stop car")
		bluetooth.uartWriteLine(">>calleft: CalibrateLeftSensor")
		bluetooth.uartWriteLine(">>calfront: CalibrateFrontSensor")
		bluetooth.uartWriteLine(">>leftoffset: show left offset")
		bluetooth.uartWriteLine(">>frontoffset: show front offset")
		bluetooth.uartWriteLine(">>gohead: test gohead")
		bluetooth.uartWriteLine(">>setrpwm xxx: set rpwm = xxx(number)")
		bluetooth.uartWriteLine(">>start: start wall following")
		bluetooth.uartWriteLine(">>turnleft90: turnleft90")
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

function TestGohead () {
	Gohead()
	for (let index = 0; index < 50; index++) {
		bluetooth.uartWriteValue("left", readLeftDis())
		basic.pause(100)
	}
	Stop()
}

