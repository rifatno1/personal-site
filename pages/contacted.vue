<!--
  pages/contacted.vue
  Administrator Messages Inbox:
  - Displays all messages submitted via the contact form
  - Search filter across sender name, email, and message body
  - Direct email reply mailto shortcut
  - Secure message deletion with confirmation
  - Protected by auth.global route middleware
-->
<template>
	<div class="flex flex-col gap-6 max-w-4xl mx-auto w-full py-4">
		<!-- Inbox Header -->
		<div class="glass-card rounded-3xl p-6 sm:p-7 flex flex-col gap-4">
			<div class="flex items-center justify-between flex-wrap gap-4">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">📬</div>
					<div>
						<h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Admin Messages Inbox</h1>
						<p class="text-xs text-zinc-500 dark:text-zinc-400">Inquiries and messages submitted through your website contact form</p>
					</div>
				</div>

				<span v-if="data?.length" class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60">{{ data.length }} {{ data.length === 1 ? 'Message' : 'Messages' }}</span>
			</div>

			<!-- Search filter for messages -->
			<div v-if="data?.length" class="relative pt-1">
				<input type="text" v-model="searchQuery" placeholder="Search messages by sender name, email, or content..." class="w-full text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
		</div>

		<!-- Skeleton Loader -->
		<div v-if="pending" class="flex flex-col gap-4">
			<div v-for="i in 3" :key="i" class="p-6 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 animate-pulse space-y-3">
				<div class="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
				<div class="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
				<div class="h-16 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
			</div>
		</div>

		<!-- Messages List -->
		<div v-else-if="filteredMessages.length" class="flex flex-col gap-4">
			<article v-for="each in filteredMessages" :key="each._id" class="glass-card rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
				<div class="flex items-start justify-between flex-wrap gap-3">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm shrink-0">
							{{ (each.name || 'U').charAt(0).toUpperCase() }}
						</div>
						<div>
							<h2 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ each.name }}</h2>
							<a :href="`mailto:${each.email}`" class="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
								{{ each.email }}
							</a>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<a :href="`mailto:${each.email}?subject=Re: Your message on Rifat Mahmud's site`" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors">✉️ Reply</a>

						<button type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors disabled:opacity-50 cursor-pointer" :disabled="deleting" @click="() => deleteMessage(each)">
							<IconDelete class="w-3.5 h-3.5" />
							<span>Delete</span>
						</button>
					</div>
				</div>

				<div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto font-mono">
					{{ each.message }}
				</div>
			</article>
		</div>

		<!-- Empty State -->
		<div v-else class="text-center py-20 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 flex flex-col items-center gap-3">
			<span class="text-3xl">📭</span>
			<p class="text-zinc-800 dark:text-zinc-200 font-semibold">No messages in inbox</p>
			<p class="text-xs text-zinc-400 dark:text-zinc-500">
				{{ searchQuery ? `No messages matching "${searchQuery}".` : 'Incoming contact form submissions will appear here.' }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: 'Messages Inbox — Admin'
	})

	// Fetch contacted messages lazily
	const { data, pending, error } = await useLazyFetch<EachContactType[]>('/api/contacted')
	const deleting = ref(false)
	const searchQuery = ref('')

	// Real-time client search filter across messages
	const filteredMessages = computed(() => {
		if (!data.value) return []
		const q = searchQuery.value.trim().toLowerCase()
		if (!q) return data.value

		return data.value.filter(m => (m.name || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q) || (m.message || '').toLowerCase().includes(q))
	})

	// Deletes a message with user confirmation and toast feedback
	async function deleteMessage(each: EachContactType) {
		if (!globalThis.confirm(`Are you sure you want to delete message from ${each.name}?`)) return
		deleting.value = true
		try {
			await $fetch('/api/contacted', { method: 'DELETE', body: { _id: each._id } })
			setNoti('Message deleted successfully.')
			const ind = data.value?.findIndex(el => el._id === each._id) ?? -1
			if (ind !== -1) data.value?.splice(ind, 1)
		} catch (e: any) {
			setNoti(e?.data?.message || 'Failed to delete message.', true)
		} finally {
			deleting.value = false
		}
	}

	watchEffect(() => {
		if (error.value) showError(error.value)
	})
</script>
