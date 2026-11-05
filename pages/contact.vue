<!--
  pages/contact.vue
  Interactive Contact page:
  - Author direct social and email channels (Gmail, Discord, GitHub)
  - Interactive contact form with Cloudflare Turnstile protection
  - Safe error handling that preserves user message drafts
-->
<template>
	<div class="max-w-4xl mx-auto w-full py-4 sm:py-8">
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
			<!-- Left Column: Contact Info & Channels -->
			<div class="lg:col-span-5 flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 w-fit">
						💬 Let's Connect
					</div>
					<h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
						Get in Touch
					</h1>
					<p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
						Have a project inquiry, technical discussion, feedback, or just want to say hi? Send me a message and I'll get back to you promptly.
					</p>
				</div>

				<!-- Direct Communication Channels -->
				<div class="flex flex-col gap-3">
					<a
						href="mailto:rifatmahmudpc@gmail.com"
						class="glass-card rounded-2xl p-4 flex items-center gap-3.5 group hover:border-indigo-500/50 transition-all"
					>
						<img src="/images/gmail_logo.png" alt="Email" class="w-8 h-8 rounded-lg object-contain shrink-0" />
						<div class="flex flex-col min-w-0">
							<span class="text-xs font-bold text-zinc-400">Direct Email</span>
							<span class="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
								rifatmahmudpc@gmail.com
							</span>
						</div>
					</a>

					<a
						href="https://discord.com/users/715938370840166433"
						target="_blank"
						rel="noopener noreferrer"
						class="glass-card rounded-2xl p-4 flex items-center gap-3.5 group hover:border-indigo-500/50 transition-all"
					>
						<img src="/images/discord_logo.png" alt="Discord" class="w-8 h-8 rounded-lg object-contain shrink-0" />
						<div class="flex flex-col min-w-0">
							<span class="text-xs font-bold text-zinc-400">Discord</span>
							<span class="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
								rifatmahmud
							</span>
						</div>
					</a>

					<a
						href="https://github.com/RifatMahmudno-1"
						target="_blank"
						rel="noopener noreferrer"
						class="glass-card rounded-2xl p-4 flex items-center gap-3.5 group hover:border-indigo-500/50 transition-all"
					>
						<img src="/images/github_logo.png" alt="GitHub" class="w-8 h-8 rounded-lg object-contain shrink-0" />
						<div class="flex flex-col min-w-0">
							<span class="text-xs font-bold text-zinc-400">GitHub</span>
							<span class="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
								@RifatMahmudno-1
							</span>
						</div>
					</a>
				</div>
			</div>

			<!-- Right Column: Interactive Form -->
			<div class="lg:col-span-7">
				<div class="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
					<!-- Success banner if sent -->
					<div v-if="submitted" class="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col items-center text-center gap-3">
						<span class="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold">
							✓
						</span>
						<div class="flex flex-col gap-1">
							<h3 class="text-base font-bold text-emerald-950 dark:text-emerald-200">Message Received!</h3>
							<p class="text-xs text-emerald-800 dark:text-emerald-300">
								Thank you for reaching out. I have received your message and will reply as soon as possible.
							</p>
						</div>
						<button
							@click="submitted = false"
							type="button"
							class="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
						>
							Send Another Message
						</button>
					</div>

					<!-- Form -->
					<form v-else class="flex flex-col gap-5" @submit.prevent="submit">
						<div class="flex flex-col gap-1">
							<h2 class="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
								Send a Direct Message
							</h2>
							<p class="text-xs text-zinc-500 dark:text-zinc-400">
								Fill in the details below and I'll receive it immediately.
							</p>
						</div>

						<div class="flex flex-col gap-4">
							<div class="flex flex-col gap-1.5">
								<label for="name" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Your Name</label>
								<input
									type="text"
									name="name"
									id="name"
									required
									placeholder="What should I call you?"
									minlength="3"
									maxlength="64"
									class="w-full rounded-xl px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
									v-model="body.name"
									:disabled="sending"
								/>
							</div>

							<div class="flex flex-col gap-1.5">
								<label for="email" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Email Address</label>
								<input
									type="email"
									name="email"
									id="email"
									required
									placeholder="your-email@example.com"
									minlength="8"
									maxlength="256"
									class="w-full rounded-xl px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
									v-model="body.email"
									:disabled="sending"
								/>
							</div>

							<div class="flex flex-col gap-1.5">
								<div class="flex items-center justify-between">
									<label for="message" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Message</label>
									<span class="text-[11px] text-zinc-400">{{ body.message.length }}/5000</span>
								</div>
								<textarea
									name="message"
									id="message"
									required
									placeholder="Write your message, project idea, or questions..."
									maxlength="5000"
									rows="5"
									class="w-full rounded-2xl p-4 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y leading-relaxed"
									v-model="body.message"
									:disabled="sending"
								></textarea>
							</div>
						</div>

						<!-- Turnstile Security -->
						<div class="flex justify-center my-1">
							<Turnstile :site-key="siteKey" @token="v => (token = v)" :refresh="refreshID" :size="turnstileSize" />
						</div>

						<button
							type="submit"
							class="w-full py-3 px-5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
							:disabled="sending"
						>
							{{ sending ? 'Sending Message...' : 'Send Message' }}
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: 'Contact — Rifat Mahmud'
	})

	const sending = ref(false)
	const submitted = ref(false)
	const body = ref({
		name: '',
		email: '',
		message: ''
	})

	// Cloudflare Turnstile configuration
	const config = useRuntimeConfig()
	const siteKey = config.public?.turnstileSiteKey || (import.meta as any).env?.VITE_TurnstileSiteKey || ''
	const token = ref<string | null>(null)
	const refreshID = ref(1)
	const turnstileSize = ref<'compact' | 'normal'>('normal')

	function resize() {
		if (globalThis.window?.innerWidth <= 380) turnstileSize.value = 'compact'
		else turnstileSize.value = 'normal'
	}

	onMounted(() => {
		if (globalThis.window?.innerWidth <= 380) turnstileSize.value = 'compact'
		globalThis.window?.addEventListener('resize', resize)
	})

	onBeforeUnmount(() => globalThis.window?.removeEventListener('resize', resize))

	/**
	 * Submits contact message to /api/contact with Turnstile verification token
	 */
	async function submit() {
		sending.value = true
		try {
			await $fetch('/api/contact', { method: 'POST', body: { ...body.value, token: token.value } })
			setNoti('Message sent successfully!')
			submitted.value = true
			body.value = { name: '', email: '', message: '' }
			refreshID.value++
		} catch (e: any) {
			refreshID.value++
			setNoti(e?.data?.message || e?.message || 'Failed to send message. Please verify the captcha and try again.', true)
		} finally {
			sending.value = false
		}
	}
</script>
