const appContent = document.getElementById('app-content');
const APP = {
	data: {},
	settings: { page: '', theme: '', font: '' },
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

			if (!isEmpty(htmlPath)) {
				console.log('P3', pageName, htmlPath);
				const contentElement = document.getElementById('app-content-container');
				try {
					const response = await fetch(htmlPath);
					if (!response.ok) throw new Error(`Failed to load ${htmlPath}`);
					contentElement.innerHTML = await response.text();
					APP.page.current = pageName;
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

			if (APP.data.displayMenu === true) {
				document.getElementById('page-' + pageName).classList.add('active'); // Add Active Class to Page On Menu
				APP.menu.toggle(2); // Close Menu
			}
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

			APP.font.fonts.forEach((f) => {
				document.body.classList.remove(f.class);
			});

			document.body.classList.add(font.class);
			APP.settings.font = font.name;
			STORAGE.set(APP.font.key, font.name);
		},
	},
	theme: {
		key: 'app-theme',
		themes: [
			{ name: 'Light', class: 'theme-light' },
			{ name: 'Dark', class: 'theme-dark' },
		],

		apply: function (themeName) {
			if (isEmpty(themeName)) {
				themeName = APP.theme.themes[0].name;
			}

			const theme = APP.theme.themes.find((t) => t.name === themeName);
			if (!theme) {
				theme = APP.theme.themes[0];
			}

			APP.theme.themes.forEach((t) => {
				document.body.classList.remove(t.class);
			});
			document.body.classList.add(theme.class);
			APP.settings.theme = theme.name;
			STORAGE.set(APP.theme.key, theme.name);
		},
	},
	pwa: {
		prompt: null,
		init: function () {
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('/service-worker.js');
				APP.pwa.handle();
			}
		},
		handle: function () {
			let deferredPrompt;
			const installBtn = document.getElementById('app-install');

			window.addEventListener('beforeinstallprompt', (e) => {
				e.preventDefault();
				deferredPrompt = e;
			});

			installBtn.addEventListener('click', () => {
				deferredPrompt.prompt(); // Show Install Banner
				deferredPrompt.userChoice.then((choice) => {
					if (choice.outcome === 'accepted') {
						APP.pwa.installed();
					}
					deferredPrompt = null;
					location.reload();
				});
			});

			setTimeout(APP.pwa.installed, 500); // Check if the app is installed
		},
		installed: function () {
			const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
			APP.settings.installed = isInstalled;
			const installBtn = document.getElementById('app-install');
			if (isInstalled) {
				installBtn.classList.add('app-hidden');
			} else {
				installBtn.classList.remove('app-hidden');
			}
		},
	},
	reset: function () {
		localStorage.clear();
		location.reload();
		navigator.serviceWorker.getRegistrations();
	},
	init: async function (callback) {
		try {
			// App Data (app.json)
			const response = await fetch('/app.json');
			if (!response.ok) throw new Error(`Failed to load ${htmlPath}`);
			APP.data = await response.json();

			// Check Font
			let fontName = STORAGE.get('app-font');
			if (isEmpty(fontName)) {
				fontName = APP.data.defaultFont;
			}
			if (isEmpty(fontName) || !APP.font.fonts.find((f) => f.name === fontName)) {
				fontName = APP.font.fonts[0].name;
			}
			APP.font.apply(fontName);

			// Check Theme
			let themeName = STORAGE.get('app-theme');
			if (isEmpty(themeName)) {
				themeName = APP.data.defaultTheme;
			}
			if (isEmpty(themeName) || !APP.theme.themes.find((f) => f.name === themeName)) {
				themeName = APP.theme.themes[0].name;
			}
			APP.theme.apply(themeName);

			// App Info
			document.getElementById('app-name').innerHTML = APP.data.name;
			document.getElementById('app-title').innerHTML = APP.data.name;
			document.getElementById('app-favicon').href = APP.data.icon;
			document.getElementById('app-icon').src = APP.data.icon;

			// Copywrite
			if (!isEmpty(APP.data.copyright)) {
				const copyright = document.getElementById('app-copyright');
				copyright.innerHTML = APP.data.copyright;
				copyright.classList.remove('app-hidden');
			}

			// Check Page
			let pageName = STORAGE.get('app-page');
			if (isEmpty(pageName)) {
				pageName = APP.data.defaultPage;
			}
			if (pageName === 'home' && APP.data.displayHome === false) {
				pageName = '';
			}
			if (pageName === 'settings' && APP.data.displaySettings === false) {
				pageName = '';
			}
			if (pageName !== 'home' && pageName !== 'settings' && (isEmpty(pageName) || !APP.data.pages.find((p) => p.id === pageName))) {
				pageName = APP.data.pages[0].id;
			}

			APP.page.go(pageName);

			// Menu Initialize
			APP.menu.init();

			// PWA Initialize
			if (APP.data.allowInstall) {
				APP.pwa.init();
			}

			callback();
		} catch (error) {
			LOG.error('Error loading HTML:' + error);
		}
	},
};

