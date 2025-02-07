const APP = {
	data: {},
	settings: { page: '' },
	page: {
		current: '',
		go: async function (pageName) {
			// Don't reload same page
			if (APP.page.current === pageName) {
				return;
			}

			let htmlPath = ``;
			let cssPath = ``;
			let jsPath = ``;
			if (pageName === 'home' || pageName === 'settings') {
				htmlPath = `/app/${pageName}.html`;
				cssPath = `/app/${pageName}.css`;
				jsPath = `/app/${pageName}.js`;
			} else {
				let pageData = null;
				if (APP.data && APP.data.pages) pageData = APP.data.pages.find((page) => page.id === pageName);
				if (pageData) {
					if (pageData && pageData.html) {
						htmlPath = pageData.html;
					}
					if (pageData && pageData.style) {
						cssPath = pageData.style;
					}
					if (pageData && pageData.script) {
						jsPath = pageData.script;
					}
				}
			}
			APP.page.reset();
			APP.page.current = pageName;

			if (!isEmpty(htmlPath)) {
				const contentElement = document.getElementById('app-content-container');
				try {
					const response = await fetch(htmlPath);
					if (!response.ok) throw new Error(`Failed to load ${htmlPath}`);
					contentElement.innerHTML = await response.text();
				} catch (error) {
					LOG.error('Error loading HTML:' + error);
				}

				// Load CSS
				if (!isEmpty(cssPath)) {
					try {
						const response = await fetch(cssPath);
						if (!response.ok) throw new Error(`Failed to load ${cssPath}`);

						const cssLink = document.createElement('link');
						cssLink.rel = 'stylesheet';
						cssLink.href = cssPath;
						cssLink.classList.add('dynamic-style'); // Mark to remove later
						document.head.appendChild(cssLink);
					} catch (error) {
						LOG.error('Error loading CSS:' + error);
					}
				}

				// Load JS
				if (!isEmpty(jsPath)) {
					try {
						const response = await fetch(jsPath);
						if (!response.ok) throw new Error(`Failed to load ${jsPath}`);

						const script = document.createElement('script');
						script.src = jsPath;
						script.classList.add('dynamic-script'); // Mark to remove later
						script.defer = true;
						document.body.appendChild(script);
					} catch (error) {
						LOG.error('Error loading JS:' + error);
					}
				}

				STORAGE.set('app-page', pageName);
			}

			document.getElementById('page-' + pageName).classList.add('active'); // Add Active Class to Page On Menu
			APP.menu.toggle(2); // Close Menu
		},
		reset: function () {
			// Remove previous styles
			document.querySelectorAll('.dynamic-style').forEach((el) => el.remove());

			// Remove previous scripts
			document.querySelectorAll('.dynamic-script').forEach((el) => el.remove());

			// Menu Reset
			document.querySelectorAll('.app-menu-page').forEach((el) => el.classList.remove('active'));

			// Clear
			const contentElement = document.getElementById('app-content-container');
			if (contentElement) contentElement.innerHTML = '';

			APP.page.current = '';
		},
		load: function () {
			let pageName = STORAGE.get('app-page');
			if (isEmpty(pageName)) pageName = 'home';
			APP.page.go(pageName);
		},
	},
	menu: {
		toggle: function (menuState = 0) {
			const menu = document.getElementById('app-menu');
			const toggle = document.getElementById('app-menu-toggle');
			const back = document.getElementById('app-menu-back');

			if (menuState === 0) {
				if (menu.classList.contains('app-menu-closed')) {
					menuState = 1;
				} else {
					menuState = 2;
				}
			}

			if (menuState === 1) {
				menu.classList.remove('app-menu-closed');
				toggle.classList.remove('app-menu-closed');
				back.classList.remove('app-menu-closed');
			} else {
				menu.classList.add('app-menu-closed');
				toggle.classList.add('app-menu-closed');
				back.classList.add('app-menu-closed');
			}
		},
		init: function () {
			if (APP.data && APP.data.displayMenu === true) {
				// Home
				if (APP.data.displayHome) {
					document.getElementById('app-menu-home').classList.remove('app-hidden');
				}

				// Settings
				if (APP.data.displaySettings) {
					document.getElementById('app-menu-settings').classList.remove('app-hidden');
				}

				// Pages
				if (APP.data && APP.data.pages) {
					let pageData = '';
					APP.data.pages.forEach((page) => {
						pageData += `<div id="page-${page.id}" class="app-menu-page" onclick="APP.page.go('${page.id}')">`;
						if (!isEmpty(page.icon)) {
							pageData += `<div class="app-menu-page-icon" style='background-image: url("${page.icon}")'></div>`;
						}
						pageData += `<div class="app-menu-page-title">${page.name}</div>`;
						pageData += `</div>`;
					});

					const pageList = document.getElementById('app-page-list');
					pageList.innerHTML = pageData;
				}

				// Toggle
				const toggleButton = document.getElementById('app-menu-toggle');
				toggleButton.addEventListener('click', () => {
					APP.menu.toggle();
				});
			} else {
				document.getElementById('app-menu').classList.add('app-hidden');
				document.getElementById('app-menu-back').classList.add('app-hidden');
			}
		},
	},
	font: {
		key: 'app-font',
		fonts: [
			{ name: 'Nunito', value: 'Nunito.ttf', class: 'font-nunito' },
			{ name: 'Playfair', value: 'Playfair.ttf', class: 'font-playfair' },
			{ name: 'CourierPrime', value: 'CourierPrime.ttf', class: 'font-courierprime' },
			{ name: 'Roboto', value: 'Roboto.ttf', class: 'font-roboto' },
		],

		apply: function (fontName) {
			if (isEmpty(fontName)) {
				fontName = APP.font.fonts[0].name;
			}

			const font = APP.font.fonts.find((f) => f.name === fontName);
			if (!font) {
				font = APP.font.fonts[0];
			}
			document.body.classList = font.class;
			STORAGE.set(APP.font.key, font.name);
		},
	},
	pwa: {
		register: function () {
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('/service-worker.js');
			}
		},

		handle: function () {
			let deferredPrompt;
			const installBtn = document.getElementById('app-install');

			window.addEventListener('beforeinstallprompt', (e) => {
				e.preventDefault();
				deferredPrompt = e;
				installBtn.classList.remove('app-hidden');
			});

			installBtn.addEventListener('click', () => {
				deferredPrompt.prompt();
				deferredPrompt.userChoice.then((choice) => {
					if (choice.outcome === 'accepted') {
						LOG.message('User installed the PWA');
					}
					deferredPrompt = null;
				});
			});
		},

		init: function () {
			APP.pwa.register();
			APP.pwa.handle();
		},
	},
	init: async function () {
		try {
			// App Data (app.json)
			const response = await fetch('/app.json');
			if (!response.ok) throw new Error(`Failed to load ${htmlPath}`);
			APP.data = await response.json();

			// Check Page
			let pageName = STORAGE.get('app-page');
			if (isEmpty(pageName)) {
				pageName = APP.data.defaultPage;
			}
			if (pageName === 'home' && APP.data.displayHome === false) {
				pageName = '';
			}
			if (pageName !== 'home' && (isEmpty(pageName) || !APP.data.pages.find((p) => p.id === pageName))) {
				pageName = APP.data.pages[0].id;
			}

			// Check Font
			let fontName = STORAGE.get('app-font');
			if (isEmpty(fontName)) {
				fontName = APP.data.defaultFont;
			}
			if (isEmpty(fontName) || !APP.font.fonts.find((f) => f.name === fontName)) {
				fontName = APP.font.fonts[0].name;
			}

			// App Info
			document.getElementById('app-name').innerHTML = APP.data.name;
			document.getElementById('app-title').innerHTML = APP.data.name;
			document.getElementById('app-favicon').href = APP.data.icon;
			document.getElementById('app-icon').src = APP.data.icon;

			APP.font.apply(fontName);
			APP.page.go(pageName);

			APP.menu.init();

			if (APP.data.allowInstall) {
				APP.pwa.init();
			}
		} catch (error) {
			LOG.error('Error loading HTML:' + error);
		}
	},
};

const STORAGE = {
	get: function (key) {
		let value = localStorage.getItem(key);
		try {
			return JSON.parse(value);
		} catch (e) {
			return value;
		}
	},
	set: function (key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	},
	reset: function (key) {
		localStorage.removeItem(key);
	},
};

const LOG = {
	message: function (message) {
		console.log(message);
	},
	error: function (message) {
		console.error(message);
	},
};

// Functions
function isEmpty(value) {
	return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0);
}

// Initialize PWA functionality
document.addEventListener('DOMContentLoaded', () => {
	APP.init();
});
