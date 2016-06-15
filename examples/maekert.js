/**
 * Todos voor later:
 * 
 * - Maak is zo'n interface zoals jupyter - fixed header, menubar, buttonbar, content 
 * - gridlayout for jsfiddle achtige setup met 4 text editors
 * - CodeMirror editor integrereren
 * - Styles toeveogen
 * - Page definieren met tags (tag-boom, ook met onbestaande tags).
 * 
 */

"use strict";

class Storage {    
    constructor(source) {
        this.source = source;           
    }
    get(key, defaultValue) {
        try {
            if (this.exists(key)) {
                return JSON.parse(this.source[key]);
            } 
            return defaultValue;
         } catch (e) {
            return false;
         }        
    }
    
    set(key, value) {
         try { 
            this.source[key] = JSON.stringify(value);
         } catch (exception) {
            console.error("Error writing to storage: " + key + " " + value);
         }        
    }
    
    exists (key) {
         return key in this.source;
    }
    
    delete(key) {
        try { 
            delete this.source[key];
        } catch (ignore) {
            
        }
    }
    clear() {
        if (this.source.clear) {
            this.source.clear();
        } else {
            this.source = {};
        }
    }
}

var localStorage = new Storage(window.localStorage);
var sessionStorage = new Storage(window.sessionStorage);


var store = sessionStorage;



/**
 * @usage
 * 
 * component = {
 *  data: store.id('myuniqueid', {
 *      // default data.
 *  })
 * }
 * 
 * @usage 2
 * component = {
 *  data: store.id(function (inst) {
 *      // this is component this.
 *      // dont use () => { } here, because this will be pointing to window.
 *      return 'myprefix-' + randomId();
 *  }, {
 *      // default data.
 *  })
 * }
 */
store.data = function (id, data) {
    
    return function () {
        var my_id;
        
        if (typeof id === 'function') {
            my_id = id.call(this,this);
        } else if (typeof id !== 'string' && id.name) {
            my_id = id.name;
        } else {
            my_id = id;
        }
        
        var stored = store.get(my_id, data);
        var res = {};
        
        for (let key in data) {
            res[key] = stored[key] || data[key] || this[key]
        }
        
        // If the state data is changed, the storage must be 
        // updated, so next time you load the page state is kept.
        setTimeout(() => {
            
            // console.log(this, "THIS NOW ");
           
            for (let key in data) {
                this.$watch(""+key, (value) => {
                    this.saveState();
                },{ deep: true })        
            }
            
            var timeout;
            this.saveState = function () {
                timeout && clearTimeout(timeout);
                
                // Small debounce to prevent frequent serializes.
                timeout = setTimeout(() => {
                     console.log("Saving state `" + my_id + "`");
                    
                    var stored = {};
                    for (let key in data) {
                        stored[key] = this[key];
                    }
                    
                    store.set(my_id, stored);
                    // console.log("Updating " + key);                
                },250)
            }
            this.resetState = function () {
                store.set(my_id, {});
                for (let key in data) {
                    this.$set(key, data[key]);
                }
            }
        }, 25)    
        
        // console.log(JSON.stringify(res), "RES IS NOW");    
        return res;
    }
        
}








var GettingStarted = {
    template: `<pre>
Getting started    
    </pre>`
} 

var Field = {
    props: ['label','value','type','options','style'],
    computed: {
        inputTypeText() {
            return !this.type || !this.type.match(/(select|text(area)?|radio|checkbox)/);      
        }
    },
    template: `
    <div class="form-group">
        <label v-if="label">
            {{label}}
        </label>
        <slot>
            <!-- default slot content -->
            <select 
            tabindex="0"
                v-if="type === 'select'"
                :style="style" class="form-control"  
                v-model="value"
            >   
                <option v-for="(optionIndex, optionValue) in options" :value="optionIndex">{{optionValue}}</option>
            </select>
            
            <textarea 
            tabindex="0"
                v-if="type === 'textarea'"
                :style="style" 
                class="form-control"  
                v-model="value"
            ></textarea>
                        
            <input
                tabindex="0"
                v-if="type !== 'select' && type !== 'textarea'"  
                type="{{type}}" 
                v-model="value" 
                class="form-control"
            >
            
            
        </slot>
    </div>
    `
}

