
namespace wallFollowing2 {
	const errLDiS = 4

	export function start() {
		let state = new carState.State()
		state.leftDistance = sensor.readLeftDis()
		state.frontDistance = sensor.readFrontDis()
		state.driving = carState.Driving.Prepare

		for (let i = 0; i < carState.HistoryLen; i++) {
			carState.history.setLatest(state)
		}

		let nowState = new carState.State()

		while(true) {

			// 没有干完的上一轮
			basic.pause(800)

			nowState.leftDistance = sensor.readLeftDis()
			carState.history.setLatest(nowState)

			// next process  本轮

			let state0 = carState.history.get(0)

			if (state0.driving == carState.Driving.Stop) {
				break
			}

			let state_1 = carState.history.get(-1)
			let diff = state_1.leftDistance - state0.leftDistance

			if (state0.leftDistance < maze.LeftSensorExpectedDis - 5 && state0.driving == carState.Driving.GoingHead && diff > errLDiS) {
				miniTank.TurnRight()
				nowState.driving = carState.Driving.SlightRight
				continue
			}

			if (state0.leftDistance > maze.LeftSensorExpectedDis + 5 && state0.driving == carState.Driving.GoingHead && diff < errLDiS * -1) {
				miniTank.TurnLeft()
				nowState.driving = carState.Driving.SlightLeft
				continue
			}

			if (state0.driving == carState.Driving.Prepare || state0.driving == carState.Driving.SlightLeft
				|| state0.driving == carState.Driving.SlightRight) {
				miniTank.Gohead()
				nowState.driving = carState.Driving.GoingHead
				continue
			}


		}
	}
}