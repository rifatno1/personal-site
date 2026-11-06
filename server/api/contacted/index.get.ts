/**
 * server/api/contacted/index.get.ts
 * [GET] /api/contacted
 * Retrieves all visitor contact submissions (Admin only).
 */

export default defineEventHandler(async ev => {
	if (!(await auth(ev))) return sendUnauthorized(ev)

	const { res } = modifyH3(ev)
	try {
		if (!mongo.client) await mongo.init()
		if (!mongo.client) return res.send([])

		const got = await mongo.client.db('Personal_Site').collection('Messages').find({}).sort({ time: -1 }).toArray()

		return res.send(got)
	} catch (e) {
		console.error('[API contacted get] Error:', e)
		return res.sendStatus(500)
	}
})
