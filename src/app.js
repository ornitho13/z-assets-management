/**
assets management
**/
var zam;
var http = require('http');
var fs = require('fs');
var url = require('url');
var config;
var uglify = require('uglify-js');
var regExpRequire = new RegExp("require '(.*)';", 'gm');

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

function getContentRecursive(file, currentAssetType, currentPackage, path) {
  //console.log(' -- ' + file);
  content = '/** ' + path + file + ' **/' + "\n";
  try {
    fs.accessSync(path + file, fs.F_OK);
    //match require
    var partialContent = fs.readFileSync(path + file).toString();
    var matches = partialContent.match(regExpRequire);
    //var matches = regExpRequire.exec(partialContent);
    if (matches && matches.length > 0) {
      matches.forEach(function(match, index, array) {
        fileRequire = match.replace("require '", '').replace("';", '');
        var contentRecursive = getContentRecursive(fileRequire, currentAssetType, currentPackage, path);
        partialContent = partialContent.replace(match, contentRecursive);
      });
    }
    return partialContent;
  } catch (err) {
    console.error(err);
    content += "/** missing file : " + path + file + " **/\n";
  }
  return content;
}

//get main configuration
var configFile = "../configuration/configuration.json";
fs.access(configFile, fs.F_OK, function(err) {
  if (err) {
    console.error('[zam-error:config-file] ' + err);
  } else {
    config = require(configFile);
    if (!isEmptyObject(config)) {
      //start the web server
      console.log('[zam-info] starting the server');
      http.createServer(function(req, res){
        // parse url to get the right package
        console.log('[zam-info] parse the url');
        var urlConf = url.parse(req.url);
        var regExpDomain;

        Array.prototype.forEach.call(config.domains, function(domain){
          regExpDomain = new RegExp(domain.label);
          //verify domain exists in url
          if (regExpDomain.test(urlConf.pathname)) {
            var splitPathname = urlConf.pathname.split('/');
            var currentDomain = splitPathname[2];
            var currentAssetType = splitPathname[3];
            var currentPackage = splitPathname[4];

            currentPackageOptions = currentPackage.split('.');
            currentPackage = currentPackageOptions[0];
            var needMinification = currentPackageOptions[1] === 'min' ? true : false;

            //domain exists so we get the conf of this domain
            fs.access(domain.configFile, fs.F_OK, function(err) {
              if (err) {
                console.error('[zam-error:domain-config-file] config file for domain ' + domain.label + ' doesn\'t exist');
              } else {
                var domainConfig = require(domain.configFile);
                if (!isEmptyObject(domainConfig)) {
                  // we get the domain config, we can start to get file for js or css
                  // is js or css
                  var contentType = 'application/javascript';
                  var content = '';
                  var path = '';

                  if (currentAssetType === 'js') {
                    console.log('[zam-log:asset] js type');

                    path = domainConfig.root + '/' + domainConfig.js.path + '/';
                    //console.log('[zam-log:domain-config-file]', domainPathPackage);
                    // search in js packages
                  } else {
                    if (currentAssetType === 'css') {
                      contentType = 'text/css';
                      console.log('[zam-log:asset] css type');
                      path = domainConfig.root + '/' + domainConfig.css.path + '/';
                      //search in css packages
                    }
                  }
                  Array.prototype.forEach.call(domainConfig[currentAssetType].packages[currentPackage], function(file) {
                    content += getContentRecursive(file, currentAssetType, currentPackage, path);
                  });
                  var contentSave = content;
                  try {
                    if (needMinification && currentAssetType === 'js') {
                      // go minification
                      var content = uglify.minify(content, {fromString: true});
                      content = content.code;
                    }
                  } catch (err) {
                    console.error(err);
                      content = contentSave;
                  }
                  res.writeHead(200, {"Content-Type": contentType});
                  res.write(content);
                  res.end();
                  return;

                } else {
                  throw new Error('[zam-error:domain-config-file] the config file is empty');
                }
              }
            });
          }
        });
      }).listen(config.server.port);
    } else {
      throw new Error('[zam-error:config] the config file is empty');
    }
    /*
      old method to parse a json file...
    fs.readFile(configFile, 'utf-8', function(err, data) {
      if (err) {
        throw new Error('[zam-error:config-file:17] ' + err);
      }
      config = JSON.parse(data);
      console.log(config);
    });*/
  }
});
