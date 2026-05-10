
namespace carState {
	export function isEnd() {
		return end
	}

	export function ending() {
		end = true
	}

	export function notEnd() {
		end = false
	}

	let end = false
}
