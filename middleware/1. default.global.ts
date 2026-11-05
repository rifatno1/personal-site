/**
 * Global Route Middleware #1
 * Enforces canonical URLs by stripping any trailing slashes from routes
 * (except the root '/').
 */
export default defineNuxtRouteMiddleware(to => {
	if (to.path !== '/' && to.path.endsWith('/')) {
		to.path = to.path.slice(0, -1)
		return navigateTo(to)
	}
})
