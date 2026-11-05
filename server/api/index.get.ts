/**
 * server/api/index.get.ts
 * [GET] /api
 * Root API ping / status check.
 */
export default defineEventHandler(async ev => {
	const { res } = modifyH3(ev)
	return res.send('What are you looking for?')
})
