
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
			{{{title}}}
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

    mounted() {
        this.init()
    },
    ready() {
        this.init()
    },

	

	methods: {
		init() {
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