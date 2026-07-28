
namespace wallFollowing2 {
	import Driving = carState.Driving
	import Stop = miniTank.Stop
	const errLDiS = 4

	export function start() {
		let state = new carState.State()
		state.leftDistance = sensor.readLeftDis()
		state.frontDistance = sensor.readFrontDis()
		state.driving = carState.Driving.Ready
		carState.history.setLatest(state)

		while(true) {
			let nowState = new carState.State()

			let drivingDurationMs = autoDrive(nowState)

			basic.pause(drivingDurationMs)

			nowState.leftDistance = sensor.readLeftDis()
			carState.history.setLatest(nowState)

		}

	}

	function autoDrive(nowState: carState.State): number {
		let state0 = carState.history.get(0)
		if (state0.driving == carState.Driving.Stop) {
			miniTank.Stop()
			return 0
		}

		let state_1 = carState.history.get(-1)
		let diff = state_1.leftDistance - state0.leftDistance
		const AllowedDrift = 5
		if (state0.leftDistance < maze.LeftSensorExpectedDis - AllowedDrift && state0.driving == carState.Driving.GoingHead && diff > errLDiS) {
			miniTank.TurnRight()
			nowState.driving = carState.Driving.SlightRight
			return 800
		}

		if (state0.leftDistance > maze.LeftSensorExpectedDis + AllowedDrift && state0.driving == carState.Driving.GoingHead && diff < errLDiS * -1) {
			miniTank.TurnLeft()
			nowState.driving = carState.Driving.SlightLeft
			return 800
		}

		if (state0.driving == carState.Driving.Ready || state0.driving == carState.Driving.SlightLeft
			|| state0.driving == carState.Driving.SlightRight) {
			miniTank.Gohead()
			nowState.driving = carState.Driving.GoingHead
			return 800
		}

		miniTank.Stop()
		nowState.driving = carState.Driving.Stop
		return 0
	}

}