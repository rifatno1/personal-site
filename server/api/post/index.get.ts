/**
 * server/api/post/index.get.ts
 * [GET] /api/post?_id=...&section=...
 * Fetches a single article document by its ObjectId and category name.
 * Respects article privacy, requiring admin authorization for private posts.
 */

type QueryType = {
	_id: string
	section: string
}

const schema: AJVSchema<QueryType> = {
	type: 'object',
	properties: {
		_id: { type: 'string', minLength: 24, maxLength: 24 },
		section: { type: 'string', minLength: 1 }
	},
	required: ['_id', 'section']
}

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		if (!mongo.client) await mongo.init()
		if (!mongo.client) return res.sendStatus(503)

		const query: QueryType = req.getQuery()
		const validation = ajvValidate(schema, query)
		if (validation.error) return res.setStatus(400).send(validation)

		if (!mongo.ObjectId.isValid(query._id)) return res.sendStatus(404)

		const decodedSection = decodeURIComponent(query.section)
		const got = await mongo
			.client.db('Personal_Site')
			.collection('Posts')
			.findOne({
				_id: new mongo.ObjectId(query._id),
				$or: [{ section: query.section }, { section: decodedSection }]
			})

		if (!got) return res.sendStatus(404)
		if (got.private && !(await auth(ev))) return sendUnauthorized(ev)
		return res.send(got)
	} catch (e) {
		console.error('[API post get] Error:', e)
		return res.sendStatus(500)
	}
})
