/**
 * Require all to be bundlified with
 * 
 * @project <command name="Bundle toolkit components into lib/bundle.js" command="browserify -x jquery -x lodash -x vue lib/index.js &gt; lib/bundle.js"/> 
 */

require('./dialog');
require('./tabindex');
require('./docklayout');

var toastComponent = require('./toast');
toastComponent.exposeAs('toast');

