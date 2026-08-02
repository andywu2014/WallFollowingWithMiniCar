
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

		while(true) {
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

		carState.history.setLatest(state)
	}

	let numCycles = 1
	function autoDrive(nowState: carState.State): number {
		bleLog.logValue("numCycles",numCycles)
		numCycles = numCycles+1
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

		if (state0.leftDistance > WallMazeWidth){
			bleLog.logLine("Left90Turning OK")

		}
		if (state0.driving == Driving.GoingTargetDist) {
			let S0 = 0
			let S1 = 0
			let V0 = 0
			let V1 = 0
			const deltaT = 300
			let deltaV = 0
			let deltaS = 0
			while (S1 < 30) {
				deltaV = input.acceleration(Dimension.X) * deltaT
				V1 = V0 + deltaV
				deltaS = ((V1 + V0) * deltaT) / 2
				S1 = S0 + deltaS
				S0 = S1
				V0 = V1
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