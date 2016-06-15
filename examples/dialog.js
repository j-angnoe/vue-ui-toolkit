
var assertionCount = 0;

module.exports = {
    
    template: `    
    <test-suite name="Dialog tests and examples">
    
        <test name="Prerequisites">
            <assertion name="../lib/dialog.js properly loaded; window.dialog exists?" :ok="dialog_exists"></assertion>
        </test>
        
        
        <test name="Basics - opening / closing">
            <pre>
js: 

// Open a popup with dialog.launch.
// dialog.launch(string | vueObject) returns a DialogInstance;

// method 1: simple 
<runnable :then="test1DialogLaunched">myDialog = dialog.launch("This content");</runnable>

// When you've opened a dialog: 
<span :class="{'codeblock-disabled': !test1.myDialog}">
    // Custom set a title
    <runnable>myDialog.title = "Set some title"</runnable>
    
    // Toggle closability.
    <runnable>myDialog.closable = !myDialog.closable;</runnable>
    
    // Hook to dialog events, like close.
    myDialog.$on('close', function () {
        // it is closing.
    })
    
    // Close an instance with code.
    <runnable>myDialog.close();</runnable>

</span>


// method 2: more complex dialog:

<runnable :then="test1DialogLaunched">
myDialog = dialog.launch({
    title: 'My title',
    closable: true,
    width: 200,
    height: 200,
    // fullscreen: true,
    // fullscreen: false,
    // fullscreen: {left?,right?,top?,bottom?,width?,height?}
    
    // Set component to any legal Vue Component definition.
    component: {
        template: \`
            <div>My value = \\{\\{my_value\\}\\} </div>
        \`,
        data() {
            return {
                my_value: 1+3
            }
        }
    }
})
</runnable>
            
            </pre>
            <assertion name="Dialog was created" :ok="test1.clicked">
            </assertion>
            <assertion name="dialog styles are loaded?" :ok="styles_loaded"></assertion>
            <assertion name="When its open, try to close it by hitting ESC, or clicking the little cross." :ok="test1.closed">
            </assertion>
            
        </test>
        
        <test name="Fullscreen features">
            <pre>


// Test fullscreen dialog:
<runnable>dialog.launch({
    title: 'Fullscreen test 1', 
    fullscreen:true, 
    component: { template: 'ESC or x to close'}
})</runnable>
// The entire screen is covered by our new dialog.


// Fullscreen, with half the dimensions.
<runnable>dialog.launch({
    title: 'Right Half of screen test 1', 
    fullscreen:{
        width: '50%',
        left: '50%',
    }, 
    component: { template: 'ESC or x to close'}
})</runnable>     
// Expect the right half of the screen, from top to bottom, to be covered by our dialog.

// Test centered feature:   
<runnable>dialog.launch({
    title: 'Half screen test 1', 
    centered: true, 
    width: 400,
    height: 400,
    component: { template: 'ESC or x to close'}
})</runnable>    
// Expect to see a 400x400 dialog to be opened at the center of the screen, regardless of scroll position.
</pre>
            
        
        
                    
        
    </test-suite>


                
    <style>
    .test a {
        color: blue;
        text-decoration: none;
        cursor: pointer;
    }
    .assertion-ok {
        color: green;        
    }
    .assertion-not-ok {
        color: red;
    }
    .codeblock-disabled, .test .codeblock-disabled * {
        color: #999;
        background: #ddd;
        cursor: not-allowed;
    }
    </style>
    `,
    data() {
        return {
            num: 0,
            styles_loaded:null,
            test1: {
                myDialog: null,
                clicked: null,
                closed: null
            }
        }
    },
    computed: {        
        dialog_exists() { return !!(window && window.dialog && window.dialog.launch) },   
    },
    methods: {
        test1DialogLaunched(dialog) {
            this.test1.clicked = true;
            this.test1.myDialog = dialog;
             
             // Check if it has been styled correctly.
            setTimeout(() => {
                var dialogContainer = document.querySelector('.dialog-container');
                var style = window.getComputedStyle(dialogContainer);
                var position = style.getPropertyValue('position').toLowerCase();
                
                this.styles_loaded = !!position.match(/(absolute|fixed)/); 
                    
            },250)
            
            dialog.$on('close', event => {
                this.test1.closed = true;  
                this.test1.myDialog = null;
            })
        }
    }
}