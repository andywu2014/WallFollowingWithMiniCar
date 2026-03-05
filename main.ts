function Gohead () {
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.analogSetPeriod(AnalogPin.P14, 20000)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    pins.analogWritePin(AnalogPin.P14, LPWM)
    pins.analogWritePin(AnalogPin.P15, RPWM)
}
function logLine (文本: string) {
    BleBuffer.push(文本)
}
function InitSensor () {
    LeftDis = 0
    FrontDis = 0
    pins.digitalWritePin(DigitalPin.P8, 0)
    pins.digitalWritePin(DigitalPin.P2, 0)
    pins.digitalWritePin(DigitalPin.P2, 1)
    // LeftSensor
    VL6180.initVL6180(leftSensorAddr)
    pins.digitalWritePin(DigitalPin.P8, 1)
    // FrontSensor
    VL6180.initVL6180(43)
    VL6180.setRangOffsetCalibration(leftSensorAddr, 20)
}
function TurnLeft () {
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.analogSetPeriod(AnalogPin.P14, 20000)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    pins.analogWritePin(AnalogPin.P14, LPWM * 差距)
    pins.analogWritePin(AnalogPin.P15, RPWM)
}
function Right90Turning () {
    Angle = (input.compassHeading() + 80 + 360) % 360
    for (let index = 0; index < 10; index++) {
        ZeroRadiusRight()
        if (input.compassHeading() >= Angle) {
            break;
        }
    }
}
function CalibrateLeftSensor () {
    VL6180.offsetCalibrationAt50mm(42, 50)
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
})
function logValue (文本: string, 数字: number) {
    BleBuffer.push("" + 文本 + ":" + convertToText(数字))
}
function GoStraight () {
    Direction2 = 0
    nowLDLs = readLeftDis()
    while (true) {
        logValue("nowLDls", nowLDLs)
        logValue("l-n", latest - nowLDLs)
        if (nowLDLs > WallMazeWidth || FrontDis < FrontSensorClearanceDis || stop == 1) {
            stop = 0
            logLine("Break")
            break;
        }
        if (nowLDLs < LeftSensorExpectedDis - 5 && Direction2 > errLDiS) {
            logLine("will turn right")
            TurnRight()
            basic.pause(800)
            logLine("turned right")
            Direction2 = 0
            nowLDLs = readLeftDis()
        } else if (nowLDLs > LeftSensorExpectedDis + 5 && Direction2 < errLDiS * -1) {
            logLine("will turn left")
            TurnLeft()
            basic.pause(800)
            logLine(" turned left")
            Direction2 = 0
            nowLDLs = readLeftDis()
        } else {
            logLine("will go head")
            if (Direction2 == 0) {
                latest = nowLDLs
            }
            Gohead()
            basic.pause(100)
            logLine("went head")
            nowLDLs = readLeftDis()
            Direction2 = latest - nowLDLs
        }
    }
}
// LeftSensor
// 暂停使用,地址随便设为97
VL6180.continualRange(97, function (value) {
    LeftLast5 = VL6180.averageLastest(42, 5) + 10
    if (Math.abs(value + 10 - LeftDis) >= 10) {
        LeftDis = value + 10
        VL6180.clearBuffer(42)
    } else {
        LeftDis = LeftLast5
    }
    bluetooth.uartWriteValue("value", value + 10)
    bluetooth.uartWriteValue("leftLast5", LeftLast5)
    bluetooth.uartWriteValue("leftDis", LeftDis)
    bluetooth.uartWriteValue("Farthest", LeftSensorExpectedDis + 5)
    bluetooth.uartWriteValue("CloseTo", LeftSensorExpectedDis - 5)
    bluetooth.uartWriteValue("left", LeftDis)
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
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.Hash), function () {
    bleargs = bluetooth.uartReadUntil(serial.delimiters(Delimiters.Hash)).split(" ")
    blecmd = bleargs.shift()
    if (blecmd.compare("GoStraight") == 0) {
        bluetooth.uartWriteLine(">>GoStraight OK")
        GoStraight()
        Stop()
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
    } else if (blecmd.compare("calleft") == 0) {
        bluetooth.uartWriteLine(">>CalibrateLeftSensor OK")
        CalibrateLeftSensor()
    } else if (blecmd.compare("leftoffset") == 0) {
        bluetooth.uartWriteLine(">>" + convertToText(VL6180.rangOffsetCalibration(42)))
    } else if (blecmd.compare("gohead") == 0) {
        bluetooth.uartWriteLine(">>" + "LPWM=" + convertToText(LPWM) + "; RPWM=" + convertToText(RPWM))
        TestGohead()
    } else if (blecmd.compare("setrpwm") == 0 && bleargs.length == 1) {
        RPWM = parseFloat(bleargs.shift())
        bluetooth.uartWriteLine(">>" + "LPWM=" + convertToText(LPWM) + "; RPWM=" + convertToText(RPWM))
    } else {
        bluetooth.uartWriteLine(">>leftSensor: leftSensor")
        bluetooth.uartWriteLine(">>frontSensor: frontSensor")
        bluetooth.uartWriteLine(">>GoStraight: GoStraight")
        bluetooth.uartWriteLine(">>stop: stop car")
        bluetooth.uartWriteLine(">>calleft: CalibrateLeftSensor")
        bluetooth.uartWriteLine(">>leftoffset: show left offset")
        bluetooth.uartWriteLine(">>gohead: test gohead")
        bluetooth.uartWriteLine(">>setrpwm xxx: set rpwm = xxx(number)")
    }
})
function TestGohead () {
    Gohead()
    for (let index = 0; index < 50; index++) {
        bluetooth.uartWriteValue("left", readLeftDis())
        basic.pause(100)
    }
    Stop()
}
input.onButtonPressed(Button.B, function () {
    control.raiseEvent(
    EventBusSource.MES_BROADCAST_GENERAL_ID,
    EventBusValue.MES_ALERT_EVT_ALARM1
    )
})
function readLeftDis () {
    return VL6180.averageLastest(leftSensorAddr, 5)
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
            bluetooth.uartWriteLine(">>Left90Turning OK")
            Left90Turning()
        } else if (FrontDis < FrontSensorClearanceDis) {
            bluetooth.uartWriteLine(">>Right90Turning OK")
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
let blecmd = ""
let bleargs: string[] = []
let LeftLast5 = 0
let latest = 0
let nowLDLs = 0
let Direction2 = 0
let Angle = 0
let FrontDis = 0
let LeftDis = 0
let BleBuffer: string[] = []
let stop = 0
let errLDiS = 0
let 差距 = 0
let LPWM = 0
let RPWM = 0
let FrontSensorClearanceDis = 0
let LeftSensorExpectedDis = 0
let WallMazeWidth = 0
let ending = false
let leftSensorAddr = 0
bluetooth.startUartService()
leftSensorAddr = 42
InitSensor()
ending = false
WallMazeWidth = 110
let LeftSensorLocation = 20
let FrontSensorLocation = 30
LeftSensorExpectedDis = WallMazeWidth / 2 - LeftSensorLocation
FrontSensorClearanceDis = WallMazeWidth / 2 - FrontSensorLocation
RPWM = 175
LPWM = 200
差距 = 0.7
errLDiS = 4
stop = 0
BleBuffer = []
bluetooth.uartWriteLine("inited")
control.inBackground(function () {
    while (true) {
        basic.pause(10)
        if (BleBuffer.length == 0) {
            continue;
        }
        bluetooth.uartWriteLine(BleBuffer.shift())
    }
})
