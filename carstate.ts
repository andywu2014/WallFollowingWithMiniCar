
namespace carState {
	import Stop = miniTank.Stop

	export function isEnd(): boolean {
		return end
	}

	function setEnding(v: boolean) {
		end = v
	}


	export function ending() {
		end = true
	}

	export function notEnd() {
		end = false
	}

	let end = false

	export enum Driving {
		Stop, Ready, GoingHead, SlightRight, SlightLeft, Right90, PreLeft90, Left90, GoingBack, ALL
	}
	const drivingStrs: string[] = ["Stop", "GoingHead", "SlightRight", "SlightLeft", "Ready"]
	export function DrivingToStr(d: Driving): string {
		return drivingStrs[d]
	}

	export class State {
		driving: Driving
		leftDistance: number
		frontDistance: number
    angel: number
		time: number
		distance: number
		speed: number

		constructor(){
			this.driving = Driving.Stop
			this.leftDistance = 0
			this.frontDistance = 0
			this.angel = 0
			this.time = 0
			this.distance = 0
			this.speed = 0
		}

		toLog(): string {
			return "time:" + convertToText(this.time) + "; driving:" + carState.DrivingToStr(this.driving)
				+ "; left:" + convertToText(this.leftDistance) +"; front:" + convertToText(this.frontDistance)
				// + "; angel:" + convertToText(this.angel)
		}
	}

	export const HistoryLen = 5
	export class History{
		// hisIndex : 0, -1, -2 ... -MaxLen
		get(hisIndex: number): State {
			if (hisIndex <= -HistoryLen || hisIndex > 0) {
			  return new State()
			}
			// let index = (this.latestIndex + hisIndex + HistoryLen) % HistoryLen
			let index = this.latestIndex + hisIndex
			if (index < 0) {
				index = index + HistoryLen
			}
			return this.allHistories[index]
		}

		setLatest(v: State) {
			let index = (this.latestIndex + 1) % HistoryLen
			this.allHistories[index] = v
			this.latestIndex = index
		}

		allHistories: State[] = []
		latestIndex: number = -1
		constructor(){
			for (let i = 0; i < HistoryLen; i++) {
				this.allHistories.push(new State())
			}
			this.latestIndex = -1
		}

	}

	export const history = new History()
}
