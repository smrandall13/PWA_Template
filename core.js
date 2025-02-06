var CORE = {
	data: {},
	settings: {},
	page: {
		current: '',
		go: async function (pageName) {
			// Don't reload same page
			if (CORE.page.current === pageName) {
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
				if (CORE.data && CORE.data.pages) pageData = CORE.data.pages.find((page) => page.id === pageName);
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
			CORE.page.reset();
			CORE.page.current = pageName;

			if (!isEmpty(htmlPath)) {
				const contentElement = document.getElementById('content');
				try {
					const response = await fetch(htmlPath);
					if (!response.ok) throw new Error(`Failed to load ${htmlPath}`);
					contentElement.innerHTML = await response.text();
				} catch (error) {
					console.error('Error loading HTML:', error);
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
						console.error('Error loading CSS:', error);
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
						console.error('Error loading JS:', error);
					}
				}

				STORAGE.set('app-page', pageName);
			}

			document.getElementById('page-' + pageName).classList.add('active'); // Add Active Class to Page On Menu
			MENU.toggle(2); // Close Menu
		},
		reset: function () {
			// Remove previous styles
			document.querySelectorAll('.dynamic-style').forEach((el) => el.remove());

			// Remove previous scripts
			document.querySelectorAll('.dynamic-script').forEach((el) => el.remove());

			// Menu Reset
			document.querySelectorAll('.menu-page').forEach((el) => el.classList.remove('active'));

			// Clear `.content` div
			const contentElement = document.querySelector('.content');
			if (contentElement) contentElement.innerHTML = '';

			CORE.page.current = '';
		},
		load: function () {
			let pageName = STORAGE.get('app-page');
			if (isEmpty(pageName)) pageName = 'home';
			CORE.page.go(pageName);
		},
	},
	init: async function () {
		try {
			const response = await fetch('/app.json');
			if (!response.ok) throw new Error(`Failed to load ${htmlPath}`);
			CORE.data = await response.json();

			// App Info
			document.getElementById('app-name').innerHTML = CORE.data.name;
			document.getElementById('app-title').innerHTML = CORE.data.name;
			document.getElementById('app-favicon').href = CORE.data.icon;
			document.getElementById('app-icon').src = CORE.data.icon;

			FONT.init();
			MENU.init();
			CORE.page.load();
		} catch (error) {
			console.error('Error loading HTML:', error);
		}
	},
};

const MENU = {
	toggle: function (menuState = 0) {
		const menu = document.getElementById('menu');
		const toggle = document.getElementById('menuToggle');
		const placeholder = document.getElementById('menu-placeholder');

		if (menuState === 0) {
			if (menu.classList.contains('closed')) {
				menuState = 1;
			} else {
				menuState = 2;
			}
		}

		if (menuState === 1) {
			menu.classList.remove('closed');
			toggle.classList.remove('closed');
			placeholder.classList.remove('closed');
		} else {
			menu.classList.add('closed');
			toggle.classList.add('closed');
			placeholder.classList.add('closed');
		}
	},
	init: function () {
		// Pages
		if (CORE.data && CORE.data.pages) {
			let pageData = '';
			CORE.data.pages.forEach((page) => {
				pageData += `<div id="page-${page.id}" class="menu-page" onclick="CORE.page.go('${page.id}')">`;
				if (!isEmpty(page.icon)) {
					pageData += `<div class="menu-page-icon" style='background-image: url("${page.icon}")'></div>`;
				}
				pageData += `<div class="menu-page-title">${page.name}</div>`;
				pageData += `</div>`;
			});

			const pageList = document.getElementById('page-list');
			pageList.innerHTML = pageData;
		}

		// Toggle
		const toggleButton = document.getElementById('menuToggle');
		toggleButton.addEventListener('click', () => {
			this.toggle();
		});
	},
};

const PWA = {
	registerServiceWorker: function () {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js');
		}
	},

	handleInstallPrompt: function () {
		let deferredPrompt;
		const installBtn = document.getElementById('installBtn');

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			installBtn.hidden = false;
		});

		installBtn.addEventListener('click', () => {
			deferredPrompt.prompt();
			deferredPrompt.userChoice.then((choice) => {
				if (choice.outcome === 'accepted') {
					console.log('User installed the PWA');
				}
				deferredPrompt = null;
			});
		});
	},

	init: function () {
		this.registerServiceWorker();
		this.handleInstallPrompt();
	},
};

const FONT = {
	key: 'app-font',
	fonts: [
		{ name: 'Nunito', value: 'Nunito.ttf', class: 'font-nunito' },
		{ name: 'Playfair', value: 'Playfair.ttf', class: 'font-playfair' },
		{ name: 'CourierPrime', value: 'CourierPrime.ttf', class: 'font-courierprime' },
		{ name: 'Roboto', value: 'Roboto.ttf', class: 'font-roboto' },
	],

	apply: function (fontName) {
		if (isEmpty(fontName)) {
			fontName = this.fonts[0].name;
		}

		const font = this.fonts.find((f) => f.name === fontName);
		if (!font) {
			font = this.fonts[0];
		}
		document.body.classList = font.class;
		STORAGE.set(FONT.key, font.name);
	},

	load: function () {
		let savedFont = STORAGE.get(FONT.key);
		if (isEmpty(savedFont)) {
			savedFont = this.fonts[0].name;
		}
		if (savedFont) {
			this.apply(savedFont);
		}
	},

	init: function () {
		this.load();
	},
};

// Initialize PWA functionality
document.addEventListener('DOMContentLoaded', () => {
	PWA.init();
	CORE.init();
});
