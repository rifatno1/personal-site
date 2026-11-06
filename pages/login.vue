<!--
  pages/login.vue
  Administrator Sign In page:
  - Email, password with visibility toggle, and persistent session checkbox
  - Cloudflare Turnstile bot verification
  - AES-GCM encrypted cookie authorization
  - Error-resilient feedback preserving input state
-->
<template>
	<div class="flex-1 flex items-center justify-center py-8 px-4">
		<div class="w-full max-w-md glass-card rounded-3xl p-6 sm:p-9 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
			<!-- Subtle glow behind form -->
			<div class="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

			<div class="flex flex-col gap-1.5 text-center">
				<div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center mx-auto text-xl mb-1">🔐</div>
				<h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Admin Sign In</h1>
				<p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Enter your credentials to publish and manage content</p>
			</div>

			<form class="flex flex-col gap-4" @submit.prevent="submit">
				<div class="flex flex-col gap-1.5">
					<label for="email" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Email Address</label>
					<input type="email" name="email" id="email" required placeholder="name@example.com" minlength="8" maxlength="256" class="w-full rounded-xl px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" v-model="body.email" :disabled="sending" />
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="pass" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Password</label>
					<div class="relative">
						<input :type="showPassword ? 'text' : 'password'" name="pass" id="pass" required placeholder="••••••••" minlength="8" maxlength="256" class="w-full rounded-xl pl-4 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" v-model="body.pass" :disabled="sending" />
						<button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer select-none" tabindex="-1">
							{{ showPassword ? 'Hide' : 'Show' }}
						</button>
					</div>
				</div>

				<div class="flex items-center gap-2 pt-1">
					<input type="checkbox" name="stay" id="stay" class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer" :disabled="sending" v-model="body.stay" />
					<label for="stay" class="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">Keep me signed in on this device</label>
				</div>

				<div class="flex justify-center my-1">
					<Turnstile :site-key="siteKey" @token="v => (token = v)" :refresh="refreshID" :size="turnstileSize" />
				</div>

				<button type="submit" class="w-full py-3 px-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer" :disabled="sending">
					{{ sending ? 'Authenticating...' : 'Sign In' }}
				</button>

				<p class="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-2">
					Need an authorized account?
					<NuxtLink to="/register" class="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Register here</NuxtLink>
				</p>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: 'Sign In — Rifat Mahmud'
	})

	const router = useRouter()
	const { checkAuth } = useAuth()
	const sending = ref(false)
	const showPassword = ref(false)
	const body = ref({
		email: '',
		pass: '',
		stay: true
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
	 * Submits credentials to /api/login and verifies server auth response
	 */
	async function submit() {
		sending.value = true
		try {
			const got: { status: string } | undefined = await $fetch('/api/login', {
				method: 'POST',
				body: { ...body.value, token: token.value },
				responseType: 'json'
			})

			switch (got?.status) {
				case 'invalid_email':
					refreshID.value++
					setNoti('No account registered with this email.', true)
					break
				case 'not_approved':
					refreshID.value++
					setNoti('Account exists but is pending administrator approval.', true)
					break
				case 'invalid_pass':
					refreshID.value++
					setNoti('Incorrect password provided.', true)
					break
				case 'success':
					setNoti('Signed in successfully!')
					await checkAuth()
					router.push('/')
					break
				default:
					refreshID.value++
					setNoti('Invalid response from authentication server.', true)
			}
		} catch (e: any) {
			refreshID.value++
			setNoti(e?.data?.message || e?.message || 'Authentication failed. Please verify your captcha and credentials.', true)
		} finally {
			sending.value = false
		}
	}
</script>
