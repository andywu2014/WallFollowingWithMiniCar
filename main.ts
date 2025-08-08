function Gohead () {
    pins.analogSetPeriod(AnalogPin.P13, 20000)
    pins.digitalWritePin(DigitalPin.P14, 0)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    pins.analogWritePin(AnalogPin.P13, LPWM)
    pins.analogWritePin(AnalogPin.P15, RPWM)
}
function InitSensor () {
    LeftDis = 0
    FrontDis = 0
    pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
    pins.setPull(DigitalPin.P8, PinPullMode.PullNone)
    pins.digitalWritePin(DigitalPin.P8, 1)
    pins.digitalWritePin(DigitalPin.P2, 0)
    // FrontSensor
    VL6180.initVL6180(41)
    if (false) {
        pins.digitalWritePin(DigitalPin.P2, 1)
        pins.digitalWritePin(DigitalPin.P8, 0)
        // LeftSensor
        VL6180.initVL6180(42)
        pins.digitalWritePin(DigitalPin.P2, 1)
        pins.digitalWritePin(DigitalPin.P8, 1)
    }
}
function 右转 () {
    pins.analogSetPeriod(AnalogPin.P13, 20000)
    pins.digitalWritePin(DigitalPin.P14, 0)
    pins.digitalWritePin(DigitalPin.P15, 0)
    pins.analogSetPeriod(AnalogPin.P16, 20000)
    PWM_1 = DigitalPin.P13
    PWM_2 = DigitalPin.P16
    pins.analogWritePin(PWM_1, PWM)
    pins.analogWritePin(PWM_2, PWM)
    basic.pause(100)
    pins.analogWritePin(PWM_1, 0)
    pins.analogWritePin(PWM_2, 0)
}
function 左转 () {
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.analogSetPeriod(AnalogPin.P14, 20000)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    PWM_1 = DigitalPin.P14
    PWM_2 = DigitalPin.P15
    pins.analogWritePin(PWM_1, PWM)
    pins.analogWritePin(PWM_2, PWM)
    basic.pause(100)
    pins.analogWritePin(PWM_2, 0)
    pins.analogWritePin(PWM_1, 0)
}
function TurnLeft () {
    pins.analogSetPeriod(AnalogPin.P13, 20000)
    pins.digitalWritePin(DigitalPin.P14, 0)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    pins.analogWritePin(AnalogPin.P13, LPWM * 差距)
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
    bluetooth.uartWriteValue("L", LeftDis)
})
function Right90Turning () {
    ZeroRadiusRight()
    basic.pause(100)
}
function win (history: number[], length: number, newValue: number) {
    history.push(newValue)
    if (history.length > length) {
        history.shift()
    }
    sum = 0
    min = 10000
    max = 0
    for (let 值 of history) {
        sum = sum + 值
        min = Math.min(min, 值)
        max = Math.max(max, 值)
    }
    sum = sum - 0 - min
    return sum / (history.length - 2)
}
function GoStraight () {
    latest = LDls
    basic.pause(100)
    while (true) {
        if (LDls > 3 * baseLine || Dls < baseLine) {
            break;
        }
        nowLDLs = LDls
        if (nowLDLs < baseLine - 5 && !(nowLDLs - latest > errLDiS)) {
            TurnRight()
            basic.pause(50)
        } else if (nowLDLs > baseLine + 5 && !(latest - nowLDLs > errLDiS)) {
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
    basic.pause(500)
    ZeroRadiusLeft()
    basic.pause(450)
    Gohead()
    basic.pause(2000)
}
function TurnRight () {
    pins.analogSetPeriod(AnalogPin.P13, 20000)
    pins.digitalWritePin(DigitalPin.P14, 0)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    pins.analogWritePin(AnalogPin.P13, LPWM)
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
    while (false) {
        if (LDls > 3 * baseLine) {
            Left90Turning()
        } else if (Dls < baseLine) {
            Right90Turning()
        } else {
            GoStraight()
        }
    }
})
function ZeroRadiusRight () {
    pins.analogSetPeriod(AnalogPin.P13, 20000)
    pins.digitalWritePin(DigitalPin.P14, 0)
    pins.digitalWritePin(DigitalPin.P15, 0)
    pins.analogSetPeriod(AnalogPin.P16, 20000)
    pins.analogWritePin(AnalogPin.P13, LPWM)
    pins.analogWritePin(AnalogPin.P16, RPWM)
}
function ZeroRadiusLeft () {
    pins.digitalWritePin(DigitalPin.P13, 0)
    pins.analogSetPeriod(AnalogPin.P14, 20000)
    pins.analogSetPeriod(AnalogPin.P15, 20000)
    pins.digitalWritePin(DigitalPin.P16, 0)
    pins.analogWritePin(AnalogPin.P14, LPWM)
    pins.analogWritePin(AnalogPin.P15, RPWM)
}
// FrontSensor
VL6180.continualRange(41, function (value) {
    if (Math.abs(value - FrontDis) >= 10) {
        FrontDis = value
        VL6180.clearBuffer(41)
    } else {
        FrontDis = VL6180.averageLastest(41, 5)
    }
    bluetooth.uartWriteValue("F", FrontDis)
})
let nowLDLs = 0
let Dls = 0
let LDls = 0
let latest = 0
let max = 0
let min = 0
let sum = 0
let PWM_2 = 0
let PWM_1 = 0
let FrontDis = 0
let LeftDis = 0
let baseLine = 0
let errLDiS = 0
let 差距 = 0
let PWM = 0
let RPWM = 0
let LPWM = 0
bluetooth.startUartService()
InitSensor()
LPWM = 600
RPWM = LPWM - 70
let minDis = 200
PWM = 512
差距 = 0.8
errLDiS = 0.5
baseLine = 25
let HeadDisHistory = [baseLine, baseLine]
let LDisHistory = [baseLine, baseLine]
control.raiseEvent(
EventBusSource.MES_BROADCAST_GENERAL_ID,
EventBusValue.MES_ALERT_EVT_ALARM1
)
