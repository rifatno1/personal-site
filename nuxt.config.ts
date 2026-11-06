/**
 * Nuxt Configuration
 * Tech Stack: Nuxt 4 (Nitro 2.13.6, Vite 8, Vue 3.5), Tailwind CSS v4 (@tailwindcss/vite),
 * PWA (@vite-pwa/nuxt), MongoDB Atlas, Web Crypto AES-GCM, Cloudflare Turnstile.
 */

import { join } from 'node:path'
import { tmpdir } from 'node:os'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	devtools: { enabled: false },
	telemetry: false,
	compatibilityDate: '2025-07-15',
	future: { compatibilityVersion: 4 },
	css: ['~/assets/css/global.css'],
	router: { options: { sensitive: true } },

	vite: {
		build: { assetsInlineLimit: 0 },
		plugins: [tailwindcss()]
	},

	modules: ['@vite-pwa/nuxt'],

	// Server and Public runtime configuration read from environment
	runtimeConfig: {
		mongoUrl: process.env.MongoUrl || '',
		privateKey: process.env.PrivateKey || '',
		turnstileSecretKey: process.env.TurnstileSecretKey || '',
		perPage: process.env.PerPage || '20',
		public: {
			turnstileSiteKey: process.env.VITE_TurnstileSiteKey || '',
			publicKey: process.env.VITE_PublicKey || ''
		}
	},

	nitro: {
		storage: {
			kvdb: {
				driver: 'fs',
				base: join(tmpdir(), 'Personal Site', 'kvdb')
			}
		}
	},

	app: {
		head: {
			title: 'Rifat Mahmud — Developer & Creator',
			htmlAttrs: { lang: 'en' },
			noscript: [{ innerHTML: 'Javascript is required to run this website' }],
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{ name: 'referrer', content: 'no-referrer' },
				{ name: 'author', content: 'Rifat Mahmud' },
				{ name: 'creator', content: 'Rifat Mahmud' },
				{ name: 'description', content: 'Personal portfolio, engineering articles, and software projects by Rifat Mahmud.' },
				// Web App Manifest & Mobile Headers
				{ name: 'application-name', content: 'Rifat Mahmud' },
				{ name: 'mobile-web-app-capable', content: 'yes' },
				{ name: 'apple-mobile-web-app-capable', content: 'yes' },
				{ name: 'apple-mobile-web-app-title', content: 'Rifat Mahmud' },
				{ name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
				// Open Graph
				{ property: 'og:site:name', content: 'Rifat Mahmud' },
				{ property: 'og:type', content: 'website' }
			],
			link: [
				{ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/icon-16.png' },
				{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/icon-32.png' },
				{ rel: 'icon', type: 'image/png', sizes: '48x48', href: '/icons/icon-48.png' },
				{ rel: 'icon', type: 'image/png', sizes: '64x64', href: '/icons/icon-64.png' },
				{ rel: 'icon', type: 'image/png', sizes: '180x180', href: '/icons/icon-180.png' },
				{ rel: 'apple-touch-icon', type: 'image/png', sizes: '180x180', href: '/icons/icon-180.png' }
			],
			script: [
				{
					// Zero-flash theme initialization script executing before body render
					innerHTML: `(function(){try{var t=localStorage.getItem('theme')||'auto';var d=t==='dark'||(t==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
					type: 'text/javascript'
				},
				// Cloudflare Turnstile explicit rendering SDK
				{ src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit' }
			]
		}
	},

	pwa: {
		registerType: 'autoUpdate',
		devOptions: { enabled: true },
		workbox: {
			globPatterns: ['**/*.{js,css,html,png,svg,jpg,ttf}'],
			navigateFallback: '/?csr=1',
			additionalManifestEntries: [{ url: '/?csr=1', revision: new Date().getTime().toString() }],
			cleanupOutdatedCaches: true
		},
		manifest: {
			name: 'Rifat Mahmud',
			short_name: 'Rifat',
			theme_color: '#09090b',
			background_color: '#09090b',
			display: 'standalone',
			id: '/',
			icons: [
				{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
				{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
			]
		}
	}
})
