function Gohead () {
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.analogSetPeriod(AnalogPin.P14, 20000)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    pins.analogWritePin(AnalogPin.P14, LPWM)
    pins.analogWritePin(AnalogPin.P15, RPWM)
}
function InitSensor () {
    LeftDis = 0
    FrontDis = 0
    pins.digitalWritePin(DigitalPin.P8, 0)
    pins.digitalWritePin(DigitalPin.P2, 0)
    pins.digitalWritePin(DigitalPin.P2, 1)
    // LeftSensor
    VL6180.initVL6180(42)
    pins.digitalWritePin(DigitalPin.P8, 1)
    // FrontSensor
    VL6180.initVL6180(43)
}
function TurnLeft () {
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.analogSetPeriod(AnalogPin.P14, 20000)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    pins.analogWritePin(AnalogPin.P14, LPWM * 差距)
    pins.analogWritePin(AnalogPin.P15, RPWM)
}
// LeftSensor
VL6180.continualRange(42, function (value) {
    if (Math.abs(value - LeftDis) >= 10) {
        LeftDis = value
        VL6180.clearBuffer(42)
    } else {
        LeftDis = VL6180.averageLastest(42, 5)
    }
    bluetooth.uartWriteValue("Farthest", LeftSensorExpectedDis + 5)
    bluetooth.uartWriteValue("left", LeftDis)
    bluetooth.uartWriteValue("Close to", LeftSensorExpectedDis - 5)
})
function Right90Turning () {
    Angle = (input.compassHeading() + 80 + 360) % 360
    for (let index = 0; index < 10; index++) {
        ZeroRadiusRight()
        if (input.compassHeading() >= Angle) {
            break;
        }
    }
}
input.onButtonPressed(Button.A, function () {
    Stop()
    input.calibrateCompass()
})
function end () {
    ending = true
}
// FrontSensor
VL6180.continualRange(43, function (value) {
    if (Math.abs(value - FrontDis) >= 10) {
        FrontDis = value
        VL6180.clearBuffer(43)
    } else {
        FrontDis = VL6180.averageLastest(43, 5)
    }
    bluetooth.uartWriteValue("front", FrontDis)
})
function GoStraight () {
    latest = LeftDis
    basic.pause(100)
    while (true) {
        if (LeftDis > WallMazeWidth || FrontDis < FrontSensorClearanceDis || stop == 1) {
            stop = 0
            break;
        }
        nowLDLs = LeftDis
        bluetooth.uartWriteLine("left:" + nowLDLs + "; head:" + FrontDis + "; latest:" + latest)
        if (nowLDLs < LeftSensorExpectedDis - 5 && !(nowLDLs - latest > errLDiS)) {
            bluetooth.uartWriteLine("will turn right")
            TurnRight()
            basic.pause(100)
            bluetooth.uartWriteLine("turned right")
        } else if (nowLDLs > LeftSensorExpectedDis + 5 && !(latest - nowLDLs > errLDiS)) {
            bluetooth.uartWriteLine("will turn left")
            TurnLeft()
            basic.pause(100)
            bluetooth.uartWriteLine(" turned left")
        } else {
            bluetooth.uartWriteLine("will go head")
            Gohead()
            basic.pause(100)
            bluetooth.uartWriteLine("went head")
        }
        latest = nowLDLs
    }
}
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
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.Hash), function () {
    blecmd = bluetooth.uartReadUntil(serial.delimiters(Delimiters.Hash))
    if (blecmd.compare("GoStraight") == 0) {
        bluetooth.uartWriteLine(">>GoStraight OK")
        GoStraight()
    } else if (blecmd.compare("leftSensor") == 0) {
        bluetooth.uartWriteLine(">>leftSensor OK")
        bluetooth.uartWriteLine(convertToText(LeftDis))
    } else if (blecmd.compare("frontSensor") == 0) {
        bluetooth.uartWriteLine(">>frontSensor OK")
        bluetooth.uartWriteLine(convertToText(FrontDis))
    } else if (blecmd.compare("stop") == 0) {
        bluetooth.uartWriteLine(">>Stop OK")
        stop = 1
        Stop()
    } else {
        bluetooth.uartWriteLine(">>leftSensor:leftSensor")
        bluetooth.uartWriteLine(">>frontSensor:frontSensor")
        bluetooth.uartWriteLine(">>GoStraight:GoStraight")
        bluetooth.uartWriteLine(">>stop:stop car")
    }
})
input.onButtonPressed(Button.B, function () {
    control.raiseEvent(
    EventBusSource.MES_BROADCAST_GENERAL_ID,
    EventBusValue.MES_ALERT_EVT_ALARM1
    )
})
function Left90Turning () {
    Gohead()
    for (let index = 0; index < 5; index++) {
        basic.pause(100)
        if (FrontDis <= FrontSensorClearanceDis) {
            break;
        }
    }
    Angle = (input.compassHeading() - 80 + 360) % 360
    for (let index = 0; index < 10; index++) {
        ZeroRadiusLeft()
        if (input.compassHeading() <= Angle) {
            break;
        }
    }
    Gohead()
    for (let index = 0; index < 6; index++) {
        basic.pause(100)
        if (FrontDis <= FrontSensorClearanceDis) {
            break;
        }
    }
}
function TurnRight () {
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.analogSetPeriod(AnalogPin.P14, 20000)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    pins.analogWritePin(AnalogPin.P14, LPWM)
    pins.analogWritePin(AnalogPin.P15, RPWM * 差距)
}
function testFunction (arg: string) {
    if (arg.compare("right") == 0) {
        bluetooth.uartWriteLine(">>ok")
        TurnRight()
    } else {
        bluetooth.uartWriteLine(">> only support--- test right: call TurnRight")
    }
}
function Stop () {
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.digitalWritePin(DigitalPin.P14, 0)
    pins.digitalWritePin(DigitalPin.P15, 0)
    pins.digitalWritePin(DigitalPin.P16, 0)
}
control.onEvent(EventBusSource.MES_BROADCAST_GENERAL_ID, EventBusValue.MES_ALERT_EVT_ALARM1, function () {
    basic.pause(1000)
    basic.showIcon(IconNames.Heart)
    while (ending == false) {
        if (LeftDis > WallMazeWidth) {
            Left90Turning()
        } else if (FrontDis < FrontSensorClearanceDis) {
            Right90Turning()
        } else {
            GoStraight()
        }
    }
})
function ZeroRadiusRight () {
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
function ZeroRadiusLeft () {
    pins.analogSetPeriod(AnalogPin.P13, 20000)
    pins.analogWritePin(AnalogPin.P13, 200)
    pins.digitalWritePin(DigitalPin.P14, 0)
    pins.digitalWritePin(DigitalPin.P15, 0)
    pins.analogSetPeriod(AnalogPin.P16, 20000)
    pins.analogWritePin(AnalogPin.P16, 100)
    basic.pause(500)
    Stop()
    basic.pause(100)
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.analogSetPeriod(AnalogPin.P14, 20000)
    pins.analogWritePin(AnalogPin.P14, 100)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.analogWritePin(AnalogPin.P15, 200)
    pins.digitalWritePin(DigitalPin.P16, 0)
    basic.pause(500)
    Stop()
    basic.pause(100)
}
let nowLDLs = 0
let latest = 0
let Angle = 0
let FrontDis = 0
let LeftDis = 0
let stop = 0
let errLDiS = 0
let 差距 = 0
let LPWM = 0
let RPWM = 0
let FrontSensorClearanceDis = 0
let LeftSensorExpectedDis = 0
let WallMazeWidth = 0
let ending = false
let blecmd = ""
bluetooth.startUartService()
InitSensor()
ending = false
WallMazeWidth = 110
let LeftSensorLocation = 20
let FrontSensorLocation = 30
LeftSensorExpectedDis = WallMazeWidth / 2 - LeftSensorLocation
FrontSensorClearanceDis = WallMazeWidth / 2 - FrontSensorLocation
RPWM = 200
LPWM = 200
差距 = 0.7
errLDiS = 4
stop = 0
bluetooth.uartWriteLine("inited")
