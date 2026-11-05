/**
 * Lightweight global toast notification store and helper functions.
 * Supports auto-dismissing timed alerts, manual dismissal, and error states.
 */

export type EachNotificationType = {
	message: string
	isError: boolean
	key: string
	timeoutID: any
}

/**
 * Pushes a new toast notification onto the global notification stack.
 * @param message The text content to display
 * @param isError Whether to display as an error alert (red) or success badge (green)
 */
export function setNoti(message: string, isError: boolean = false) {
	const notifications = useState<EachNotificationType[]>('notifications', () => [])

	if (import.meta.server) return

	const key = globalThis.crypto.randomUUID()
	const timeoutID = setTimeout(() => {
		const ind = notifications.value.findIndex(el => el.key === key)
		if (ind === -1) return
		notifications.value.splice(ind, 1)
	}, 8 * 1000)

	notifications.value.push({
		message,
		isError,
		key,
		timeoutID
	})
}

/**
 * Retrieves the reactive list of active notifications.
 */
export function getNoti() {
	return useState<EachNotificationType[]>('notifications', () => [])
}
