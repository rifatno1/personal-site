/**
 * server/utils/mongo.ts
 * MongoDB Atlas connection manager:
 * - Lazy singleton connection pooling with connection and serverSelection timeouts
 * - Resilient fallback to useRuntimeConfig() and process.env.MongoUrl
 * - Exposes ObjectId helper
 */

import { MongoClient, ObjectId } from 'mongodb'

class mongo {
	static client: null | MongoClient = null
	static ObjectId = ObjectId

	/**
	 * Connects to MongoDB if not already connected.
	 * Returns the MongoClient instance or null on failure.
	 */
	static async init() {
		try {
			if (this.client) return this.client

			let url = process.env.MongoUrl
			try {
				const config = useRuntimeConfig()
				if (config?.mongoUrl) url = config.mongoUrl
			} catch (e) {}

			if (!url) {
				console.error('[MongoDB] Error: MongoUrl is undefined. Check .env or runtimeConfig.')
				return null
			}

			this.client = await new MongoClient(url, {
				serverSelectionTimeoutMS: 8000,
				connectTimeoutMS: 10000
			}).connect()

			console.log('[MongoDB] Connected successfully')
			return this.client
		} catch (e) {
			this.client = null
			console.error('[MongoDB] Connection error:', e)
			return null
		}
	}
}

export default mongo
