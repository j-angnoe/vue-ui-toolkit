
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
