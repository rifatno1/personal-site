/**
 * server/api/register.post.ts
 * [POST] /api/register
 * Admin registration request endpoint:
 * - Validates Turnstile captcha token
 * - Hashes password using bcrypt with salt rounds = 10
 * - Inserts admin document with approved: false for administrative review
 */

import { hashSync } from 'bcrypt'

type BodyType = {
	name: string
	email: string
	pass: string
	token: string
}

const schema: AJVSchema<BodyType> = {
	type: 'object',
	properties: {
		name: { type: 'string', minLength: 3, maxLength: 64 },
		email: { type: 'string', minLength: 8, maxLength: 256 },
		pass: { type: 'string', minLength: 8, maxLength: 256 },
		token: { type: 'string', minLength: 20, maxLength: 2048 }
	},
	required: ['email', 'pass', 'name', 'token'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		res.deleteCookie('TokenS').deleteCookie('TokenP').deleteCookie('Stay')

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

		const got = await mongo.client.db('Personal_Site').collection('Admins').findOne({ email: body.email })

		if (got) {
			if (got.approved) return res.send({ status: 'approved' })
			return res.send({ status: 'not_approved' })
		}

		await mongo
			.client.db('Personal_Site')
			.collection('Admins')
			.insertOne({
				name: body.name,
				email: body.email,
				pass: hashSync(body.pass, 10),
				approved: false,
				createdAt: Date.now(),
				credentialsChangedAt: Date.now() + Math.floor(Math.random() * 500)
			})

		return res.send({ status: 'success' })
	} catch (e) {
		console.error('[API register] Error:', e)
		return res.sendStatus(500)
	}
})
