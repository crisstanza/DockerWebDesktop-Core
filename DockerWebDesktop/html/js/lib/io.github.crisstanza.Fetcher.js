"use strict";

if (!io) var io = {};
if (!io.github) io.github = {};
if (!io.github.crisstanza) io.github.crisstanza = {};

(function() {

	io.github.crisstanza.Fetcher = class {
		#options = null;
		constructor() {
			this.#options = {
				method: null,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: null
			};
		}
		post(url, data, callback, callbackError) {
			this.#options.method = 'POST';
			this.#options.body = JSON.stringify(data);
			this.#doFetch(url, callback, callbackError);
		}
		get(url, data, callback, callbackError) {
			this.#options.method = 'GET';
			this.#options.body = null;
			this.#doFetch(this.#getUrl(url, data), callback, callbackError);
		}
		#doFetch(url, callback, callbackError) {
			fetch(url, this.options)
				.then(response => {
					if (response.ok) {
						return response.json();
					} else {
						return response.text().then(text => { throw new Error(text) });
					}
				})
				.then(json => callback(json))
				.catch(exc => callbackError(exc))
			;
		}
		#getUrl(url, data) {
			if (data) {
				const buffer = []
				const keys = Object.keys(data);
				for (let key of keys) {
					buffer.push(key + '=' + encodeURIComponent(data[key]));
				}
				return url + '?' + buffer.join('&');
			}
			return url;
		}
	};

})();
