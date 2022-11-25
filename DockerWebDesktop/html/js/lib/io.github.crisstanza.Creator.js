"use strict";

if (!io) var io = {};
if (!io.github) io.github = {};
if (!io.github.crisstanza) io.github.crisstanza = {};
if (!io.github.crisstanza.Creator) io.github.crisstanza.Creator = {};

(function() {

	io.github.crisstanza.Creator.html = function(name, attributes, parent, innerHTML, child) {
		let element = name ? document.createElement(name) : document.createTextNode(innerHTML);
		if (attributes) {
			for (var key in attributes) {
				element.setAttribute(key, attributes[key]);
			}
		}
		if (parent) {
			parent.appendChild(element);
		}
		if (innerHTML !== undefined) {
			element.innerHTML = innerHTML;
		}
		if (child) {
			element.appendChild(child);
		}
		return element;
	};

	io.github.crisstanza.Creator.svg = function(name, attributes, parent, innerHTML) {
		let element = document.createElementNS('http://www.w3.org/2000/svg', name);
		if (attributes) {
			for (var key in attributes) {
				element.setAttributeNS(null, key, attributes[key]);
			}
		}
		if (parent) {
			parent.appendChild(element);
		}
		if (innerHTML !== undefined) {
			element.innerHTML = innerHTML;
		}
		return element;
	};

	function init(event) {
	}

	window.addEventListener('load', init);

})();
