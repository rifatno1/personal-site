/**
 * server/middleware/1. default.ts
 * Nitro Server Middleware:
 * - Redirects trailing slash URLs for canonical SEO
 * - Handles client-side rendering bypass flag (?csr=1) for PWA shell caching
 * - Ensures MongoDB client is initialized before processing any /api request
 * - Creates necessary MongoDB indexes on first initialization
 */

function addIndexes() {
	try {
		mongo.client?.db('Personal_Site').collection('Posts').createIndex({ section: 1 })
	} catch (e) {
		console.error('[MongoDB] Index creation error:', e)
	}
}

export default defineEventHandler(async ev => {
	// Canonical URL trailing slash normalization
	if (ev.method === 'GET' && ev.path !== '/' && ev.path.endsWith('/')) {
		return sendRedirect(ev, ev.path.slice(0, -1), 301)
	}

	const url = getRequestURL(ev)

	// Client-side rendering mode bypass for PWA offline shell
	if (ev.method === 'GET' && url.pathname === '/' && url.searchParams.get('csr') === '1') {
		if (ev.context.nuxt?.constructor === Object) ev.context.nuxt.noSSR = true
		else ev.context.nuxt = { noSSR: true }
	}

	// Database connection guarantee for all /api endpoints
	if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
		if (!mongo.client) {
			await mongo.init()
			if (mongo.client) addIndexes()
		}
		if (!mongo.client) {
			setResponseStatus(ev, 503)
			return { error: 'Database service unavailable' }
		}
	}
})
