"use strict";

if (!io) var io = {};
if (!io.github) io.github = {};
if (!io.github.crisstanza) io.github.crisstanza = {};

(function() {

	io.github.crisstanza.SimpleDataGrid = class {
		#options = null;
		#parent = null;
		constructor(options, parent) {
			this.options = options ? options : {};
			this.parent = parent;
		}
		build(items, columns, actions, links) {
			const table = io.github.crisstanza.Creator.html('table', { border: this.options.border ? 1 : 0 });
			if (this.options.class) {
				this.options.class.split(/\s+/).forEach((className) => table.classList.add(className));
			}
			if (this.options.headers) {
				if (items.length > 0) {
					const thead = io.github.crisstanza.Creator.html('thead', {}, table);
					const tr = io.github.crisstanza.Creator.html('tr', {}, thead);
					for (let i = 0; i < columns.length; i++) {
						const column = columns[i];
						let th;
						if (this.options.wrap?.headers) {
							th = io.github.crisstanza.Creator.html('th', {}, tr);
							io.github.crisstanza.Creator.html('span', {}, th, column.name);
						} else {
							th = io.github.crisstanza.Creator.html('th', {}, tr, column.name);
						}
						if (this.options.headerHandler) {
							const handler = this.options.headerHandler;
							th.addEventListener('click', function (event) { handler(event, th, i) });
						}
					}
					if (actions && actions.length || links && links.length) {
						io.github.crisstanza.Creator.html('th', {}, tr);
					}
				}
			}
			const tbody = io.github.crisstanza.Creator.html('tbody', {}, table);
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const tr = io.github.crisstanza.Creator.html('tr', {}, tbody);
				for (let j = 0; j < columns.length; j++) {
					const column = columns[j];
					const key = column.name ? column.name : column;
					const className = column.class ? column.class : '';
					const formatter = column.formatter;
					const value = item[key];
					const formattedValue = formatter ? formatter(value) : this.#escapeHtml(value);
					if (this.options.wrap?.values) {
						const td = io.github.crisstanza.Creator.html('td', { class: className }, tr);
						if (formattedValue instanceof Node) {
							io.github.crisstanza.Creator.html('div', {}, td, null, formattedValue);
						} else {
							io.github.crisstanza.Creator.html('div', {}, td, formattedValue);
						}
					} else {
						if (formattedValue instanceof Node) {
							io.github.crisstanza.Creator.html('td', { class: className }, tr, null, formattedValue);
						} else {
							io.github.crisstanza.Creator.html('td', { class: className }, tr, formattedValue);
						}
					}
				}
				if (actions && actions.length || links && links.length) {
					const td = io.github.crisstanza.Creator.html('td', {}, tr);
					let containerAll;
					if (this.options.wrap?.interactions?.all) {
						const wrapper = io.github.crisstanza.Creator.html('span', {}, td);
						containerAll = wrapper;
					} else {
						containerAll = td;
					}
					if (actions && actions.length) {
						let containerActions;
						if (this.options.wrap?.interactions?.actions) {
							const wrapper = io.github.crisstanza.Creator.html('span', {}, containerAll);
							containerActions = wrapper;
						} else {
							containerActions = containerAll;
						}
						for (let j = 0; j < actions.length; j++) {
							const action = actions[j];
							if (action.lineBreak) {
								io.github.crisstanza.Creator.html('br', {}, containerActions);
							} else {
								const enabledChecker = action.enabled;
								const button = io.github.crisstanza.Creator.html('button', {}, containerActions, action.label);
								button.addEventListener('click', function (event) { action.handler(event, item) });
								if (enabledChecker && !enabledChecker(item)) {
									button.setAttribute('disabled', 'disabled');
								}
							}
						}
					}
					if (links && links.length) {
						let containerLinks;
						if (this.options.wrap?.interactions?.links) {
							const wrapper = io.github.crisstanza.Creator.html('span', {}, containerAll);
							containerLinks = wrapper;
						} else {
							containerLinks = containerAll;
						}
						for (let j = 0; j < links.length; j++) {
							const link = links[j];
							const enabledChecker = link.enabled;
							const enabled = !(enabledChecker && !enabledChecker(item));
							const a = io.github.crisstanza.Creator.html('a', {}, containerLinks, link.label);
							if (enabled) {
								if (link.href) {
									a.href = link.href(item);
								}
								if (link.target) {
									a.target = link.target;
								}
								if (link.handler) {
									a.addEventListener('click', function (event) { link.handler(event, item) });
								}
								if (link.hover) {
									a.addEventListener('mouseover', function (event) { link.hover(event, item) });
								}
							} else {
								a.setAttribute('disabled', 'disabled');
							}
						}
					}
				}
			}
			const tfoot = io.github.crisstanza.Creator.html('tfoot', {}, table);
			const tr = io.github.crisstanza.Creator.html('tr', {}, tfoot);
			io.github.crisstanza.Creator.html('td', { colspan: columns.length + (actions && actions.length ? 1 : 0) + (links && links.length ? 1 : 0) }, tr, 'Total: ' + items.length);
			if (this.parent) {
				if (this.parent.querySelector('table')) {
					this.parent.querySelector('table').remove();
				}
				this.parent.appendChild(table);
			}
			return table;
		}
		#escapeHtml(str) {
			return str !== undefined ? String(str).replace(/["'<>\&]/, (char) => '&#' + char.charCodeAt(0) + ';') : '';
		}
	};

	function init(event) {
	}

	window.addEventListener('load', init);

})();
