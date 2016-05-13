/**
 assets management
 **/
var zam;
var http = require('http');
var fs = require('fs');
var url = require('url');
var config;
var uglify = require('uglify-js');
var error;

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
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
        config = require(configFile);
        console.log(configFile);
        // parse url to get the right package
        console.log('[zam-info] parse the url');
        var urlConf = url.parse(req.url);
        var regExpDomain;

        Array.prototype.forEach.call(config.domains, function(domain){
          regExpDomain = new RegExp(domain.label);
          //verify domain exists in url
          if (regExpDomain.test(urlConf.pathname)) {
            var splitPathname = urlConf.pathname.split('/');
            console.log('split', splitPathname);
            var currentDomain = splitPathname[1];
            var currentAssetType = splitPathname[3];
            var currentPackage = splitPathname[4];
            var currentPackageOptions = currentPackage.split('.');
            currentPackage = currentPackageOptions[0];
            var needMinification = currentPackageOptions[1] === 'min';
            if (currentPackageOptions[1] === 'mobile') {
              currentPackage += '.mobile';
              needMinification = currentPackageOptions[2] === 'min';
            }
            console.log('[zam-log:asset] package selected => ' + currentPackage);
            console.log('[zam-log:asset] need minification => ' + needMinification);

            //domain exists so we get the conf of this domain
            try {
              console.log(domain[currentDomain].configFile);
              fs.access(domain[currentDomain].configFile, fs.F_OK, function(err) {

                if (err) {
                  console.log(err);
                  console.error('[zam-error:domain-config-file] config file for domain ' + currentDomain + ' doesn\'t exist');
                  res.writeHead(500, {
                    "Content-Type": 'text/html'
                  });
                  console.log('[zam-error:domain-config-file] config file for domain ' + currentDomain + ' doesn\'t exist');
                  error = '<b style="color: #900">[zam-error:domain-config-file]</b>  config file for domain ' + currentDomain + ' doesn\'t exist' + "<br /><br />";
                  error += err;
                  res.end(error);
                } else {
                  var domainConfig = require(domain[currentDomain].configFile);
                  if (!isEmptyObject(domainConfig)) {
                    // we get the domain config, we can start to get file for js or css
                    // is js or css
                    var contentType = 'application/javascript';
                    var content = '';
                    var path = '';


                    if (currentAssetType === 'scripts') {
                      console.log('[zam-log:asset] js type');

                    } else {
                      if (currentAssetType === 'css') {
                        contentType = 'text/css';
                        console.log('[zam-log:asset] css type');
                      }
                    }
                    path = domainConfig.root + '/' + domainConfig[currentAssetType].path + '/';
                    Array.prototype.forEach.call(domainConfig[currentAssetType].packages[currentPackage], function(file) {
                      content += '/** ' + path + file + ' **/' + "\n";
                      try {
                        fs.accessSync(path + file, fs.F_OK);
                        content += fs.readFileSync(path + file).toString();
                      } catch (err) {
                        content += "/** missing file : " + path + file + " **/\n";
                        console.log('[zam-log:missing-file] '  + path + file);
                      }

                    });
                    var contentSave = content;
                    try {
                      if (needMinification && currentAssetType === 'none') { //remove minification
                        // go minification
                        var content = uglify.minify(content, {fromString: true});
                        content = content.code;
                      }
                    } catch (err) {
                      console.log('minification failed');
                      console.log(err);
                      content = contentSave;
                    }
                    res.writeHead(200, {
                      "Content-Type": contentType,
                      //"Content-Length": content.length,
                      "Accept-Ranges": "bytes"//,
                      //"Cache-Control": "public, max-age=" + (60*60)

                    });

                    res.end(content);

                  } else {
                    res.writeHead(500, {
                      "Content-Type": 'text/html'
                    });
                    console.log('[zam-error:domain-config-file] domain ' + currentDomain + ' the config file is empty : ' + domainConfig);
                    error = '<b style="color: #900">[zam-error:domain-config-file]</b> domain ' + currentDomain + ' the config file is empty : ' + domainConfig;
                    res.end(error);
                  }
                }
              });
            } catch (exception) {
              res.writeHead(500, {
                "Content-Type": 'text/html'
              });
              console.log('[zam-error:domain-config-file] domain ' + domain + ' doesn\'t exist in main config file : ' + configFile);
              error = '<b style="color: #900">[zam-error:domain-config-file]</b> domain ' + currentDomain + ' doesn\'t exist in main config file : ' + configFile;
              res.end(error);
            }
          }
        });
      }).listen(config.server.port);
    } else {
      console.log('[zam-error:domain-config-file] the main config file is empty : ' + configFile);
    }
  }
});

