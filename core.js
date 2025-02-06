var CORE = {
	settings: {},
	page: {
		go: function (pageName) {
			let content = ``;
			console.log('P', pageName);
			if (pageName === 'home') {
				content = `
				<h1>Welcome to My PWA</h1>
				<p>This is where the selected content will be displayed.</p>
				`;
			} else if (pageName === 'settings') {
				content = `
				<h1>Settings</h1>
				<p>This is where the settings will be displayed.</p>
				`;
			}

			document.getElementById('content').innerHTML = content;
			MENU.toggle(2);
		},
		load: function () {
			let pageName = STORAGE.get('page');
			if (isEmpty(pageName)) pageName = 'home';
			CORE.page.go(pageName);
		},
	},
	init: function () {
		FONT.init();
		MENU.init();
		CORE.page.load();
	},
};

const MENU = {
	toggle: function (menuState = 0) {
		const menu = document.getElementById('menu');
		const toggle = document.getElementById('menuToggle');
		const placeholder = document.getElementById('menu-placeholder');

		console.log('MS1', menuState);

		if (menuState === 0) {
			if (menu.classList.contains('closed')) {
				menuState = 1;
			} else {
				menuState = 2;
			}
		}
		console.log('MS2', menuState);

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

// Initialize PWA functionality
document.addEventListener('DOMContentLoaded', () => {
	PWA.init();
	CORE.init();
});
