


namespace bleLog {
	class BufferValue<T> {
		constructor(public n: number, public val: T) {
		}
	}

	class EventObjectBuffer<T> {
		static LEN = 10
		private static EmptyFlag = -1

		buffer: BufferValue<T>[] = []

		// head 表示当前可以放数据的 index, 放完就需要+1，tail 表示最旧数据的 index
		// 如果是 head 追上 tail 就是满，此时  head == tail
		// 如果是 tail 追上 head 就是空，此时  tail == head
		// 为了区分，此时把 head 设置为 -1(EmptyFlag)
		head: number = EventObjectBuffer.EmptyFlag
		tail: number = 0

		zeroValue: T

		constructor(zeroValue: T) {
			for (let i = 0; i < EventObjectBuffer.LEN; i++) {
				this.buffer.push(new BufferValue<T>(-1, zeroValue))
			}
			this.zeroValue = zeroValue
		}

		private incIndex(n: number): number {
			n++
			return n % EventObjectBuffer.LEN
		}

		push(val: BufferValue<T>) {
			if (this.head == EventObjectBuffer.EmptyFlag) {
				this.head = this.tail
			} else if (this.head == this.tail) {
				// 丢弃最旧的数据
				this.tail = this.incIndex(this.tail)
			}

			this.buffer[this.head] = val
			this.head = this.incIndex(this.head)
		}

		// pop Returns an empty string if no value with index n is found.
		pop(n: number): {val: T, ok: boolean} {
			if (this.head == EventObjectBuffer.EmptyFlag) {
				return {val: this.zeroValue, ok: false}
			}
			let tailV = this.buffer[this.tail]
			// n 是严格单调递增，找不到，说明数据已经丢弃了
			if (tailV.n > n) {
				return {val: this.zeroValue, ok: false}
			}
			while (tailV.n != n) {
				this.tail = this.incIndex(this.tail)
				if (this.tail == this.head) {
					this.head = EventObjectBuffer.EmptyFlag
					return {val: this.zeroValue, ok: false}
				}
				tailV = this.buffer[this.tail]
			}

			this.tail = this.incIndex(this.tail)
			if (this.tail == this.head) {
				this.head = EventObjectBuffer.EmptyFlag
			}
			return {val: tailV.val, ok: true}
		}
	}

	const sendEvent = control.allocateEventSource()
	const bleBuffer = new EventObjectBuffer<string>("")
	let sequence = 1

	export function logLine (text: string) {
		sequence++
		bleBuffer.push(new BufferValue(sequence, text))
		control.raiseEvent(sendEvent, sequence)
	}

	export function logValue (text: string, value: number) {
		sequence++
		bleBuffer.push(new BufferValue(sequence, "" + text + ":" + convertToText(value)))
		control.raiseEvent(sendEvent, sequence)
	}

	control.onEvent(sendEvent, EventBusValue.MICROBIT_EVT_ANY, ()=>{
		let seq = control.eventValue()
		let {val, ok} = bleBuffer.pop(seq)
		if (ok) {
			bluetooth.uartWriteLine(val)
		} else {
			bluetooth.uartWriteLine("error: ble buffer can Not found the value("+convertToText(seq)+")")
		}

	}, EventFlags.QueueIfBusy)

	export function response(res: string) {
		bluetooth.uartWriteLine(">>" + res)
	}
}