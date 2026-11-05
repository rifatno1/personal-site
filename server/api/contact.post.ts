/**
 * server/api/contact.post.ts
 * [POST] /api/contact
 * Handles visitor message submissions from the contact form:
 * - Validates name, email, message length, and Turnstile response token
 * - Verifies token with Cloudflare Turnstile API
 * - Stores message in MongoDB 'Messages' collection
 */

type BodyType = {
	name: string
	email: string
	message: string
	token: string
}

const schema: AJVSchema<BodyType> = {
	type: 'object',
	properties: {
		name: { type: 'string', minLength: 3, maxLength: 64 },
		email: { type: 'string', minLength: 8, maxLength: 256 },
		message: { type: 'string', minLength: 1, maxLength: 5000 },
		token: { type: 'string', minLength: 20, maxLength: 2048 }
	},
	required: ['email', 'name', 'message', 'token'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		const body: BodyType = await req.parseBody()
		const validation = ajvValidate(schema, body)
		if (validation.error) return res.setStatus(400).send(validation)

		const config = useRuntimeConfig(ev)
		const turnstileSecretKey = (config.turnstileSecretKey || process.env.TurnstileSecretKey) as string

		if (turnstileSecretKey && !(await validateTurnstile(turnstileSecretKey, body.token, req.getIP()))) {
			return res.setStatus(400).send({ error: true, message: 'Captcha verification failed' })
		}

		if (!mongo.client) await mongo.init()
		if (!mongo.client) return res.sendStatus(503)

		await mongo.client.db('Personal_Site').collection('Messages').insertOne({
			name: body.name,
			email: body.email,
			message: body.message,
			time: Date.now()
		})

		return res.sendEmpty()
	} catch (e) {
		console.error('[API contact] Error:', e)
		return res.sendStatus(500)
	}
})
