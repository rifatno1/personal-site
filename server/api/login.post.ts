/**
 * server/api/login.post.ts
 * [POST] /api/login
 * Administrator sign-in endpoint:
 * - Validates Turnstile captcha token
 * - Looks up administrator in MongoDB 'Admins' collection
 * - Verifies bcrypt password hash and admin approval status
 * - Issues AES-GCM encrypted cookies (TokenS, TokenP, Stay)
 */

import { compareSync } from 'bcrypt'

type BodyType = {
	email: string
	pass: string
	stay: boolean
	token: string
}

const schema: AJVSchema<BodyType> = {
	type: 'object',
	properties: {
		email: { type: 'string', minLength: 8, maxLength: 256 },
		pass: { type: 'string', minLength: 8, maxLength: 256 },
		stay: { type: 'boolean' },
		token: { type: 'string', minLength: 20, maxLength: 2048 }
	},
	required: ['email', 'pass', 'stay', 'token'],
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
		const privateKey = (config.privateKey || process.env.PrivateKey) as string
		const publicKey = (config.public?.publicKey || process.env.VITE_PublicKey) as string

		if (turnstileSecretKey && !(await validateTurnstile(turnstileSecretKey, body.token, req.getIP()))) {
			return res.setStatus(400).send({ error: true, message: 'Captcha verification failed' })
		}

		if (!mongo.client) await mongo.init()
		if (!mongo.client) return res.sendStatus(503)

		const got = await mongo.client.db('Personal_Site').collection('Admins').findOne({ email: body.email })

		if (!got) return res.send({ status: 'invalid_email' })
		if (!got.approved) return res.send({ status: 'not_approved' })
		if (!compareSync(body.pass, got.pass)) return res.send({ status: 'invalid_pass' })

		return res
			.setCookie('TokenS', await aesEncrypt(got._id + '::' + got.credentialsChangedAt, privateKey), {
				path: '/',
				maxAge: body.stay ? 2592000 : undefined
			})
			.setCookie('TokenP', await aesEncrypt(`Personal_Site`, publicKey), {
				path: '/',
				maxAge: body.stay ? 2592000 : undefined
			})
			.setCookie('Stay', body.stay ? 'Yes' : 'No', {
				path: '/',
				maxAge: body.stay ? 2592000 : undefined
			})
			.send({ status: 'success' })
	} catch (e) {
		console.error('[API login] Error:', e)
		return res.sendStatus(500)
	}
})
