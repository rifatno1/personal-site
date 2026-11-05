/**
 * server/api/contacted/index.delete.ts
 * [DELETE] /api/contacted
 * Deletes a contact message by its ObjectId (Admin only).
 */

type BodyType = {
	_id: string
}

const schema: AJVSchema<BodyType> = {
	type: 'object',
	properties: {
		_id: { type: 'string', minLength: 24, maxLength: 24 }
	},
	required: ['_id'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	if (!(await auth(ev))) return sendUnauthorized(ev)

	const { req, res } = modifyH3(ev)
	try {
		if (!mongo.client) await mongo.init()
		if (!mongo.client) return res.sendStatus(503)

		const body: BodyType = await req.parseBody()
		const validation = ajvValidate(schema, body)
		if (validation.error) return res.setStatus(400).send(validation)

		if (!mongo.ObjectId.isValid(body._id)) return res.setStatus(400).send({ error: true, message: 'Invalid ID' })

		await mongo
			.client.db('Personal_Site')
			.collection('Messages')
			.deleteOne({ _id: new mongo.ObjectId(body._id) })

		return res.sendEmpty()
	} catch (e) {
		console.error('[API contacted delete] Error:', e)
		return res.sendStatus(500)
	}
})
