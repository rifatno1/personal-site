<!--
  pages/about.vue
  About Me / Portfolio Showcase page:
  - Personal developer bio and avatar
  - Categorized Tech Stack and Skills (Frontend, Backend, DevOps/Tools)
  - Featured open-source creations and projects
  - Social media and direct contact channels
-->
<template>
	<div class="flex flex-col gap-10 max-w-3xl mx-auto py-2">
		<!-- Hero Section -->
		<section class="glass-card rounded-3xl p-6 sm:p-9 flex flex-col sm:flex-row items-center sm:items-start gap-7 relative overflow-hidden">
			<!-- Subtle glow background decoration -->
			<div class="absolute -right-10 -bottom-10 w-44 h-44 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

			<div class="relative shrink-0">
				<img
					src="/images/profile_logo.png"
					alt="Rifat Mahmud"
					class="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-2 ring-indigo-500/30 shadow-lg"
				/>
				<span class="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#121215]" title="Available for opportunities"></span>
			</div>

			<div class="flex flex-col text-center sm:text-left gap-3.5 flex-1 min-w-0">
				<div>
					<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40 mb-2.5">
						<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
						Available for collaborations & projects
					</div>
					<h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
						Rifat Mahmud
					</h1>
					<p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
						Self-Taught Full Stack Web Developer
					</p>
				</div>

				<p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
					Passionate about crafting fast, modern, and accessible digital experiences. I specialize in building reactive web applications using Vue, Nuxt, and modern JavaScript toolchains, with a relentless focus on clean code and intuitive UI.
				</p>

				<div class="flex items-center justify-center sm:justify-start gap-3 pt-1">
					<NuxtLink
						to="/contact"
						class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
					>
						Get In Touch
					</NuxtLink>
					<a
						href="https://github.com/RifatMahmudno-1"
						target="_blank"
						rel="noopener noreferrer"
						class="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 transition-colors"
					>
						View GitHub
					</a>
				</div>
			</div>
		</section>

		<!-- Skills & Tech Stack -->
		<section class="flex flex-col gap-4">
			<div class="flex items-center justify-between px-1">
				<h2 class="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
					Tech Stack & Skills
				</h2>
				<span class="text-xs text-zinc-400">Tools I use daily</span>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div
					v-for="cat in skillCategories"
					:key="cat.name"
					class="glass-card rounded-2xl p-5 flex flex-col gap-3"
				>
					<div class="flex items-center gap-2">
						<span class="text-lg">{{ cat.icon }}</span>
						<h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ cat.name }}</h3>
					</div>

					<div class="flex flex-wrap gap-1.5">
						<span
							v-for="skill in cat.skills"
							:key="skill"
							class="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/40"
						>
							{{ skill }}
						</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Featured Work & Projects -->
		<section class="flex flex-col gap-4">
			<h2 class="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
				Featured Creations
			</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div
					v-for="project in projects"
					:key="project.title"
					class="glass-card rounded-2xl p-6 flex flex-col justify-between gap-4 group"
				>
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between">
							<span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">
								{{ project.badge }}
							</span>
							<a
								v-if="project.github"
								:href="project.github"
								target="_blank"
								rel="noopener noreferrer"
								class="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1"
								title="GitHub Repository"
							>
								<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
									<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
								</svg>
							</a>
						</div>
						<h3 class="text-base font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
							{{ project.title }}
						</h3>
						<p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
							{{ project.description }}
						</p>
					</div>

					<div class="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
						<span
							v-for="t in project.tags"
							:key="t"
							class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400"
						>
							#{{ t }}
						</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Personal Philosophy / Note -->
		<section class="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-3">
			<h2 class="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
				About This Space
			</h2>
			<p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
				This website serves as my digital garden—a corner of the internet where I publish technical write-ups, engineering notes, experiments, and university memories. Everything here is built to be fast, minimal, and fully owned.
			</p>
		</section>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: 'About — Rifat Mahmud'
	})

	const skillCategories = [
		{
			name: 'Frontend',
			icon: '🎨',
			skills: ['Vue 3', 'Nuxt 4', 'Tailwind CSS', 'TypeScript', 'HTML5/CSS3', 'PWA']
		},
		{
			name: 'Backend',
			icon: '⚙️',
			skills: ['Node.js', 'Nitro', 'MongoDB', 'REST APIs', 'Web Crypto AES', 'BCrypt']
		},
		{
			name: 'Tools & DevOps',
			icon: '🛠️',
			skills: ['Git', 'pnpm', 'Vite', 'Cloudflare Turnstile', 'Imgur API', 'Linux']
		}
	]

	const projects = [
		{
			title: 'Personal Portfolio & Article Engine',
			badge: 'Current Site',
			description: 'High-performance personal blog built on Nuxt 4, featuring real-time client search, markdown parsing with syntax highlighting, and encrypted admin authentication.',
			tags: ['Nuxt4', 'Vue3', 'Tailwind', 'MongoDB'],
			github: 'https://github.com/RifatMahmudno-1/personal-site'
		},
		{
			title: 'AniChar & Interactive Web Tools',
			badge: 'Web App',
			description: 'Collection of utility applications including character showcases, number converters, text encryption/decryption, and web games.',
			tags: ['JavaScript', 'HTML5', 'CSS3', 'Canvas'],
			github: 'https://github.com/RifatMahmudno-1'
		}
	]
</script>
