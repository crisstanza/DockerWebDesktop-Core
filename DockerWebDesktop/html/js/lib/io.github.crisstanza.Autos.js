"use strict";

if (!io) var io = {};
if (!io.github) io.github = {};
if (!io.github.crisstanza) io.github.crisstanza = {};
if (!io.github.crisstanza.Autos) io.github.crisstanza.Autos = {};

(function() {

	io.github.crisstanza.Autos.initIds = function() {
		const elements = document.querySelectorAll('[id]:not([id=""])');
		if (elements) {
			const length = elements.length;
			for (let i = 0 ; i < length ; i++) {
				const element = elements[i];
				const id = element.getAttribute('id');
				const identifier = fixId(id);
				window[identifier] = element;
			}
		}
		return elements;
	};

	io.github.crisstanza.Autos.initNames = function() {
		const elements = document.querySelectorAll('[name]:not([name=""])');
		if (elements) {
			const length = elements.length;
			for (let i = 0 ; i < length ; i++) {
				const element = elements[i];
				const name = element.getAttribute('name');
				const identifier = fixId(name);
				if (!window[identifier]) {
					window[identifier] = [];
				}
				window[identifier].push(element);
			}
		}
		return elements;
	};

	io.github.crisstanza.Autos.initRadios = function(obj) {
		const elements = document.querySelectorAll('input[type="radio"][name]:not([name=""])');
		if (elements) {
			const parent = obj ? 'obj.' : '';
			const length = elements.length;
			for (let i = 0 ; i < length ; i++) {
				const element = elements[i];
				const name = element.getAttribute('name');
				const identifier = fixId(name);
				element.addEventListener('click', function(event) {
					eval(parent+identifier+'_OnClick(event)');
				});
			}
		}
		return elements;
	};

	io.github.crisstanza.Autos.initChecks = function(obj) {
		const elements = document.querySelectorAll('input[type="checkbox"][name]:not([name=""])');
		if (elements) {
			const parent = obj ? 'obj.' : '';
			const length = elements.length;
			for (let i = 0 ; i < length ; i++) {
				const element = elements[i];
				const name = element.getAttribute('name');
				const identifier = fixId(name);
				element.addEventListener('click', function(event) {
					eval(parent+identifier+'_OnClick(event)');
				});
			}
		}
		return elements;
	};

	function fixId(str) {
		const parts = str.split('-');
		const length = parts.length;
		for (let i = 0 ; i < length ; i++) {
			const part = parts[i];
			if (i > 0) {
				parts[i] = part.charAt(0).toUpperCase() + part.slice(1);
			}
		}
		const identifier = parts.join('');
		return identifier;
	}

	function firstUppercase(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	function init(event) {
		const autos = document.body.getAttribute('data-autos');
		if (autos) {
			const parts = autos.split(', ');
			const length = parts.length;
			for (let i = 0 ; i < length ; i++) {
				const part = parts[i];
				const identifier = firstUppercase(part);
				const js = 'io.github.crisstanza.Autos.init'+identifier+'();';
				eval(js);
			}
		}
	}

	window.addEventListener('load', init);

})();
