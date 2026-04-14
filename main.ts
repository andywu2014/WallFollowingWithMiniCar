import logLine = BleLog.logLine
import logValue = BleLog.logValue

function Gohead () {
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.analogSetPeriod(AnalogPin.P14, 20000)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    pins.analogWritePin(AnalogPin.P14, LPWM)
    pins.analogWritePin(AnalogPin.P15, RPWM)
}

function InitSensor () {
    pins.digitalWritePin(DigitalPin.P8, 0)
    pins.digitalWritePin(DigitalPin.P2, 0)
    pins.digitalWritePin(DigitalPin.P2, 1)
    // LeftSensor
    VL6180.initVL6180(leftSensorAddr)
    pins.digitalWritePin(DigitalPin.P8, 1)
    // FrontSensor
    VL6180.initVL6180(frontSensorAddr)
    VL6180.setRangOffsetCalibration(leftSensorAddr, 20)
    VL6180.setRangOffsetCalibration(frontSensorAddr, 20)
}
function TurnLeft () {
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.analogSetPeriod(AnalogPin.P14, 20000)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    pins.analogWritePin(AnalogPin.P14, LPWM * 差距)
    pins.analogWritePin(AnalogPin.P15, RPWM)
}
function readFrontDis () {
    return VL6180.readRange(frontSensorAddr)
    // return VL6180.averageLastest(frontSensorAddr, 1)
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


function GoStraight () {
    Direction2 = 0
    nowLDLs = readLeftDis()
    while (true) {
        logValue("nowLDls", nowLDLs)
        logValue("l-n", latest - nowLDLs)
        if (nowLDLs > WallMazeWidth || readFrontDis() < FrontSensorClearanceDis || stop == 1) {
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


input.onButtonPressed(Button.B, function () {
    control.raiseEvent(
    EventBusSource.MES_BROADCAST_GENERAL_ID,
    EventBusValue.MES_ALERT_EVT_ALARM1
    )
})
function readLeftDis () {
    return VL6180.readRange(leftSensorAddr)
}
function Left90Turning () {
    Gohead()
    logLine("Left90Turning gohead")
    for (let index = 0; index < 5; index++) {
        basic.pause(100)
        if (readFrontDis() <= FrontSensorClearanceDis) {
            logLine("Left90Turning break")
            break;
        }
    }
    Angle = (input.compassHeading() - 80 + 360) % 360
    for (let index = 0; index < 10; index++) {
        logLine("Left90Turning before ZeroRadiusLeft")
        ZeroRadiusLeft()
        if (input.compassHeading() <= Angle) {
            break;
        }
    }
    Gohead()
    logLine("Left90Turning gohead2")
    for (let index = 0; index < 5; index++) {
        basic.pause(100)
        if (readFrontDis() <= FrontSensorClearanceDis) {
            logLine("Left90Turning break2")
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
    //remove the first value
    leftDis = readLeftDis()
    frontDis = readFrontDis()
    basic.showIcon(IconNames.Sword)
    while (stop == 0) {
        leftDis = readLeftDis()
        frontDis = readFrontDis()
        logValue("frontDis", frontDis)
        logValue("leftDis", leftDis)
        if (leftDis > WallMazeWidth) {
            logLine("Left90Turning OK")
            Left90Turning()
        } else if (frontDis < FrontSensorClearanceDis) {
            logLine("Right90Turning OK")
            Right90Turning()
        } else {
            logLine("GoStraight OK")
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
    logLine("ZeroRadiusLeft front")
    basic.pause(500)
    Stop()
    basic.pause(100)
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.analogSetPeriod(AnalogPin.P14, 20000)
    pins.analogWritePin(AnalogPin.P14, 100)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.analogWritePin(AnalogPin.P15, 200)
    pins.digitalWritePin(DigitalPin.P16, 0)
    logLine("ZeroRadiusLeft back")
    basic.pause(500)
    Stop()
    basic.pause(100)
}
let frontDis = 0
let leftDis = 0
let blecmd = ""
let bleargs: string[] = []
let latest = 0
let nowLDLs = 0
let Direction2 = 0
let Angle = 0

let stop = 0
let errLDiS = 0
let 差距 = 0
let LPWM = 0
let RPWM = 0
let FrontSensorClearanceDis = 0
let LeftSensorExpectedDis = 0
let LeftSensorLocation = 0
let WallMazeWidth = 0
let frontSensorAddr = 0
let leftSensorAddr = 0
let ending = false

leftSensorAddr = 42
frontSensorAddr = 43
InitSensor()
WallMazeWidth = 110
LeftSensorLocation = 20
let FrontSensorLocation = 30
LeftSensorExpectedDis = WallMazeWidth / 2 - LeftSensorLocation
FrontSensorClearanceDis = WallMazeWidth / 2 - FrontSensorLocation
RPWM = 175
LPWM = 200
差距 = 0.7
errLDiS = 4
stop = 0



