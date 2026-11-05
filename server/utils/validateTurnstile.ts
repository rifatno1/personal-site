/**
 * server/utils/validateTurnstile.ts
 * Verifies Cloudflare Turnstile token against Cloudflare's siteverify endpoint.
 *
 * @param secretKey Cloudflare Turnstile Secret Key
 * @param response Client verification response token
 * @param ip Optional client IP address
 * @returns Promise<boolean> true if token is genuine and verified
 */
export default async (secretKey: string, response: string, ip?: string): Promise<boolean> => {
	const formData = new FormData()
	formData.append('secret', secretKey)
	formData.append('response', response)
	if (ip) formData.append('remoteip', ip)

	try {
		const got = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body: formData
		}).then(r => r.json())

		if (got.success) return true
		return false
	} catch (e) {
		console.error('[Turnstile siteverify error]', e)
		return false
	}
}
