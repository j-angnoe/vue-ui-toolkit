window.showToastContainer = function () {
    var toastContainer = document.querySelector('.toast-container');
    toastContainer.style.border = '3px solid red';
    toastContainer.style.padding = '10px';

    // Reset the style
    setTimeout(function(){
        toastContainer.style.border='';
        toastContainer.style.padding='';
    },2000)    
} 

module.exports = {
    template: `
    <div>
        <!-- use this component: -->
        <toast-container></toast-container>
        
        
        <test-suite name="Toast demonstration">
            <p>
                A Toast is a non modal, unobtrusive window element used to display brief, auto-expiring windows of information to a user. Android OS makes relatively heavy use of them. 
                (<a target="_blank" href="http://ux.stackexchange.com/questions/11998/what-is-a-toast-notification">source</a>)
            </p>
            <test name="Toast UI">
            
                <assertion name="window.toast is available?" :ok="toast_available"></assertion>

<pre>
# Code samples:
#
# Inside your layout you must include &lt;toast-container /&gt;
# You can style this with .toast-container

# I'll show you where it is (upper right corner)
<runnable>showToastContainer();</runnable>


# To set this up, one needs to include lib/toast.js and expose this to some 
# window variable. in our example we did this:
var ToastComponent = require('./lib/toast')
ToastComponent.exposeAs('toast');

# Now we can do things like this:
<runnable>toast('Hello world (success)', 'success')</runnable>
<runnable>toast('Hello world (error)', 'error')</runnable>
<runnable>toast('Hello world')</runnable> 

# Style this by setting .toast-message-success .toast-message-error and .toast-message-default

# By default, toast messages will expire after 1 second.
# successive toast message with the same content/type will be filtered out, try 
# clicking on the same toast message a few times:
<runnable>
toast('one'); toast('one'); toast('two'); toast('two');
</runnable>

</pre>                
                
              
            </test>
        
        </test-suite>
    </div>
    `,
    data() {
        return {
            toast_available: ('toast' in window)
        }
    },
    methods: {
        toast: toast
    }
    
}