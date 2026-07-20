
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

	class State {
		stop: boolean
		leftDistance: number
		frontDistance: number
    angel: number
		time: number
	}

	const HistoryLen = 5
	class History{
		// hisIndex : 0, -1, -2 ... -MaxLen
		get(hisIndex: number): State {
			// hisIndex ---> 3?
			// todo 2-4=-2 但应该是3
			// todo 整合在一起
			if (hisIndex == 0) {
				return this.allHistories[this.latestIndex]
			}
			if (hisIndex == -1) {
				return this.allHistories[this.latestIndex-1]
			}
			if (hisIndex == -2) {
				return this.allHistories[this.latestIndex-2]
			}
			if (hisIndex == -3) {
				return this.allHistories[this.latestIndex-3]
			}
			if (hisIndex == -4) {
				return this.allHistories[this.latestIndex-4]
			}
			return this.allHistories[3]
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
}
