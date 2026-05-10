
namespace wallFollowing {

	export function GoStraight () {
		let Direction2 = 0
		let nowLDLs = sensor.readLeftDis()
		let latest = 0

		while (true) {
			bleLog.logValue("nowLDls", nowLDLs)
			bleLog.logValue("l-n", latest - nowLDLs)
			if (nowLDLs > WallMazeWidth || sensor.readFrontDis() < FrontSensorClearanceDis || carState.isEnd()) {
				bleLog.logLine("Break")
				break;
			}
			if (nowLDLs < LeftSensorExpectedDis - 5 && Direction2 > errLDiS) {
				bleLog.logLine("will turn right")
				miniTank.TurnRight()
				basic.pause(800)
				bleLog.logLine("turned right")
				Direction2 = 0
				nowLDLs = sensor.readLeftDis()
			} else if (nowLDLs > LeftSensorExpectedDis + 5 && Direction2 < errLDiS * -1) {
				bleLog.logLine("will turn left")
				miniTank.TurnLeft()
				basic.pause(800)
				bleLog.logLine(" turned left")
				Direction2 = 0
				nowLDLs = sensor.readLeftDis()
			} else {
				bleLog.logLine("will go head")
				if (Direction2 == 0) {
					latest = nowLDLs
				}
				miniTank.Gohead()
				basic.pause(100)
				bleLog.logLine("went head")
				nowLDLs = sensor.readLeftDis()
				Direction2 = latest - nowLDLs
			}
		}
	}

	export function Left90Turning () {
		miniTank.Gohead()
		bleLog.logLine("Left90Turning gohead")
		for (let index = 0; index < 5; index++) {
			basic.pause(100)
			if (sensor.readFrontDis() <= FrontSensorClearanceDis) {
				bleLog.logLine("Left90Turning break")
				break;
			}
		}
		let Angle = (input.compassHeading() - 80 + 360) % 360
		for (let index = 0; index < 10; index++) {
			bleLog.logLine("Left90Turning before ZeroRadiusLeft")
			miniTank.ZeroRadiusLeft()
			if (input.compassHeading() <= Angle) {
				break;
			}
		}
		miniTank.Gohead()
		bleLog.logLine("Left90Turning gohead2")
		for (let index = 0; index < 5; index++) {
			basic.pause(100)
			if (sensor.readFrontDis() <= FrontSensorClearanceDis) {
				bleLog.logLine("Left90Turning break2")
				break;
			}
		}
	}

	export function Right90Turning () {
		let Angle = (input.compassHeading() + 80 + 360) % 360
		for (let index = 0; index < 10; index++) {
			miniTank.ZeroRadiusRight()
			if (input.compassHeading() >= Angle) {
				break;
			}
		}
	}

	export function run() {
		carState.notEnd()
		basic.pause(1000)
		//remove the first value
		let leftDis = sensor.readLeftDis()
		let frontDis = sensor.readFrontDis()
		basic.showIcon(IconNames.Sword)
		while (!carState.isEnd()) {
			leftDis = sensor.readLeftDis()
			frontDis = sensor.readFrontDis()
			bleLog.logValue("frontDis", frontDis)
			bleLog.logValue("leftDis", leftDis)
			if (leftDis > WallMazeWidth) {
				bleLog.logLine("Left90Turning OK")
				Left90Turning()
			} else if (frontDis < FrontSensorClearanceDis) {
				bleLog.logLine("Right90Turning OK")
				Right90Turning()
			} else {
				bleLog.logLine("GoStraight OK")
				GoStraight()
			}
		}
	}

	const errLDiS = 4
	const WallMazeWidth = 110

	export const LeftSensorLocation = 20
	export const FrontSensorLocation = 30
	const FrontSensorClearanceDis = WallMazeWidth / 2 - FrontSensorLocation
	const LeftSensorExpectedDis = WallMazeWidth / 2 - LeftSensorLocation
}