var FieldTest = {
    template: `<form> 
    
        <field label="Hoe is het?" :value.sync="myfield"></field>
        Value = {{myfield}}
        <field label="Hoe is het?" type="textarea" :value.sync="myfield2"></field>
        Value = {{myfield2}}
        
        <field label="Awesome" type="select" :value.sync="myfield3" :options="['een','twee','drie']"></field>
        Value = {{myfield3}}
    
    </form>`,    
    components: {
        field: Field
    }
    
}

class Tag {
    constructor(tagData) {
        
        this.name = tagData.name;
        
        if (!this.name.match(/^[a-z\-0-9]+$/)) {
            throw new Error("Tagname may only contain a-z, - and 0-9.");
        }
        this.template = tagData.template;
        
        var codeObj = eval("[{" + tagData.code + "}]")[0];
        
        
        // Ugly way of loading the tags.
        var data = store.get('MaekertMain');
        this.components = {};
        
        data.tags.forEach(tag => {
            this.components[tag.name] = tag;
        })
        
        Object.assign(this, codeObj);
    }
}
function exportTag(tagData) {
    let {name,template,code} = tagData;
    
    return `
Vue.component('${name}', {
    name: '${name}',
    template: \`
        ${template}
    \`,
    ${code || ''}
})

   
    `
    
}
var TagEditor = {
    props: {
        id: {},
        tag: {
            type: Object,
            default: {}
        },
        onSave: {
            type: Function
        }
    },
    
    data: store.data( function () {
        return 'TagEditor-' + (this.id || 'new');
    }, {
        tabs: false, 
        activeTab: '',
        form: {
            name: '',
            template: '',
            code: ''
        }
    }),
    
    ready() {
        if (this.tag) {    
            Object.assign(this.form, this.tag);
        }          
    },
    template: `<form @submit.stop="save(form)" class="tag-editor"> 
        ID = {{id}}
        <field label="Tagname (kebab-case)" :value.sync="form.name"></field>
        
        <div>
            Stacked <toggle :value.sync="tabs"></toggle> Tabbed
        </div>
        
        <style>
        .tag-editor textarea {
            height: 400px;
        }
        </style>
                    
        <div v-if="!tabs">

            <field label="Template (html)"   type="textarea"    :value.sync="form.template"></field>
            <field label="Code (javascript) return {" type="textarea"   :value.sync="form.code"></field>
            };


        </div>
        <div v-if="tabs">
            <a @click="activeTab='template'">Template</a>
            <a @click="activeTab='code'">Code</a>
            
            <field v-if="!activeTab || activeTab=='template'" label="Template (html)"   type="textarea"    :value.sync="form.template"></field>
            <field v-if="activeTab=='code'" label="Code (javascript) return {" type="textarea"   :value.sync="form.code"></field>
            };
        </div>

        
        <input type="submit">
        <a class="btn btn-success" @click="showPreview(form)">Preview</a>
    </form>`,
    methods: {
        save(tag) {
            // Assuming this throws errors.
            this.showPreview(tag);
            
            // only call onSave callback when ready.
            this.onSave && this.onSave(tag);
            
        },
        showPreview(tag) {
            try  {
                var theTag = new Tag(tag);
                dialog.launch({
                    title: 'Try it out',
                    fullscreen: {
                        right: 0,
                        left: '50%',
                        width: '50%',
                        top: 0,
                        bottom: 0
                    },
                    component: {
                        template: `
                            <docklayout>
                                <div dock="bottom" height="300px">
                                    <textarea 
                                        v-model="export" 
                                        style="width:100%;height:300px;" 
                                        onclick="this.select()">    
                                    </textarea>
                                </div>
                                <div>
                                    <inner />
                                </div>
                            </docklayout>
                        `,
                        data() {
                            return {
                                export: exportTag(tag)
                            }
                        },
                        components: {
                            inner: theTag  
                        }
                    }
                })    
            } catch (error) {
                alert("Invalid: " + error)
                throw error;
            }
        }
    },
    components: {
        field: Field
    }
}

