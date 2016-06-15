

function requireAsync(path) {
    
    console.log("Getting script");
    
    return fetch(path).then(response => {
        return response.text()
    }).then(moduleJs => {
        
        
        // console.log(moduleJs);
        
        
        
        moduleJsFn = new Function('module,exports,require', moduleJs);
        
        /* work in progress... dynamic module resolve.
        moduleJs.match(/\W?require\(.+?\)/g).forEach(function (req) {
            req = req.match(/["'].+?["']/);
            
            console
        })*/
        
        
        var module = {exports:{}};
        
        var requireFn = function (name) {
           console.log("Cannot require asynchronously: " + name);  
        };
        
        // Run it
        moduleJsFn(module, module.exports, requireFn);
        
        // and return the exports:
        return module.exports;        
    })
}

/**
 * Load a partial html and insert it into #example. 
 */
function runExample(path) {
    path = path || location.hash.substr(1) + '.js';
    
    requireAsync(path).then(
        module => {
            
            module.el = '#example';
            new Vue(module);
        },   
        (xhr, error, c) => {
            
            console.log([xhr,error,c]);
            // alert(error);
            
            var example = document.getElementById('example');
            example.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Could not load example \`${path}\`
                </div>
            `;
            
        }
    );
    
}



/**
 * Visual wrapping for a test-suite, decorative purpose only. 
 * 
 * <test-suite name="My test suite">
 *  ... content ...
 * </test-suite>
 */
Vue.component('test-suite', {
    props: ['name'], 
    name: 'test-suite',
    template: `<fieldset>
        <div class="test-suite container">
            <h1>{{name}}</h1>
            <slot />
        </div>
    </fieldset>    
    `    
})

/**
 * Visual wrapping for a test, decorative purpose only.
 * 
 * <test name="My test">
 *    ... content ...
 * </test>
 */
Vue.component('test', {
    props: ['name'], 
    name: 'test-suite',
    template: `<fieldset>
        <div class="test container">
            <h2>{{name}}</h2>
            <slot />
        </div>
    </fieldset>    
    `      
})

/**
 * A line for one assertion. Can by styled with css classes .assertion-ok and .assertion-not-ok
 * 
 * @usage
 * <assertion name="Some assertion" :ok="some_boolean">
 *    [... optional extra content ...]
 * </assertion>
 */
Vue.component('assertion',{
    props: ['name','ok'],
    name: 'assertion',
    template: `
    <div class="row assertion" :class="{'assertion-ok':ok === true, 'assertion-not-ok':ok === false}">
        <div class="col-xs-9">
            {{index}}.
            {{name}}
        </div>
        <div class="col-xs-3">
            {{ok}}
        </div>
        
        <div class="col-xs-12">
            <pre><slot /></pre>
        </div>
    </div>
    `,
    data() {
        // Each assertion gets a unique number (on page).
        if (!window.assertionComponentAssertionCount) {
            window.assertionComponentAssertionCount = 0;
        }
        return {
            // Increment it, starting from 1.
            index: (++window.assertionComponentAssertionCount)
        }
    }    
})

/**
 * Runnable.. the content inside this tag is javascript runnable (with eval).
 * The expression as well as the expression results are logged to the browser
 * developer console.
 * 
 * CSS classes: .runnable and .runnable-disabled 
 * 
 * <runnable [:then="callbackWhenClicked"]>RUNNABLE_JAVASCRIPT_CONTENT</runnable>
 * 
 * @usage
 * <pre>
 * Code examples:
 * 
 * // Javascript alert:
 * <runnable>alert("Hoi");</runnable>
 * 
 * // Supply an additional click callback. 
 * // Handy: if you use global variables they're also available for interaction inside the console.
 * // The callback function will receive the result of the expression as first argument.
 * <runnable :then="userClickedThisExpression">MyGlobalVar = 1+5;</runnable>
 * 
 * </pre>
 */
Vue.component('runnable', {
    props: ['then'], 
    name: 'runnable',
    template: `
        <a class="runnable" href="javascript:;" @click="click()"><slot /></a>
    `,
    methods: {
        click() {
            var code   = this.$el.innerHTML;
            var result = eval(this.$el.innerHTML);
            
            console.log("Evaluating " + this.$el.innerHTML);
            
            console.log(result);
            
            if (this.then) {
                this.then(result);
            }
        }
    }
})
