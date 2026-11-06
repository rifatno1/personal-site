/**
 * server/utils/auth.ts
 * Server-side authentication verification helper for Nitro API event handlers:
 * - Reads TokenS, TokenP, and Stay cookies
 * - Decrypts TokenS using the server-side PrivateKey
 * - Validates credentials against the MongoDB Admins collection
 * - Attaches the authenticated admin user document to event.context.userData
 */

import { WithId, Document } from 'mongodb'

declare module 'h3' {
	interface H3EventContext {
		userData?: WithId<Document>
	}
}

export default async (ev: import('h3').H3Event): Promise<boolean> => {
	try {
		const { TokenS, TokenP, Stay } = parseCookies(ev)
		if (!Stay || (Stay !== 'Yes' && Stay !== 'No') || !TokenS || !TokenP) return false

		let privateKey = process.env.PrivateKey
		try {
			const config = useRuntimeConfig(ev)
			if (config?.privateKey) privateKey = config.privateKey
		} catch (e) {}

		if (!privateKey) return false

		const decrypted = await aesDecrypt(TokenS, privateKey)
		if (!decrypted?.includes('::')) return false

		const [_id, credentialsChangedAt] = decrypted.split('::')
		if (_id.length !== 24 || !credentialsChangedAt || !mongo.ObjectId.isValid(_id)) return false

		if (!mongo.client) await mongo.init()
		if (!mongo.client) return false

		const got = await mongo.client
			.db('Personal_Site')
			.collection('Admins')
			.findOne({ _id: new mongo.ObjectId(_id) })
		if (!got || got.credentialsChangedAt?.toString?.() !== credentialsChangedAt) return false

		ev.context.userData = got
		return true
	} catch (e) {
		return false
	}
}
