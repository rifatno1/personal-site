/**
 * Global Route Middleware #2
 * Handles route-level authentication guards:
 * - Redirects unauthorized attempts to access guarded administrative routes (e.g. /contacted)
 * - Clears credentials upon entering /login or /register
 * - Synchronizes route meta.admin with user authentication status
 */

function removeCookie() {
	const tokenP = useCookie('TokenP')
	const tokenS = useCookie('TokenS')
	const stay = useCookie('Stay')

	if (tokenP.value) tokenP.value = undefined
	if (tokenS.value) tokenS.value = undefined
	if (stay.value) stay.value = undefined
}

// Protected routes that strictly require authenticated admin access
const guardedRoutesExact = ['/contacted']

export default defineNuxtRouteMiddleware(async to => {
	const { checkAuth } = useAuth()

	// Clear active session when visiting sign-in or registration pages
	if (to.path === '/login' || to.path === '/register') {
		removeCookie()
		useAuth().isAdmin.value = false
		return
	}

	const isValid = await checkAuth()
	to.meta.admin = isValid

	// Guard admin-only routes
	if (guardedRoutesExact.includes(to.path) && !isValid) {
		return abortNavigation({ statusCode: 401 })
	}
})
