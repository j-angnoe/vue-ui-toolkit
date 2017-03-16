
/**
 * http://ux.stackexchange.com/questions/11998/what-is-a-toast-notification
 * 
 */


var instances = [];

Vue.component('toast-container', {
	template: `<div class="toast-container">
		<div
			class="toast-message toast-message-{{message.type||'default'}}"
			v-for="message in messages"
		>{{message.message}}</div>
	</div>`,


	mounted() {
		this.init();
	},
	ready() {
		this.init();
	},
	
	beforeDestroy() {
		let idx = instances.indexOf(this);
		if (idx !== -1) {
			instances.splice(idx, 1);
		}
	},
	data() {
		return {
			messages: []
		}
	},
	methods: {
		init() {
			instances.push(this);
		},		
		add: function (message) {

			// originalMessage
			let originalMessage = this.messages.filter( (msg) => {
				return msg.message === message.message;
			});

			if (!originalMessage.length) {
				this.messages.unshift(message);
			} else {
				message = originalMessage[0];
			}

			let timeoutTime = 1e3;

			if (message.timeout) {
				clearTimeout(message.timeout);
			}

			message.timeout = setTimeout(() => {
				let idx = this.messages.indexOf(message);
				if (idx !== -1) {
					this.messages.splice(idx, 1);
				}
			}, timeoutTime);
		}
	}
})


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
        instances.forEach((i) => {
            i.add({message, type});
        })
    }
    
    window[toastName].handleError = function (err) {
        if (err && err.message) {
            err = err.message;
        }
        window[toastName](err, 'error');
    }
    
    return window[toastName];
}