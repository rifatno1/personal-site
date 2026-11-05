/**
 * server/api/posts/index.get.ts
 * [GET] /api/posts?page=1[&section=...]
 * Returns a paginated list of articles:
 * - Supports optional category filtering (with URL decode fallback)
 * - Pinned articles appear first within categories
 * - Hidden private articles are filtered out for unauthenticated visitors
 * - Returns { hasMore: boolean, result: [...] }
 */

type QueryType = {
	section?: string
	page: string
}

const schema: AJVSchema<QueryType> = {
	type: 'object',
	properties: {
		section: { type: 'string', nullable: true },
		page: {
			type: 'string',
			ValidateByFunction: (data: string) => {
				const n = Number(data)
				return n >= 1 && Number.isInteger(n)
			}
		}
	},
	required: ['page'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	const authorized = await auth(ev)
	const { req, res } = modifyH3(ev)

	try {
		if (!mongo.client) await mongo.init()
		if (!mongo.client) return res.send({ hasMore: false, result: [] })

		const query: QueryType = req.getQuery()
		const validation = ajvValidate(schema, query)
		if (validation.error) return res.setStatus(400).send(validation)

		let perPage = 20
		try {
			const config = useRuntimeConfig(ev)
			if (config?.perPage) perPage = Number(config.perPage)
			else if (process.env.PerPage) perPage = Number(process.env.PerPage)
		} catch (e) {}

		const sectionMatch = query.section ? {
			$or: [{ section: query.section }, { section: decodeURIComponent(query.section) }]
		} : {}

		const got = await mongo
			.client.db('Personal_Site')
			.collection('Posts')
			.find({ ...sectionMatch, ...(!authorized ? { private: { $ne: true } } : {}) })
			.sort({ ...(query.section ? { pinned: -1 } : {}), createdAt: -1 })
			.skip((Number(query.page) - 1) * perPage)
			.limit(perPage + 1)
			.toArray()

		if (query.section && !got.length && Number(query.page) > 1) return res.setStatus(404)
		return res.send({ hasMore: got.length > perPage, result: got.slice(0, perPage) })
	} catch (e) {
		console.error('[API posts] Error:', e)
		return res.send({ hasMore: false, result: [] })
	}
})
