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
        lastChild.style.left   = remainder.left + 'px';
        lastChild.style.right  = remainder.right + 'px';
        lastChild.style.top    = remainder.top + 'px';
        lastChild.style.bottom = remainder.bottom + 'px';
            
            
        
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

    mounted() {
        this.init()
    },
    ready() {
        this.init()
    },
    // Do this on ready, so the elements have dimensions.
    beforeDelete() { 
        this.cleanups && this.cleanups.forEach(fn => fn());  
    },
    methods: {
        recalculate() {
           this.DockLayout.recalculateLayout();
        },
        init() {
      
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
    }
})

