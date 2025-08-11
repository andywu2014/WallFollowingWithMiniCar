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
        LeftDis = LeftDis - LeftSensorLocation
    }
    bluetooth.uartWriteValue("L", LeftDis)
})
function Right90Turning () {
    for (let index = 0; index < 6; index++) {
        ZeroRadiusRight()
    }
}
// FrontSensor
VL6180.continualRange(43, function (value) {
    if (Math.abs(value - FrontDis) >= 10) {
        FrontDis = value
        VL6180.clearBuffer(43)
    } else {
        let FrontalSensorLocation = 0
        FrontDis = VL6180.averageLastest(43, 5)
        FrontDis = FrontDis - FrontalSensorLocation
    }
    bluetooth.uartWriteValue("F", FrontDis)
})
function GoStraight () {
    latest = LeftDis
    basic.pause(100)
    while (true) {
        if (LeftDis > 120 || FrontDis < FrontSensorClearanceDis) {
            break;
        }
        nowLDLs = LeftDis
        if (nowLDLs < LeftSensorExpectedDis && !(nowLDLs - latest > errLDiS)) {
            TurnRight()
            basic.pause(50)
        } else if (nowLDLs > LeftSensorExpectedDis && !(latest - nowLDLs > errLDiS)) {
            TurnLeft()
            basic.pause(50)
        }
        Gohead()
        basic.pause(100)
        latest = nowLDLs
    }
}
function Left90Turning () {
    Gohead()
    basic.pause(200)
    for (let index = 0; index < 6; index++) {
        ZeroRadiusLeft()
    }
    Gohead()
    basic.pause(500)
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
        if (LeftDis > 120) {
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
let FrontDis = 0
let LeftDis = 0
let errLDiS = 0
let 差距 = 0
let LPWM = 0
let RPWM = 0
let FrontSensorClearanceDis = 0
let LeftSensorExpectedDis = 0
let LeftSensorLocation = 0
bluetooth.startUartService()
InitSensor()
let WallMazeWidth = 120
LeftSensorLocation = 20
let FrontSensorLocation = 30
LeftSensorExpectedDis = WallMazeWidth / 2 - LeftSensorLocation
FrontSensorClearanceDis = WallMazeWidth / 2 - FrontSensorLocation
RPWM = 300
LPWM = 300
差距 = 0.8
errLDiS = 0.5
let baseLine = 15
control.raiseEvent(
EventBusSource.MES_BROADCAST_GENERAL_ID,
EventBusValue.MES_ALERT_EVT_ALARM1
)
