/**
 * server/api/posts/sections.get.ts
 * [GET] /api/posts/sections
 * Aggregates all published posts grouped by category/section:
 * - Sorts sections alphabetically
 * - Sorts posts within each section (pinned first, then alphabetical)
 * - Excludes private posts for non-admin viewers
 */

export default defineEventHandler(async ev => {
	const authorized = await auth(ev)
	const { res } = modifyH3(ev)

	try {
		if (!mongo.client) await mongo.init()
		if (!mongo.client) return res.send([])

		const got = await mongo
			.client.db('Personal_Site')
			.collection('Posts')
			.aggregate([
				{
					$match: !authorized ? { private: { $ne: true } } : {}
				},
				{
					$group: {
						_id: '$section',
						posts: {
							$push: {
								_id: '$_id',
								title: '$title',
								pinned: '$pinned'
							}
						}
					}
				}
			])
			.toArray()

		// Sort sections alphabetically, and sort posts inside each section
		got
			.sort((a: any, b: any) => (a._id || '').localeCompare(b._id || ''))
			.map(el => {
				el.section = el._id
				delete el._id
				el.posts.sort((a: any, b: any) => {
					if (a.pinned && !b.pinned) return -1
					if (!a.pinned && b.pinned) return 1
					return (a.title || '').localeCompare(b.title || '')
				})
				return el
			})

		return res.send(got)
	} catch (e) {
		console.error('[API sections] Error:', e)
		return res.send([])
	}
})
