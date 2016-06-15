delMenubar = {
    template: `<div class="clearfix">
 <ul class="nav navbar-nav">
    <li class="dropdown data-toggle="dropdown">
        <a>Menu</a>
        <ul class="dropdown-menu">
            <li>Optie 1</li>
            <li>Optie 2</li>
        </ul>    
    </li>
    <li><a>Menu</a></li>
    <li><a>Menu</a></li>
    <li><a>Menu</a></li>
 </ul>     
 </div>
    `,
    
}

delToolbar = {
    template: `<div class="toolbar">
<div class="btn-group">
    <div class="btn btn-default btn-sm"><i class="fa fa-home"></i></div>
</div>    
</div>
    `
}

delEditor = {
    template: `<section class="editor">
    <div class="container">
        
        <pre>Document</pre>
        <pre>Document</pre>
    </div>    
</section>
    `
}

module.exports = {
    template: `
<docklayout>
    <header dock="top">
        <div class="logo brand">
            <div class="container">
                My awesome document editor
            </div>
        </div>
            
        <div class="container">
            
            <del-menubar></del-menubar>
            <del-toolbar></del-toolbar>
        </div>
    </header>
    
    <del-editor></del-editor>
</docklayout>    
<style>
body {
    background: #eee;
}
header {
    background: white;
    box-shadow: 0 5px 5px #ccc;
    border-bottom: 1px solid #aaa;
    z-index:101;
}
header .logo {
    border-bottom: 1px solid #ddd;
}
header .navbar-nav {
    background: #eee;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 0px 0px 5px 5px;
}
header .navbar-nav a {
    padding: 8px;
    color: #666;
}
header .toolbar {
    margin: 4px 0px;
}
section.editor .container {
    margin-top: 30px;
    margin-bottom: 30px;
    padding-top: 20px;
    padding-bottom:20px;
    background: white;
    box-shadow: 0 0 3px #aaa;
    height: 2000px;
}
</style>
    `,
    components: {
        delMenubar,
        delToolbar,
        delEditor
    }
}