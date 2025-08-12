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
    bluetooth.uartWriteValue("L", LeftDis)
})
// FrontSensor
VL6180.continualRange(43, function (value) {
    if (Math.abs(value - FrontDis) >= 10) {
        FrontDis = value
        VL6180.clearBuffer(43)
    } else {
        FrontDis = VL6180.averageLastest(43, 5)
    }
})
function GoStraight () {
    latest = LeftDis
    basic.pause(100)
    while (true) {
        if (LeftDis > WallMazeWidth || FrontDis < FrontSensorClearanceDis) {
            break;
        }
        nowLDLs = LeftDis
        if (nowLDLs < LeftSensorExpectedDis - 5 && !(nowLDLs - latest > errLDiS)) {
            TurnRight()
            basic.pause(50)
        } else if (nowLDLs > LeftSensorExpectedDis + 5 && !(latest - nowLDLs > errLDiS)) {
            TurnLeft()
            basic.pause(50)
        }
        Gohead()
        basic.pause(100)
        latest = nowLDLs
    }
}
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.Hash), function () {
    blecmd = bluetooth.uartReadUntil(serial.delimiters(Delimiters.Hash))
    blearg = ""
    let strs = blecmd.split(":", 2)
blecmd = strs[0]
    if (strs.length > 1) {
        blearg = strs[1]
    }
    if (blecmd.compare("calLeft") == 0) {
        bleCalCmd("calLeft", blearg, 42)
    } else if (blecmd.compare("calHead") == 0) {
        bleCalCmd("calHead", blearg, 43)
    } else if (blecmd.compare("leftSensor") == 0) {
        bluetooth.uartWriteValue("L", LeftDis)
    } else if (blecmd.compare("frontSensor") == 0) {
        bluetooth.uartWriteValue("F", FrontDis)
    } else {
        bluetooth.uartWriteLine("not support: " + blecmd)
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
function Stop () {
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.digitalWritePin(DigitalPin.P14, 0)
    pins.digitalWritePin(DigitalPin.P15, 0)
    pins.digitalWritePin(DigitalPin.P16, 0)
}
control.onEvent(EventBusSource.MES_BROADCAST_GENERAL_ID, EventBusValue.MES_ALERT_EVT_ALARM1, function () {
    basic.pause(1000)
    basic.showIcon(IconNames.Heart)
    while (true) {
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
let blearg = ""
let blecmd = ""
let nowLDLs = 0
let latest = 0
let Angle = 0
let FrontDis = 0
let LeftDis = 0
let errLDiS = 0
let 差距 = 0
let LPWM = 0
let RPWM = 0
let FrontSensorClearanceDis = 0
let LeftSensorExpectedDis = 0
let WallMazeWidth = 0
bluetooth.startUartService()
InitSensor()
WallMazeWidth = 120
let LeftSensorLocation = 20
let FrontSensorLocation = 30
LeftSensorExpectedDis = WallMazeWidth / 2 - LeftSensorLocation
FrontSensorClearanceDis = WallMazeWidth / 2 - FrontSensorLocation
RPWM = 180
LPWM = 200
差距 = 0.7
errLDiS = 4
control.raiseEvent(
EventBusSource.MES_BROADCAST_GENERAL_ID,
EventBusValue.MES_ALERT_EVT_ALARM1
)
bluetooth.uartWriteLine("inited")
