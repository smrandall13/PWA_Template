var CORE = {
	settings: {},
	init: function () {
		FONT.init();
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

	handleMenuToggle: function () {
		const menu = document.querySelector('.menu');
		const toggleButton = document.getElementById('menuToggle');

		toggleButton.addEventListener('click', () => {
			menu.classList.toggle('open');
		});
	},

	init: function () {
		this.registerServiceWorker();
		this.handleInstallPrompt();
		this.handleMenuToggle();
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
