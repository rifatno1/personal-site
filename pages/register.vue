<!--
  pages/register.vue
  Administrator Registration page:
  - Validates full name, email, password, and password confirmation
  - Cloudflare Turnstile verification
  - Submitted accounts are stored as pending approval by existing administrators
  - Error-resilient feedback preserving input state
-->
<template>
	<div class="flex-1 flex items-center justify-center py-8 px-4">
		<div class="w-full max-w-md glass-card rounded-3xl p-6 sm:p-9 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
			<!-- Glow -->
			<div class="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

			<div class="flex flex-col gap-1.5 text-center">
				<div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center mx-auto text-xl mb-1">📝</div>
				<h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Create Admin Account</h1>
				<p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Submit your details to request publishing privileges</p>
			</div>

			<form class="flex flex-col gap-4" @submit.prevent="submit">
				<div class="flex flex-col gap-1.5">
					<label for="name" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Full Name</label>
					<input type="text" name="name" id="name" required placeholder="Your name" minlength="3" maxlength="64" class="w-full rounded-xl px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" v-model="body.name" :disabled="sending" />
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="email" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Email Address</label>
					<input type="email" name="email" id="email" required placeholder="name@example.com" minlength="8" maxlength="256" class="w-full rounded-xl px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" v-model="body.email" :disabled="sending" />
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="pass" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Password</label>
					<div class="relative">
						<input :type="showPassword ? 'text' : 'password'" name="pass" id="pass" required placeholder="Minimum 8 characters" minlength="8" maxlength="256" class="w-full rounded-xl pl-4 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" v-model="body.pass" :disabled="sending" @input="comparePass" />
						<button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer select-none" tabindex="-1">
							{{ showPassword ? 'Hide' : 'Show' }}
						</button>
					</div>
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="re_pass" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Confirm Password</label>
					<input type="password" name="re_pass" id="re_pass" required placeholder="Re-enter password" minlength="8" maxlength="256" class="w-full rounded-xl px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" v-model="body.re_pass" :disabled="sending" @input="comparePass" />
				</div>

				<div class="flex justify-center my-1">
					<Turnstile :site-key="siteKey" @token="v => (token = v)" :refresh="refreshID" :size="turnstileSize" />
				</div>

				<button type="submit" class="w-full py-3 px-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer" :disabled="sending">
					{{ sending ? 'Submitting Registration...' : 'Register' }}
				</button>

				<p class="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-2">
					Already have an account?
					<NuxtLink to="/login" class="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign In here</NuxtLink>
				</p>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: 'Register Admin — Rifat Mahmud'
	})

	const router = useRouter()
	const sending = ref(false)
	const showPassword = ref(false)
	const body = ref({
		name: '',
		email: '',
		pass: '',
		re_pass: ''
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
	 * Submits registration request to /api/register
	 */
	async function submit() {
		sending.value = true
		try {
			const got: { status: string } | undefined = await $fetch('/api/register', {
				method: 'POST',
				body: { ...body.value, re_pass: undefined, token: token.value },
				responseType: 'json'
			})

			switch (got?.status) {
				case 'approved':
					setNoti('An approved account already exists with this email. Please sign in.')
					router.push('/login')
					break
				case 'not_approved':
					refreshID.value++
					setNoti('Registration received. This account is awaiting admin approval.')
					break
				case 'success':
					refreshID.value++
					setNoti('Registration submitted! You will be able to log in once approved.')
					break
				default:
					refreshID.value++
					setNoti('Invalid response from server.', true)
			}
		} catch (e: any) {
			refreshID.value++
			setNoti(e?.data?.message || e?.message || 'Registration failed. Please check your inputs and captcha.', true)
		} finally {
			sending.value = false
		}
	}

	/**
	 * Enforces that password and confirmation match in real-time
	 */
	function comparePass(e: Event) {
		if (body.value.pass !== body.value.re_pass) {
			;(e.target as HTMLInputElement).setCustomValidity('Passwords do not match')
		} else {
			;(e.target as HTMLInputElement).setCustomValidity('')
		}
	}
</script>