const MESSAGE = {
	show: function (title = '', message = '', className = '', callback = null) {
		if (document.getElementById('app-message')) {
			document.getElementById('app-message').remove();
		}

		if (!isEmpty(message)) {
			// Message Back
			const appMessageBack = document.createElement('div');
			appMessageBack.id = 'app-message-back';
			appMessageBack.style.opacity = 0;
			appContent.appendChild(appMessageBack);

			const appMessage = document.createElement('div');
			appMessage.id = 'app-message';
			appMessage.style.opacity = 0;
			if (!isEmpty(className)) {
				appMessage.classList.add(className);
			}

			if (isEmpty(title)) {
				title = '';
			}
			appMessage.innerHTML = `<div id="app-message-title"><div id='app-message-title-text'>${title}</div><div id="app-message-close"></div></div><div id="app-message-content">${message}</div>`;
			appContent.appendChild(appMessage);
			setTimeout(() => {
				appMessageBack.style.opacity = 0.75;
				appMessage.style.opacity = 1;
				isFunction(callback) && callback();
			}, 200);

			document.getElementById('app-message-close').addEventListener('click', () => {
				MESSAGE.hide();
			});
			document.getElementById('app-message-back').addEventListener('click', () => {
				MESSAGE.hide();
			});
		}
	},
	confirm: function (title = '', message = '', confirmFunction = null) {
		if (!isEmpty(message) && !isEmpty(confirmFunction)) {
			message += "<div id='app-message-controls'><button id='app-message-confirm' class='app-button app-button-caution'>Yes</button><button id='app-message-cancel' class='app-button'>No</button></div>";
			MESSAGE.show(title, message, '', () => {
				const confirmButton = document.getElementById('app-message-confirm');
				confirmButton.addEventListener('click', () => {
					MESSAGE.hide();
					confirmFunction();
				});

				const cancelButton = document.getElementById('app-message-cancel');
				cancelButton.addEventListener('click', () => MESSAGE.hide());
			});
		}
	},
	error: function (message) {
		MESSAGE.show('Error', message, 'app-message-caution');
	},
	hide: function () {
		const appMessageBack = document.getElementById('app-message-back');
		const appMessage = document.getElementById('app-message');

		appMessageBack.style.opacity = 0;
		appMessage.style.opacity = 0;
		setTimeout(() => {
			appMessageBack.remove();
			appMessage.remove();
		}, 1000);
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
		if (!isEmpty(message) && console) console.log(message);
	},
	error: function (message) {
		if (!isEmpty(message) && console) console.error(message);
	},
};

// Functions
const isEmpty = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0);

const isFunction = (variable) => typeof variable === 'function';

const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const getValue = (inputID) => {
	if (!isEmpty(inputID)) {
		const input = document.getElementById(inputID);
		if (input && input.id == inputID && input.value) {
			return input.value;
		} else {
			return '';
		}
	}
	return '';
};

const formatDate = (variable = '', format = '') => {
	if (isEmpty(variable)) return '';

	const date = new Date(variable);
	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const day = date.getDate();
	const monthIndex = date.getMonth();
	const year = date.getFullYear();

	if (isEmpty(format)) {
		return `${monthNames[monthIndex]} ${day}, ${year}`;
	} else {
		return format
			.replace('YYYY', year)
			.replace('MM', monthIndex + 1)
			.replace('DD', day);
	}
};

const formatTime = (variable = '') => {
	if (isEmpty(variable)) return '';

	const date = new Date(variable);
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? 'PM' : 'AM';
	const formattedHours = hours % 12 || 12;
	return `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
};

// Initialize PWA functionality
document.addEventListener('DOMContentLoaded', () => {
	APP.init(() => {
		// Wait for the app to initialize // Fade out and remove cover screen
		const cover = document.getElementById('app-cover');
		cover.style.opacity = '0'; // Smooth fade-out
		setTimeout(() => cover.remove(), 1000); // Remove after animation
	});
});
