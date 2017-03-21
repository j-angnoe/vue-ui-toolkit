'use strict';

/**
 * http://ux.stackexchange.com/questions/11998/what-is-a-toast-notification
 * 
 */

var instances = [];

Vue.component('toast-container', {
	template: '<div class="toast-container">\n\t\t<div\n\t\t\tclass="toast-message toast-message-{{message.type||\'default\'}}"\n\t\t\tv-for="message in messages"\n\t\t>{{message.message}}</div>\n\t</div>',

	mounted: function mounted() {
		this.init();
	},
	ready: function ready() {
		this.init();
	},
	beforeDestroy: function beforeDestroy() {
		var idx = instances.indexOf(this);
		if (idx !== -1) {
			instances.splice(idx, 1);
		}
	},
	data: function data() {
		return {
			messages: []
		};
	},

	methods: {
		init: function init() {
			instances.push(this);
		},

		add: function add(message) {
			var _this = this;

			// originalMessage
			var originalMessage = this.messages.filter(function (msg) {
				return msg.message === message.message;
			});

			if (!originalMessage.length) {
				this.messages.unshift(message);
			} else {
				message = originalMessage[0];
			}

			var timeoutTime = 1e3;

			if (message.timeout) {
				clearTimeout(message.timeout);
			}

			message.timeout = setTimeout(function () {
				var idx = _this.messages.indexOf(message);
				if (idx !== -1) {
					_this.messages.splice(idx, 1);
				}
			}, timeoutTime);
		}
	}
});

/**
 * Expose toast to window under given name.
 * 
 * @usage
 * var ToastComponent = require('./toast');
 * ToastComponent.exposeAs('toast'); // also sets window.toast
 * // toast = window.toast
 * 
 * toast('hello','success') // or error or notice
 * 
 * fetch('...').then(successHandler, toast.handleError)
 * 
 * @return window[toastName]
 */
module.exports.exposeAs = function (toastName) {
	toastName = 'toast';

	// extend our global app.
	window[toastName] = function (message, type) {
		instances.forEach(function (i) {
			i.add({ message: message, type: type });
		});
	};

	window[toastName].handleError = function (err) {
		if (err && err.message) {
			err = err.message;
		}
		window[toastName](err, 'error');
	};

	return window[toastName];
};