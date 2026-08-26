
namespace wallFollowing2 {
	import Driving = carState.Driving
	import logLine = bleLog.logLine
	import WallMazeWidth = maze.WallMazeWidth
	import Left90Turning = wallFollowing.Left90Turning
	import State = carState.State
	// const errLDiS = 4

	export function start() {
		basic.showNumber(0)
		ready()
		basic.showNumber(1)
		let numCycles = 1

		while(true) {
			bleLog.logValue("---numCycles---", numCycles)
			numCycles = numCycles + 1

			let nextState = new carState.State()
			let drivingDurationMs = autoDrive(nextState)

			basic.pause(drivingDurationMs)

			nextState.leftDistance = sensor.readLeftDis()
			nextState.frontDistance = sensor.readFrontDis()
			nextState.time = control.millis()
			carState.history.setLatest(nextState)

			bleLog.logLine(nextState.toLog())

			if (nextState.driving == carState.Driving.Stop) {
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
		state.angel = 0
		carState.history.setLatest(state)
	}

	type ModelDriver = (nextState: carState.State)=>number

	export let allModelDrivers: ModelDriver[] = []
	for (let i = 0; i < Driving.ALL; i++) {
		allModelDrivers.push(function (nextState: carState.State) {
			nextState.driving = Driving.Stop
			miniTank.Stop()
			return 0})
	}

	function autoDrive(nextState: carState.State): number {
		let nowState = carState.history.get(0)
		return allModelDrivers[nowState.driving](nextState)
	}

		// bleLog.logValue("V:",(pins.analogReadPin(AnalogPin.P1)))
		// const minFrontDis = 40
		// let state0 = carState.history.get(0)
		// if (state0.driving == carState.Driving.Stop) {
		// 	miniTank.Stop()
		// 	return 0
		// }
		//
		// let state_1 = carState.history.get(-1)
		// let history_id = -1
		// while(history_id > -carState.HistoryLen + 1 && carState.history.get(history_id).driving == Driving.GoingHead){
		// 	history_id = history_id - 1
		// }
		// let goHeadMax = carState.history.get(history_id).leftDistance
		// let diff = goHeadMax - state0.leftDistance
		// bleLog.logValue("diff", diff)
		//
		//
		// if (state0.driving == Driving.GoingTargetDist) {
		// 	let deltaV = 0
		// 	let deltaT = 300
		// 	let deltaS = 0
		// 	let V1 = 0
		// 	let S1 = 0
		// 	deltaV = -input.acceleration(Dimension.Y) * deltaT
		// 	V1 = state0.speed + deltaV
		// 	deltaS = ((V1 + state0.speed) * deltaT) / 2
		// 	S1 = state0.distance + deltaS
		// 	state0.distance = S1
		// 	state0.speed = V1
		// 	if (S1 == 30){
		// 		//todo 设置driving
		// 		return 0
		// 	}
		//
		//
		// }
		// const AllowedDrift = 5
		// if (state0.leftDistance < maze.LeftSensorExpectedDis - AllowedDrift && state0.driving == carState.Driving.GoingHead && diff > errLDiS
		// 		&& state0.frontDistance > minFrontDis && state0.leftDistance < maze.WallMazeWidth) {
		// 	bleLog.logLine("TurnRight OK")
		// 	miniTank.TurnRight()
		// 	nextState.driving = carState.Driving.SlightRight
		// 	return 500
		// }
		//
		// if (state0.leftDistance > maze.LeftSensorExpectedDis + AllowedDrift && state0.leftDistance < maze.WallMazeWidth
		// 	&&state0.driving == carState.Driving.GoingHead && diff < errLDiS * -1 && state0.frontDistance > minFrontDis) {
		// 	bleLog.logLine("TurnLeft OK")
		// 	miniTank.TurnLeft()
		// 	nextState.driving = carState.Driving.SlightLeft
		// 	return 500
		// }
		//
		// if (state0.leftDistance < maze.WallMazeWidth && (state0.driving == carState.Driving.Ready || state0.driving == carState.Driving.SlightLeft
		// 	|| state0.driving == carState.Driving.SlightRight || state0.driving == carState.Driving.GoingHead)
		// 	&& state0.frontDistance > minFrontDis) {
		// 	bleLog.logLine("GoHead OK")
		// 	miniTank.Gohead()
		// 	nextState.driving = carState.Driving.GoingHead
		// 	return 500
		// }
		//
		// if ((state0.driving == carState.Driving.SlightLeft || state0.driving == carState.Driving.SlightRight
		// 	|| state0.driving == carState.Driving.GoingHead) && state0.leftDistance > maze.WallMazeWidth ){
		// 	nextState.driving = Driving.GoingTargetDist
		// 	nextState.angel = input.compassHeading() - 90
		// 	if (nextState.angel < 0){
		// 		nextState.angel = 360 + nextState.angel
		// 	}
		// 	miniTank.Gohead()
		// 	return 500
		// }
		//
		// if (state0.driving == Driving.GoingTargetDist) {
		// 	nextState.angel = state0.angel
		// 	if (input.compassHeading() - state0.angel > 300){
		// 		nextState.driving = Driving.LeftBack
		// 		return 0
		// 	}
		// 	if (state0.angel - input.compassHeading() >= 0){
		// 		nextState.driving = Driving.LeftBack
		// 		return 0
		// 	}
		// 	miniTank.Left90()
		// 	return 500
		// }
		//
		// if (state0.driving == Driving.LeftBack){
		// 	state0.driving = Driving.Stop
		// 	miniTank.Stop()
		// 	return 0
		// }
		// if (state0.driving == Driving.GoingTargetDist && state0.leftDistance > maze.WallMazeWidth){
		// 	nowState.driving = Driving.LeftBack
		// 	miniTank.Gohead()
		// 	return 500
		// }
		//
		//
		// if (state0.driving == Driving.GoingTargetDist && state0.frontDistance > minFrontDis){
		// 	nowState.driving = Driving.RightBack
		// 	miniTank.Gohead()
		// 	return 500
		// }
		//
		// if (state0.driving == Driving.LeftBack){
		// }
		//
		// if (state0.driving == Driving.LeftBack){
		//
		// }
		//
		// miniTank.Stop()
		// nextState.driving = carState.Driving.Stop
		// return 0

}

namespace wallFollowing2 {
	const errLDiS = 4
	const allowedDrift = 5
	const minFrontDis = 40

	allModelDrivers[Driving.Ready] = function (nextState: carState.State): number {
		bleLog.logLine("GoHead OK")

		miniTank.GoForward(miniTank.Straight)
		nextState.driving = carState.Driving.GoingHead
		return 500
	}

	allModelDrivers[Driving.GoingHead] = function (nextState: carState.State): number {
		let nowState = carState.history.get(0)
		let history_id = -1
		while(history_id > -carState.HistoryLen + 1 && carState.history.get(history_id).driving == Driving.GoingHead){
			history_id = history_id - 1
		}
		let goHeadMax = carState.history.get(history_id).leftDistance
		let diff = goHeadMax - nowState.leftDistance
		bleLog.logValue("diff", diff)

		if (nowState.leftDistance >= maze.WallMazeWidth ){
			nextState.driving = Driving.PreLeft90
			miniTank.GoForward(miniTank.Straight)
			return 500
		}

		if (nowState.frontDistance <= minFrontDis) {
			nextState.driving = Driving.Right90
			miniTank.GoForward(miniTank.Right90)
			return 1500
		}

		if (nowState.leftDistance < maze.LeftSensorExpectedDis - allowedDrift && diff > errLDiS) {
			bleLog.logLine("TurnRight OK")
			miniTank.GoForward(miniTank.RightSlight)
			nextState.driving = carState.Driving.SlightRight
			return 500
		}

		if (nowState.leftDistance > maze.LeftSensorExpectedDis + allowedDrift && diff < errLDiS * -1 ) {
			bleLog.logLine("TurnLeft OK")
			miniTank.GoForward(miniTank.LeftSlight)
			nextState.driving = carState.Driving.SlightLeft
			return 500
		}

		bleLog.logLine("GoHead OK")
		miniTank.GoForward(miniTank.Straight)
		nextState.driving = carState.Driving.GoingHead
		return 500
	}

	allModelDrivers[Driving.SlightLeft] = function (nextState: carState.State): number {
		const minFrontDis = 40
		let nowState = carState.history.get(0)

		if (nowState.leftDistance >= maze.WallMazeWidth ){
			nextState.driving = Driving.PreLeft90
			miniTank.GoForward(miniTank.Straight)
			return 500
		}

		if (nowState.frontDistance <= minFrontDis) {
			nextState.driving = Driving.Right90
			miniTank.GoForward(miniTank.Right90)
			return 1500
		}

		bleLog.logLine("GoHead OK")
		miniTank.GoForward(miniTank.Straight)
		nextState.driving = carState.Driving.GoingHead
		return 500
	}

	allModelDrivers[Driving.SlightRight] = function (nextState: carState.State): number {
		const minFrontDis = 40
		let nowState = carState.history.get(0)

		if (nowState.leftDistance >= maze.WallMazeWidth ){
			nextState.driving = Driving.PreLeft90
			miniTank.GoForward(miniTank.Straight)
			return 500
		}

		if (nowState.frontDistance <= minFrontDis) {
			nextState.driving = Driving.Right90
			miniTank.GoForward(miniTank.Right90)
			return 1500
		}
		bleLog.logLine("GoHead OK")
		miniTank.GoForward(miniTank.Straight)
		nextState.driving = carState.Driving.GoingHead
		return 500
	}

	allModelDrivers[Driving.PreLeft90] = function (nextState: carState.State): number {
		nextState.driving = Driving.Left90
		miniTank.GoForward(miniTank.Left90)
		return 1100
	}

	allModelDrivers[Driving.Left90] = function (nextState: carState.State): number {
		miniTank.GoForward(miniTank.Straight)
		nextState.driving = Driving.GoingHead
		return 500
	}

	allModelDrivers[Driving.Right90] = function (nextState: carState.State): number {
		let nowState = carState.history.get(0)

		if (nowState.frontDistance <= minFrontDis) {
			nextState.driving = Driving.GoingBack
			miniTank.GoBack(miniTank.Straight)
			return 300
		}

		bleLog.logLine("GoHead OK")
		miniTank.GoForward(miniTank.Straight)
		nextState.driving = carState.Driving.GoingHead
		return 500
	}

	allModelDrivers[Driving.GoingBack] = function (nextState: carState.State): number {
		nextState.driving = Driving.Right90
		miniTank.GoForward(miniTank.Right90)
		return 1500
	}

}












