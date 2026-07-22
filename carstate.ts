
namespace carState {
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
		Stop, GoingHead, SlightRight, SlightLeft, Prepare
	}

	//todo 方便新建State
	export class State {
		valid : boolean = false
		driving: Driving
		leftDistance: number
		frontDistance: number
    angel: number
		time: number

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

		// todo new
		allHistories: State[] = []
		latestIndex: number = -1
	}

	export const history = new History()
}
