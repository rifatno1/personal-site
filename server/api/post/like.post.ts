/**
 * server/api/post/like.post.ts
 * [POST] /api/post/like
 * Increments or decrements the likes counter of a public article.
 */

type BodyType = {
	_id: string
	type: 'add' | 'rem'
}

const schema: AJVSchema<BodyType> = {
	type: 'object',
	properties: {
		_id: { type: 'string', minLength: 24, maxLength: 24 },
		type: { type: 'string', enum: ['add', 'rem'] }
	},
	required: ['_id', 'type'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		if (!mongo.client) await mongo.init()
		if (!mongo.client) return res.sendStatus(503)

		const body: BodyType = await req.parseBody()
		const validation = ajvValidate(schema, body)
		if (validation.error) return res.setStatus(400).send(validation)

		if (!mongo.ObjectId.isValid(body._id)) return res.sendStatus(404)

		await mongo.client
			.db('Personal_Site')
			.collection('Posts')
			.updateOne({ _id: new mongo.ObjectId(body._id), private: { $ne: true } }, { $inc: { likes: body.type === 'add' ? 1 : -1 } })

		return res.sendEmpty()
	} catch (e) {
		console.error('[API post like] Error:', e)
		return res.sendStatus(500)
	}
})
