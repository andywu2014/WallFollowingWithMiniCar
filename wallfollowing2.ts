
namespace wallFollowing2 {
	import Driving = carState.Driving
	import logLine = bleLog.logLine
	import WallMazeWidth = maze.WallMazeWidth
	import Left90Turning = wallFollowing.Left90Turning
	const errLDiS = 4

	export function start() {
		basic.showNumber(0)
		ready()
		basic.showNumber(1)
		let numCycles = 1

		while(true) {
			bleLog.logValue("---numCycles---", numCycles)
			numCycles = numCycles + 1

			let nowState = new carState.State()
			let drivingDurationMs = autoDrive(nowState)

			basic.pause(drivingDurationMs)
			nowState.leftDistance = sensor.readLeftDis()
			nowState.frontDistance = sensor.readFrontDis()
			nowState.time = control.millis()
			carState.history.setLatest(nowState)

			bleLog.logLine(nowState.toLog())

			if (nowState.driving == carState.Driving.Stop) {
				bleLog.logLine("break")
				break
			}
		}

	}

	function ready(){
		let state = new carState.State()
		state.leftDistance = sensor.readLeftDis()
		state.frontDistance = sensor.readFrontDis()
		state.driving = carState.Driving.Ready
		state.time = control.millis()
		state.speed = 0
		state.distance = 0
		carState.history.setLatest(state)
	}


	function autoDrive(nowState: carState.State): number {
		bleLog.logValue("V:",(pins.analogReadPin(AnalogPin.P1)))
		const minFrontDis = 40
		let state0 = carState.history.get(0)
		if (state0.driving == carState.Driving.Stop) {
			miniTank.Stop()
			return 0
		}

		let state_1 = carState.history.get(-1)
		let history_id = -1
		while(history_id > -carState.HistoryLen + 1 && carState.history.get(history_id).driving == Driving.GoingHead){
			history_id = history_id - 1
		}
		let goHeadMax = carState.history.get(history_id).leftDistance
		let diff = goHeadMax - state0.leftDistance
		bleLog.logValue("diff", diff)


		if (state0.driving == Driving.GoingTargetDist) {
			let deltaV = 0
			let deltaT = 300
			let deltaS = 0
			let V1 = 0
			let S1 = 0
			deltaV = -input.acceleration(Dimension.Y) * deltaT
			V1 = state0.speed + deltaV
			deltaS = ((V1 + state0.speed) * deltaT) / 2
			S1 = state0.distance + deltaS
			state0.distance = S1
			state0.speed = V1
			if (S1 == 30){
				//todo 设置driving
				return 0
			}


		}
		const AllowedDrift = 5
		if (state0.leftDistance < maze.LeftSensorExpectedDis - AllowedDrift && state0.driving == carState.Driving.GoingHead && diff > errLDiS
				&& state0.frontDistance > minFrontDis) {
			bleLog.logLine("TurnRight OK")

			miniTank.TurnRight()
			nowState.driving = carState.Driving.SlightRight
			return 800
		}

		if (state0.leftDistance > maze.LeftSensorExpectedDis + AllowedDrift && state0.driving == carState.Driving.GoingHead && diff < errLDiS * -1
			&& state0.frontDistance > minFrontDis) {
			bleLog.logLine("TurnLeft OK")
			miniTank.TurnLeft()
			nowState.driving = carState.Driving.SlightLeft
			return 800
		}

		if ((state0.driving == carState.Driving.Ready || state0.driving == carState.Driving.SlightLeft
			|| state0.driving == carState.Driving.SlightRight || state0.driving == carState.Driving.GoingHead)
			&& state0.frontDistance > minFrontDis) {
			bleLog.logLine("GoHead OK")
			miniTank.Gohead()
			nowState.driving = carState.Driving.GoingHead
			return 800
		}

		miniTank.Stop()
		nowState.driving = carState.Driving.Stop
		return 0
	}



}