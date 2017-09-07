const fs = require('fs');
const path = require("path");
const packageJSON = require("../package.json");
const isDev = (process.env.NODE_ENV === 'development');
console.log(process.env.NODE_ENV,isDev);

var outPath = path.resolve(process.cwd(), isDev?"build":"dist");
var fileName = `${outPath}\\manifest.json`;

var url_matches = ["https://tw.carousell.com/*"];
var scriptsDir = "js";
var scriptsModule = [`/${scriptsDir}/vendor.js`, `/${scriptsDir}/common.js`];

//extension i18n
var i18n = {
  name:"__MSG_appName__",
  description:"__MSG_appDescription__",
  version_name:"__MSG_versionName__"
}

var manifest = {
  "manifest_version": 2,
  "name": `${i18n.name}<${i18n.version_name}>`,
  "version": packageJSON.version,
  "default_locale": "en",
  "description": i18n.description,
  "homepage_url": "https://github.com/ShenTengTu/chrome-carouseller-help-tool",
  "author": packageJSON.author,
  "permissions": ["activeTab"].concat(url_matches), //permission for background page
  "icons": {
    "16": "img/icon16.png",
    "48": "img/icon48.png",
    "128": "img/icon128.png"
  },
  "background": {
    "scripts": scriptsModule.concat(`/${scriptsDir}/background.js`),
    "persistent": false
  },
  /*"options_ui": {
    "page": "options.html",
    "chrome_style": false,
    "open_in_tab": true
  },*/
  "content_scripts": [{
    "matches": url_matches, //execute content script if match
    "css": ["css/content.css"],
    "js": scriptsModule.concat(`/${scriptsDir}/content.js`),
    "runAt": "document_end"
  }],
  "short_name": packageJSON.name,
  "version_name": packageJSON.version,
  "content_security_policy": "script-src 'self'; object-src 'self'",
  //"web_accessible_resources": [] //enable access permission from web resources for content script
}

if(!fs.existsSync(outPath)){
  fs.mkdirSync(outPath);
}

var stream = fs.createWriteStream(fileName);
stream.on("error",(e)=>{console.log(e)});
stream.end(JSON.stringify(manifest, null, "  "), "utf8", () => {
  console.log(`[done] ${fileName}`);
});
