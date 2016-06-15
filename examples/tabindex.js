

module.exports = {
   
   template: `
   <test-suite name="Tabindex">
    <test name="Basics">

        Active item should be orange: <span class="active">Test active item</span>
        
        <p>Immediately on entering the document, the first key UP or key DOWN should 
            focus the first arrow-select element. It should work the same as TABBING
            thru the document (items with tabindex). You can use UP/DOWN as aliases
            for TAB/Shift+Tab, except that UP/DOWN keeps focus inside this document, 
            and TABBING not.
        </p>
        <h3>Start with some list and add a \`v-tabindex\` attribute</h3>
         
        <ul v-tabindex children="li.item">
            <li class="item" @click="Click1()">Item 1</li>
            <li class="item" @click="Click2()">Item 2</li>
            <li class="item" @click="Click3('parent')">Item 3
                <ul>
                    <li @click="Click3('3.1')" class="item">Item 3.1</li>
                    <li @click="Click3('3.2')" class="item">Item 3.2</li>
                    <li @click="Click3('3.3')" class="item">Item 3.3</li>
                </ul>
            </li>
            
            <!-- These nodes should not be arrow-selectable -->
            <li>
                <hr>
            </li>
            <li class="summary">Last clicked: {{clicked_on}}</li>             
        </ul>
        
        <p>
            Try UP and DOWN arrows, notice that it wraps at the beginning and ending.
            Try hitting ENTER to \'click\' on an item.
            <br><br>
            We can add a children="[css selector]" attribute to limit the number of 
            children that are included.
        </p>
        
    
        <h3>Multiple tabindex items, collaborate</h3>
        
        <ul v-tabindex children="li.item">
        
            <li 
            v-for="item in dynamicItems" 
            track-by="$index" 
            class="item" 
            @click="ClickDynamicItem(item)">{{item}}</li>
        </ul>    
        
        <a @click="addDynamicItems()">Add more items to list</a>
        
        <div>Clicked on: {{clicked_on}}</div>
        
        
        <h3>Feature checklist</h3>
        
        <ol>
            <li tabindex=0>Works with [tabindex] and :focus</li>
            <li>UP == Shift-Tab, DOWN == Tab </li>
            <li tabindex=0>ENTER === clickEvent</li>
            <li>Watches DOMNodeInserted for dynamically added nodes</li>
            <li>Works on nested lists</li>
            <li>By setting document.activeElement focus/scroll is also covered.</li>
        </ol>
        
        
        
        <h3>Examples</h3>
        
        <textarea style="width:100%;height:200px;">
// Using tabindex directive
<ul v-tabindex [children=".items"]>
    <li>...</li>
    <li>...</li>
</ul>

// Or.. even better, just use tabindex on the child items.
<ul>
    <li tabindex="0">..</li>
    <li tabindex="0">..</li>
</ul>

        </textarea>
    </test>
    
    <h3>Styling</h3>
    
    
    <textarea style="width:100%;height:100px;">
<style>
    .active {
        background: orange;
    }
    [tabindex]:focus, :active { 
        background: orange;
        outline: 0;
    }
</style>
    </textarea>
   
   </test-suite>
        <style>
        .active {
            background: orange;
        }
        [tabindex]:focus, :active { 
            background: orange;
            outline: 0;
        }
        </style>   
   `,
   data() {
       return {
           clicked_on: null,
           dynamicItems: [
               'one',
               'two',
               'three'
           ]
       }
   },
   
   methods: {
       Click1() {
           this.clicked_on = 1;
           alert("Click on 1");
       },
       Click2() {
           this.clicked_on = 2;
           alert("Click on 2");
       },
       Click3(subunit) {
           this.clicked_on = subunit;
           alert("Click on " + subunit);
       },
       ClickDynamicItem(item) {
           this.clicked_on = item;
       },
       addDynamicItems() {
           this.dynamicItems.push('four');
           this.dynamicItems.push('five');
           this.dynamicItems.push('six');
       }
   } 
    
    
}