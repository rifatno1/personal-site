/**
 * server/api/imgur.post.ts
 * [POST] /api/imgur
 * Handles image uploads to Imgur API (Admin only):
 * - Reads and auto-refreshes OAuth2 access tokens stored in MongoDB 'Imgur' collection
 * - Automatically ensures a dedicated 'Personal Site' album exists on the account
 * - Validates file buffer size (< 2MB) and supported MIME types (JPEG, PNG, GIF, WebP)
 * - Returns direct public image link on success
 */

type ImgurSecretsType = {
	type: 'imgur_secrets'
	client_id: string
	client_secret: string
	access_token: string
	refresh_token: string
	album_id?: string
	valid_till?: number
}

/**
 * Finds or creates the 'Personal Site' album on the user's Imgur account
 */
async function getAlbumID(access_token: string) {
	try {
		const all_albums = await $fetch<{
			data?: { title: string; id: string }[]
		}>('https://api.imgur.com/3/account/me/albums', {
			headers: { Authorization: `Bearer ${access_token}` },
			responseType: 'json'
		})
		const old_album = all_albums.data?.find(el => el.title === 'Personal Site')
		if (old_album) return old_album.id

		const got = await $fetch<{
			data?: { id: string; deletehash: string }
		}>('https://api.imgur.com/3/album', {
			method: 'POST',
			headers: { Authorization: `Bearer ${access_token}` },
			body: (() => {
				const formData = new FormData()
				formData.append('title', 'Personal Site')
				formData.append('privacy', 'hidden')
				return formData
			})(),
			responseType: 'json'
		})

		return got.data?.id || false
	} catch (e) {
		console.error('[Imgur album error]', e)
		return false
	}
}

/**
 * Retrieves Imgur OAuth secrets from MongoDB
 */
async function getSecrets() {
	const keyArr = ['client_id', 'client_secret', 'access_token', 'refresh_token']
	const got = await mongo.client!.db('Personal_Site').collection<ImgurSecretsType>('Imgur').findOne({ type: 'imgur_secrets' })
	if (!got) return false

	const gotKeys = Object.keys(got)
	if (keyArr.find(el => !gotKeys.includes(el))) return false

	if (!got.album_id) {
		const album_id = await getAlbumID(got.access_token)
		if (!album_id) return false
		await mongo.client!.db('Personal_Site').collection<ImgurSecretsType>('Imgur').updateOne({ type: 'imgur_secrets' }, { $set: { album_id } })
		got.album_id = album_id
	}

	return got
}

/**
 * Refreshes an expired Imgur OAuth access token
 */
async function refreshToken(secrets: ImgurSecretsType) {
	const got = await $fetch<{
		access_token: string
		refresh_token: string
		expires_in: number
		token_type: 'Bearer'
		account_username: string
	}>('https://api.imgur.com/oauth2/token', {
		method: 'POST',
		body: (() => {
			const formData = new FormData()
			formData.append('refresh_token', secrets.refresh_token)
			formData.append('client_id', secrets.client_id)
			formData.append('client_secret', secrets.client_secret)
			formData.append('grant_type', 'refresh_token')
			return formData
		})(),
		responseType: 'json'
	}).catch(e => {
		console.error('[Imgur token refresh error]', e)
		return null
	})
	if (!got) return null

	const valid_till = Date.now() + (got.expires_in - 300) * 1000
	await mongo
		.client!.db('Personal_Site')
		.collection<ImgurSecretsType>('Imgur')
		.updateOne(
			{ type: 'imgur_secrets' },
			{
				$set: {
					access_token: got.access_token,
					refresh_token: got.refresh_token,
					valid_till: valid_till
				}
			}
		)

	return { access_token: got.access_token, refresh_token: got.refresh_token, valid_till: valid_till }
}

/**
 * Uploads image buffer to Imgur API under the target album
 */
async function uploadImage(access_token: string, file: Buffer, album_id: string) {
	try {
		const got = await $fetch<{
			status: number
			success: boolean
			data: {
				id: string
				deletehash: string
				type: string
				width: number
				height: number
				size: number
				link: string
				datetime: number
			}
		}>('https://api.imgur.com/3/image', {
			method: 'POST',
			headers: { Authorization: `Bearer ${access_token}` },
			body: (() => {
				const formData = new FormData()
				formData.append('image', file.toString('base64'))
				formData.append('album', album_id)
				return formData
			})(),
			responseType: 'json'
		})

		return got
	} catch (e) {
		console.error('[Imgur uploadImage error]', e)
		return false
	}
}

type BodyType = {
	files: {
		image: {
			buffer: Buffer
			type: 'image/jpeg' | 'image/jpg' | 'image/gif' | 'image/png' | 'image/apng' | 'image/tiff' | 'image/webp'
			filename: string
		}
	}
}

const schema = {
	type: 'object',
	properties: {
		files: {
			type: 'object',
			properties: {
				image: {
					type: 'object',
					properties: {
						buffer: {
							type: 'object',
							ValidateByFunction: (data: any) => {
								return data instanceof Buffer && data.byteLength / 1_000_000 <= 2
							}
						},
						type: {
							type: 'string',
							enum: ['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'image/apng', 'image/tiff', 'image/webp']
						},
						filename: { type: 'string' }
					},
					additionalProperties: false,
					required: ['buffer', 'type', 'filename']
				}
			},
			additionalProperties: false,
			required: ['image']
		}
	},
	additionalProperties: false,
	required: ['files']
}

export default defineEventHandler(async ev => {
	if (!(await auth(ev))) return sendUnauthorized(ev)

	const { req, res } = modifyH3(ev)
	try {
		const formData: BodyType = await req.parseForm()

		const validation = ajvValidate(schema, formData)
		if (validation.error) return res.setStatus(400).send(validation)

		const secrets = await getSecrets()
		if (!secrets) return res.send({ status: 'imgur_secrets_error' })
		if (!secrets.valid_till || secrets.valid_till < Date.now()) {
			const refreshed = await refreshToken(secrets)
			if (!refreshed) return res.send({ status: 'imgur_refresh_error' })
			Object.assign(secrets, refreshed)
		}

		const imageData = await uploadImage(secrets.access_token, formData.files.image.buffer, secrets.album_id!)
		if (!imageData || !imageData.success) return res.send({ status: 'imgur_upload_error' })

		return res.send({ status: 'success', link: imageData.data.link })
	} catch (e) {
		console.error('[API imgur] Error:', e)
		return res.sendStatus(500)
	}
})
