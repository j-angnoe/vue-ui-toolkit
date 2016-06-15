
// neem de layouts van NativeScript:

var Page = {
    name: 'Page',
    template: `<div class="vui-page">
        <slot />
    </div>`
}

var Style = `
.vui-page {
    position:fixed;
    border: 3px solid white;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
    background: white;
}
`


module.exports = {
    data() {
        return {
            showLeft1: true,
            topItems: [],
            
            showOrderExamples: false,
            
            showPage1: false,
            showPage2: false,
            showPage3: false,
            
            
            page1ShowSidemenu: false,
            
        }
    },
    template: `
 
    <style>
    /* make the docklayout-children more visible */
    
    .docklayout-child { 
        padding: 20px;
        border: 1px solid white;
        border-bottom: 1px dotted black;
        border-right: 1px dotted black;
    }
    </style>
    
      
    <test-suite name="Vui Layouts" v-if="!showPage1 && !showPage2 && !showPage3">
    
        <test name="DockLayout">
        
            <div style="white-space: pre-line">
                First tryout:<br>
                &bull; a docklayout with dock=left,right,top,bottom
                &bull; the order of the elements is important. 
                &bull; Last child is always stretched.
                
                <a @click="showOrderExamples=!showOrderExamples">Show order Examples.</a> 
                
                <div v-if="showOrderExamples" style="padding:20px;position:absolute;width:300px;height:500px;background:white;border:1px solid black;z-index:1000;">
                    <h3>Order is important, notice the difference</h3>
                    Left, top and center
                    <docklayout width="200" height="200">
                        <div dock="left" style="background:red;">LEFT</div>
                        <div dock="top" style="background:red;">TOP</div>
                        <div>CENTER</div>
                    </docklayout>
                    
                    Top, left and center.
                    <docklayout width="200" height="200">
                        <div dock="top" style="background:red;">TOP</div>
                        <div dock="left" style="background:red;">LEFT</div>
                        <div>CENTER</div>
                    </docklayout>
                </div>
            </div>
            
            <div>An example with some interactivity</div>
            <docklayout stretchLastChild="true" width="500" height="400">
                <div dock="left"   style="xbackground:red;" v-show="showLeft1">
                    LEFT
                    <a href="javascript:;" @click="showLeft1=!showLeft1">Show/hide</a>
                </div>
                <div dock="right"  style="background:green;">RIGHT</div>
                <div dock="bottom" style="background:blue;">BOTTOM</div>
                <div dock="top"    style="background:orange;">
                    TOP
                    
                    <a href="javascript:;" v-if="topItems.length<3" @click="topItems.push('more');">Add more items</a>
                    <div v-if="topItems.length>=3">We'll get into layout troubles if this element gets too long..</div>
                    Items: {{topItems.length}}
                    <div v-for="t in topItems" track-by="$index">{{t}}</div>
                </div>
                
                <div dock="top"    style="background:orange;">TOP2</div>
                <div dock="bottom" style="background:blue;">BOTTOM2</div>
                <div dock="right"  style="background:green;">RIGHT2</div>
                <div dock="left"   style="background:red;">LEFT2</div>
                
                
                <div style="background:grey;">CENTER
                        <a v-if="!showLeft1" href="javascript:;" @click="showLeft1=true">Show left again</a>
                </div>
            </docklayout>
            
            <div>
            &bull; By default a docklayout will watch DOMSubtreeModified and click events to recalculate the layout.
            This is potentially expensive, disable this with a dynamic="false" attribute. 
            <br>
            </div>
            
            
            <h3>Testing with custom widths</h3>
            
                    <docklayout width="500" height="200">
                        <div dock="left" style="background:red;width:200px;">LEFT width</div>
                        <div dock="top" style="background:red;height:50px;">TOP</div>
                        <div>CENTER</div>
                    </docklayout>            
            
            <h3>Testing with greedy absolute</h3>
                       
            <a @click="showPage1 = !showPage1" href="javascript:;">Toggle page</a>

        </test>
        
        
        
    </test-suite>

    <style>
    .sample-nav-menu > li {
        float: left;
    }
    .sample-nav-menu ul {
        display: none;
        position: absolute;
        border: 1px solid black;
        background: white;
        z-index:200;
    }
    .sample-nav-menu li:hover > ul {
        display: block;
    }
    </style>       
    
    <Page v-if="showPage1">
     
        <docklayout>
            <div dock="left" v-if="page1ShowSidemenu" style="width:25%;">
                Sidemenu 25% width
                togglable.
            </div>
            
            <div dock="top" style="overflow:visible;">
                <a @click="page1ShowSidemenu = !page1ShowSidemenu" href="javascript:;">[Sidemenu]</a>
                <ul class="sample-nav-menu">
                    <li>
                        Menu
                        <ul>
                            <li>Sub 1</li>
                            <li>Sub 2</li>
                            <li>Sub 3</li>
                        </ul>
                    </li> 
                    <li>
                        Menu 2
                        <ul>
                            <li>Sub 1</li>
                            <li>Sub 2</li>
                            <li>Sub 3</li>
                        </ul>
                    </li>
                </ul>
                
                Topmenu navigation
                Overflow should be possible:
                

            </div>
            
            <div dock="bottom">
                Some footer &copy; 2016 LOL!
            </div>
            
            <div style="line-height:40px;white-space:pre-line;">
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
                Content
            </div>
        </docklayout>
    </Page> 
        
    <style>
    ${Style}       
    </style>
    `,
        
    components: {
       Page
    } 
}