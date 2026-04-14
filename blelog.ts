


namespace BleLog {
	const BleBuffer: string[] = []

	export function logLine (text: string) {
		BleBuffer.push(text)
	}

	export function logValue (text: string, value: number) {
		BleBuffer.push("" + text + ":" + convertToText(value))
	}

	control.inBackground(function () {
		while (true) {
			basic.pause(10)
			if (BleBuffer.length == 0) {
				continue;
			}
			bluetooth.uartWriteLine(BleBuffer.shift())
		}
	})
}