(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports = {};

window.dialog = {
	launch: launchDialog
}

/**
 * Use case one:
 *
 * @usage - use case 1:
 
			var dlg = dialog.launch(`
				<h1>Hoe is het?</h1>
				<p>Volgens onze berekeningen gaat het
				allemaal wel fantastisch!
				</p>

				<example-component></example-component>
			`);

			dlg.title = 'Awesome unit';
			dlg.closable = true;

 * @usage - usage case 2
 *
 * // open a file dialog:

		// ideeen:
		// quick-search
		// navigeren met pijltjes

		dialog.launch({
			title?: string,
			width?: number,
			height?: number,
			fullscreen?: boolean|{css},
            centered?: boolean,
			// just like vue router:
			component: {
				template: `<div style="padding:20px;">
					<input v-model="search">

					<table>
						<tr v-for="file in files | filterBy search" @click="resolve(file)">
							<td>{{file}}</td>
						</tr>
					</table>
				</div>`,
				data: {
					files: [
					..
					..
					]
				}
			}
		});
			
 * @param  {[type]} content [description]
 * @return {[type]}         [description]
 */
function launchDialog(content) {

	var vueObject = {
		template: `
			<dialog
				:closable="closable"
				:width="width"
				:height="height"
				:title="title"
				:fullscreen="fullscreen"
                :centered="centered"
			>
				<inner></inner>
			</dialog>		
		`,
	};
	if (typeof content === 'string') {
		content = {
			component: {
				template:content
			}
		}
	} 
	
	if (content.component.data && typeof content.component.data !== 'function') {
		let dataCopy = Object.assign({}, content.component.data);
		content.component.data = function () {
			return dataCopy;
		}
	}
	data = content;		
	vueObject.components = vueObject.components || {};
	vueObject.components.inner = content.component;
	
	 
	// defaults:
	data = Object.assign({
		closable: true,
		title: '',
		height: 400,
		width: 400,
        centered: false,
        fullscreen: false
	}, data)
	
	vueObject.data = function () { return data };
	
	var newElement = document.createElement('div');
    
    document.body.appendChild(newElement);

	vueObject.el = newElement;

	var vue = new Vue(vueObject)
	var dlg = vue.$children[0];

	vue.$dialog = dlg;
	
	dlg.visible = true;

	return dlg;
}

var mousePosition = {
	pos: {
		x: 0,
		y: 0
	},
	init() {
	
		document.addEventListener('mousemove', function (event) {
			mousePosition.pos.x = event.pageX;
			mousePosition.pos.y = event.pageY;

			// console.log(mousePosition.pos);

		});
	}
}
mousePosition.init();

var dialogIds = 0;

Vue.component('dialog', {
	props: [
        'closable', 
        'visible', 
        'title',
        'width',
        'height',
        'fullscreen',
        'centered'
    ],
	
	template: `<div 
        class="dialog-container"
        v-bind:class="{'with-title': !!title}" 
        v-bind:style="styles"
    >
        <div v-if="closable" @click="close" class="dialog-close">
            &times;
        </div>
		<div v-if="title" class="dialog-title">
            <div v-if="closable" @click="close" class="dialog-close">
                &times;
            </div>			
			{{title}}
		</div>
		<div class="dialog-content">
			<slot></slot>
		</div>
	</div>
	`,

	computed: {
		styles() {
			var res={};
			res.display=this.display;
			
			// this.fullscreen === true or
			// this.fullscreen = {left?, top?, right?, bottom?, width?, height?, position?}
			if (this.fullscreen) {
				
				res.left = this.fullscreen.left || 0;
				res.top = this.fullscreen.top || 0;
				res.bottom = this.fullscreen.bottom || 0;
				res.right = this.fullscreen.right || 0;
				res.width = this.fullscreen.width || '100%';
				res.height = this.fullscreen.height || '100%';
				res.position = this.fullscreen.position || 'fixed';
				
				if (this.fullscreen < 0) {
					res.left = res.top = res.bottom = res.height = Math.abs(this.fullscreen);		
				}
							
			} else {
				
				if(this.width) {
				    res.width = parseFloat(this.width) + 'px';
                } 
                
                if (this.height) {
				    res.height = parseFloat(this.height) + 'px';
                }
                
				if (this.centered) {
                    
                    // At center, regardless of scrolling position.
                    res.position = 'fixed';
                    
					// @todo testen:
					res.left = '50%';
					res.top = '50%';
					
					res.marginLeft = (- (parseFloat(this.width)/2 || $(this.$el.width()/2))) + 'px';
					res.marginTop = (- (parseFloat(this.height)/2 || $(this.$el.height()/2))) + 'px';
				}
			}
            
			
			return res;
		},
		display: function() {
			if (this.visible) {
				return 'block';
			}
			return 'none'
		}
	},

	data() {

		return {
			dialogId: null,
			/*
			title: 'hoe is het!',
			closable: true,
			visible: false
			*/
		}
	},

	ready() {
		dialogIds++;
		this.dialogId = dialogIds;

		this.registerEscapeListener();
		this.setInitialPosition();

		if (window.$ && $.fn && $.fn.draggable) {
			$(this.$el).draggable({
				handle: '.dialog-title'
			})
		}
		this.captureInitialFocus();

	},

	methods: {
		/**
		 * init method - the first input should be focussed.
		 * only if this thing is active / visible though! (todo)
	     * todo - test if it will select input, select and textarea first...
	     *
		 */
		captureInitialFocus() {

			setTimeout(() => {
				var firstInput = this.$el.querySelector('input,select,textarea');

				if (firstInput) {
					firstInput.focus();
				}
			},10);
		},


		/**
		 * init method: Set dialog to mouse position. uses the mousePosition service.
		 */
		setInitialPosition() {
			// requires mouse position to be stored locally.
			
			/**
			 * to be improved:
			 * - bounding box protection.
			 */

			if (!(this.fullscreen || this.centered)) {
				this.$el.style.left = mousePosition.pos.x + 'px';
				this.$el.style.top = mousePosition.pos.y + 'px';
			}
		},


		/**
		 * init method: register a listener for escape key. Close this (floating) 
		 * dialog when escape is hit. 
		 *
		 * to be improved:
		 * - dont close when you are in an input / textarea.
		 * - select from visible/active/closable dialoges and close the most recent(ly used) one.
		 * 
		 */
		registerEscapeListener() {

			// @todo 1 listener per page, last active dialog will be closed.
			var listener = (event) => {
				if (event.which === 27 && this.closable) { 



					// this does the trick of 1 close per escape,
					// but in the wrong order FIFO instead of LIFO.
					// try to fix this with an isLastFlux check.
					
					if (!isLastActiveFlux()) {
						// pass to another handler.
						return;
					}
					event.stopImmediatePropagation();


					this.close();
					document.removeEventListener('keydown', listener);
					event.preventDefault();

					return false;
				}
			};


			var self = this;

			function isLastActiveFlux() {
				// either the last/active and/or closab
				// le.
				var all = document.querySelectorAll('.dialog-container');

				// @todo active...
				return self.$el === all[all.length-1];
			}

			document.addEventListener('keydown', listener)			
		},


		/**
		 * Closes this dialog instance.
		 *
		 * to be improved: the dialog vue container element should be destroyed as well.
		 */
		close() { 
            this.$broadcast('close');
            this.$dispatch('close');
            
			this.$el.remove();
		}
	}
})
},{}],2:[function(require,module,exports){
class DockLayout {
    constructor(rootElement) {
        this.rootElement = rootElement;
        
        this.initializeElements();
        
    }
    
    initializeElements() {
        
        // Run first time.    
        this.recalculateLayout();
        
        // Run it a second time to compensate for layout differences we created.            
        this.recalculateLayout();
    }
    
    recalculateLayout() {
        // console.log("Running recalculate");
            
        var children = [].slice.call(this.rootElement.children);
        
        // if (stretchLastChild?)  .. todo
        
        // remove the last child 
        var lastChild = children.splice(-1,1)[0];
        
        // only children with a dock attribute.
        children = children.filter(child => {
            return child.hasAttribute('dock');
        })
        
        if (!children.length) {
            return;
        }
        
        var remainder = {left:0,right:0,bottom:0,top:0};
        
        
        children.forEach(child => {
            var createFixer = function(attr) {
                return function () {
                    child.style[attr] = remainder[attr];
                }
            };
            var fixLeft = createFixer('left');
            var fixRight = createFixer('right');
            var fixTop = createFixer('top');
            var fixBottom = createFixer('bottom');
            
            var fixHeight = function () { fixTop(); fixBottom(); }
            var fixWidth = function () { fixLeft(); fixRight(); }
            
            
            var dockPosition = child.getAttribute('dock');
            
            child.classList.add('docklayout-child');
            
            var childWidth = child.offsetWidth;
            var childHeight = child.offsetHeight;
            
            switch (dockPosition) {
            case 'left':
                fixLeft();
                fixHeight();
                    
                remainder.left += childWidth;
            break;   
            case 'right':
                
                fixRight();
                fixHeight();
                
                remainder.right += childWidth;     
            break;
            case 'top':
                fixWidth();
                fixTop();
                
                remainder.top += childHeight;
            break;
            case 'bottom':
                fixWidth();
                fixBottom();
                
                remainder.bottom += childHeight;
            break;
            }                
        });
        
        
        // Last child is just an absolutely position in the center..
        // It might have performace impacts (absolutely positioned vs document scroll..)
        // but its the most simplest and robust method of laying out.
        lastChild.classList.add('docklayout-child');
        lastChild.classList.add('docklayout-content');
        lastChild.style.left   = remainder.left;
        lastChild.style.right  = remainder.right;
        lastChild.style.top    = remainder.top;
        lastChild.style.bottom = remainder.bottom;
            
            
        
        // Trial: Last child has margins, 
        // lastChild.style.marginLeft = remainder.left;
        // lastChild.style.marginRight = remainder.right;
        // lastChild.style.marginTop = remainder.top;
        // lastChild.style.marginBottom = remainder.bottom;
                             
    }
}


// Vue docklayout component
// A simple wrapper around DockLayout.
// is this a side-effect or not?
Vue.component('docklayout', {
    name: 'docklayout',
    props: ['width', 'height','dynamic'],
    
    template: `<div class="docklayout">
        <slot />
    </div>`,
    
    // Do this on ready, so the elements have dimensions.
    ready() {
  
        // @todo Question: DockLayout auto recaculate, on or off by default?
  
        if (this.dynamic && (''+this.dynamic).match(/(off|false|disabled)/)) {
            this.dynamic = false;
        }
              
        if (this.dynamic !== false) {
            var timeout;  
            // Click is usually an event that'll trigger some form of change.
            this.$el.addEventListener('click', this.recalculate.bind(true));
            
            var runDebounced = () => {
                timeout && clearTimeout(timeout);
                
                timeout = setTimeout(() => {
                    this.recalculate();
                },10);                 
            }
            // This event gets fired a lot.
            this.$el.addEventListener('DOMSubtreeModified', runDebounced);
            window.addEventListener('resize', runDebounced);
            this.cleanups = this.cleanups || [];
            this.cleanups.push(() => {
                window.removeEventListener('resize', runDebounced);
            })
        }
        
        if (this.width || this.height) {
            this.$el.style.position = 'relative';
            
            if (this.width) {
                this.$el.style.width = this.width;
            }
            if (this.height) {
                this.$el.style.height = this.height;
            }
        } else {
            this.$el.style.position = 'relative';
            this.$el.style.width = '100%';
            this.$el.style.height = '100%';
        }
        
        this.DockLayout = new DockLayout(this.$el);
    },
    beforeDelete() { 
        this.cleanups && this.cleanups.forEach(fn => fn());  
        
    },
    methods: {
        recalculate() {
           this.DockLayout.recalculateLayout();
        }
    }
})


},{}],3:[function(require,module,exports){
/**
 * Require all to be bundlified with
 * 
 * @project <command name="Bundle toolkit components into lib/bundle.js" command="browserify -x jquery -x lodash -x vue lib/index.js &gt; lib/bundle.js"/> 
 */

require('./dialog');
require('./tabindex');
require('./docklayout');

var toastComponent = require('./toast');
toastComponent.exposeAs('toast');


},{"./dialog":1,"./docklayout":2,"./tabindex":4,"./toast":5}],4:[function(require,module,exports){

// Old skool game menu!


var instances = [];

var KEYS = {
    UP:    38,
    DOWN:  40,
    LEFT:  37,
    RIGHT: 39,

    W: 87,
    S: 83,
    A: 65,
    D: 68,

    SPACE: 32,
    ENTER: 13
};

const ACTIVE_CLASS = 'active';

module.exports = {};

// <ANY v-tabindex children=".some-child-selector" />
Vue.directive('tabindex', {
    params: ['children'],
    
    bind() {                
        this.el.addEventListener('DOMNodeInserted', event => {
            // Nodes have been added, give these a tabindex.
            getItems(this).forEach( elem => {
                elem.setAttribute('tabindex', 0);
            })    
        })
        
        getItems(this).forEach( elem => {
           elem.setAttribute('tabindex', 0);
        })
    },
    unbind() {
        let idx = instances.indexOf(this);
        if (idx !== -1) {
            instances.splice(idx,1);
        }
    }
})

document.addEventListener('keydown', keydownListener);

function getActiveInstance() {
    // @todo active dialog or whatever...
    return instances[instances.length-1];
}

function isAllowedTarget(event) {
    var elem = event && event.target;
    var elemName = event && event.target && event.target.nodeName || '';
    if (!elemName) {
        return true;
    }
    
    if (elemName === 'INPUT' || 
        elemName === 'TEXTAREA' || 
        elemName === 'SELECT' ||
        elemName === 'BUTTON'    
    ) {
        return false;
    } 
    return true;
}

function getItems(inst) {
    // primitive but does the job.
    
    if (inst.params.children) {
        return [].slice.call(inst.el.querySelectorAll(inst.params.children));
    }
    
    return [].slice.call(inst.el.children);
}

function executeSelectedItem() {
    
    active = document.activeElement;

    var clickEvent = new MouseEvent('click');

    
    clickEvent.target = active;
    
    active.dispatchEvent(clickEvent);
}


function createItemSelector(direction) {
    return function () {
        
        // select all items with a tabindex.
        let items = [].slice.call(document.body.querySelectorAll('[tabindex]'));
        
        // scroll thru them
        
        if (!document.activeElement || !document.activeElement.getAttribute('tabindex')>'') {
            // select the last or first based on direction.
            
            selectIndex = direction > 0 ? 0 : items.length-1;
            items[selectIndex].focus();            
            
            return;
        }
        
        for (let index in items) {
            let item = items[index];
            if (item === document.activeElement) {
                let selectIndex = (parseInt(index) + items.length + direction) % items.length;
                
                // console.log(`(${index} + ${items.length} + ${direction}) % ${items.length} = ${selectIndex}`);
                // console.log('index + direction = ' + (index+direction));
                
                items[selectIndex].focus();
                
                return;
                // assert that items[selectIndex] === document.activeElement;                
            }
        }
        
        // activeElement was not in our tabindex selection..
        
        return;		
    }
}
let selectNextItem = createItemSelector(1)
let selectPrevItem = createItemSelector(-1);

function keydownListener(event) {
    if (!isAllowedTarget(event)) {
        return;
    }

    switch(event.which) {
        case KEYS.ENTER:
            executeSelectedItem();
        break;
        case KEYS.UP:
            // do up
            
            selectPrevItem();
            event.preventDefault();
        break;
        case KEYS.DOWN: 
            // do down
            
            selectNextItem();
            event.preventDefault();
        break;
    }
}

},{}],5:[function(require,module,exports){


var instances = [];

Vue.component('toast-container', {
	template: `<div class="toast-container">
		<div
			class="toast-message toast-message-{{message.type||'default'}}"
			v-for="message in messages"
		>{{message.message}}</div>
	</div>`,

	ready() {
		instances.push(this);
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
},{}]},{},[3]);
