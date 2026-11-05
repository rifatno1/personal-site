/**
 * server/utils/sendUnauthorized.ts
 * Utility to respond with 401 Unauthorized status while clearing stale auth cookies.
 */
export default (ev: import('h3').H3Event) => {
	setResponseStatus(ev, 401)
	deleteCookie(ev, 'TokenS')
	deleteCookie(ev, 'TokenP')
	deleteCookie(ev, 'Stay')
	return send(ev)
}
