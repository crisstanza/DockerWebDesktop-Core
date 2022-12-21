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
				table.classList.add(this.options.class);
			}
			if (this.options.headers) {
				if (items.length > 0) {
					const thead = io.github.crisstanza.Creator.html('thead', {}, table);
					const tr = io.github.crisstanza.Creator.html('tr', {}, thead);
					for (let i = 0; i < columns.length; i++) {
						const column = columns[i];
						io.github.crisstanza.Creator.html('th', {}, tr, column.name);
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
					if (formattedValue instanceof Node) {
						io.github.crisstanza.Creator.html('td', { class: className }, tr, null, formattedValue);
					} else {
						io.github.crisstanza.Creator.html('td', { class: className }, tr, formattedValue);
					}
				}
				if (actions && actions.length || links && links.length) {
					const td = io.github.crisstanza.Creator.html('td', {}, tr);
					if (actions && actions.length) {
						for (let j = 0; j < actions.length; j++) {
							const action = actions[j];
							const enabledChecker = action.enabled;
							const button = io.github.crisstanza.Creator.html('button', {}, td, action.label);
							button.addEventListener('click', function (event) { action.handler(event, item) });
							if (enabledChecker && !enabledChecker(item)) {
								button.setAttribute('disabled', 'disabled');
							}
						}
					}
					if (links && links.length) {
						for (let j = 0; j < links.length; j++) {
							const link = links[j];
							const a = io.github.crisstanza.Creator.html('a', {}, td, link.label);
							if (link.href) {
								a.href = link.href(item);
							} else {
								a.href = '#';
							}
							if (link.target) {
								a.target = link.target;
							}
							if (link.handler) {
								a.addEventListener('click', function (event) { link.handler(event, item) });
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