var NewPage = {
    template: 'New page'
}


var exportApp = {
    props: ['tags','pages'],
    
    template: `
<docklayout>
    <div dock="top">
        <a class="btn btn-default" type="download()">Download</a>
    </div>    
    <div>
        <div v-for="tag in tags">
            <h3>{{tag.name}}</h3>
            
            <pre>
{{exportTag(tag)}}
</pre>
            
        </div>
    </div>
</docklayout>
    `,
    
    methods: {
        exportTag(tag) {
            return exportTag(tag);
        }
    }
}

var Main = {
    data: store.data('MaekertMain', {
        component: 'GettingStarted',
        componentParam: '',
        tags: [
            {
                name: 'tag-one'
            }
        ],
        pages: []
    }),
    
    template: `
    <div class="main">
<docklayout>
    <div dock="left">
        <div>
            <div>Tags</div>
            <ul class="list-group">
                <li v-for="tag in tags" tabindex=0 class="list-group-item" @click="selectTag(tag)">{{tag.name}}</li>
            </ul>      
            <a @click="newTag()" tabindex="0">New tag</a>  
        </div>
        <div>
            <div>Pages</div>
            <ul class="list-group">
                <li v-for="p in pages" tabindex=0 class="list-group-item" @click="selectPage(p)">{{page.name}}</li>
            </ul>    
            <a @click="newPage()" tabindex=0>New page</a>
        </div>
        
        <a @click="setComponent('exportApp')" tabindex=0>Export app</a>
    </div>
    
    <div>
        <div 
            v-for="g in [[component,componentParam]]"
            :is="component" 
            :param="componentParam" 
            :tags.sync="tags" 
            :pages.sync="pages"
            :save-tag="saveTag"
        ></div>    
        
    </div>
    
</docklayout>      
    
<style>
.docklayout [dock=left] {
    padding-right: 20px;
}
.docklayout [dock=right] {
    padding-left: 20px;
}
.docklayout [dock=top] {
    padding-bottom: 20px;
}
.docklayout [dock=bottom] {
    padding-top: 20px;
}
.main > .docklayout > .docklayout-child {
    padding: 20px;
}
</style>  
    </div>  
    `,
    
    
    components: {
        GettingStarted,
        hoi: {
            template: '<div>Dit is hoi component</div>'
        },
        NewTag: {
            props: ['tags','saveTag'],
            template: 'New tag <tag-editor :on-save="saveTag"></tag-editor>',
            components: {TagEditor}
        },
        EditTag: {
            props: ['tags','param','saveTag'],
            template: '<tag-editor :id="param.name" :tag="param" :on-save="saveTag"></tag-editor>',
            components: {TagEditor}            
            
        },
        NewPage,
        exportApp
        
    },
    
    methods: {
        setComponent(component, param) {
            this.component = component;
            this.componentParam = param;
        },
        newTag() {
            this.setComponent('NewTag');
        },
        newPage() {
            this.setComponent('NewPage');
        },
        selectTag(tag) {
            this.setComponent('EditTag', tag);
        },
        saveTag(newTag) {
            // is unique?     
                   
            var foundTag;
            
            this.tags.forEach(tag => {
                if (tag.name === newTag.name) {
                    foundTag = tag;
                }
            })
            
            // only valid tags may be added.
            var theTag = new Tag(newTag); // will throw if invalid.
            
            if (foundTag) {
                Object.assign(foundTag, newTag);
            } else { 
                // Ready to go:
                this.tags.push(newTag);
            }       
            
        }        
    }
    
}

module.exports = Main;



Vue.component('toggle', {
    name: 'toggle',
    template: `
        <i @click="value = !value" class="fa fa-toggle-{{value ? 'on' : 'off'}}"></i>
    `,
    props: ['value'],

}) 

   
    