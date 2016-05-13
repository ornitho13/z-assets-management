/**
 assets management
 **/
var http = require('http'),
    fs = require('fs'),
    uglify = require('uglify-js'),
    error,
    express = require('express');

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

var configFile = __dirname + "/../configuration/configuration.json";
fs.access(configFile, fs.F_OK, function(err) {
  if (err) {
    console.error('[zam-error:config-file] ' + err);
  } else {
    var config = require(configFile);
    if (!isEmptyObject(config)) {
      var zam = express();
      zam.get('/:domain/:revision/:assetType/:package\.:minification\.js', function(req, res){
        var domainConfig = config.domains[req.params.domain].configFile;
        fs.access(domainConfig, fs.F_OK, function(err) {
          if (err) {
            console.error(err);
            console.error('[zam-error:domain-config-file] config file for domain ' + currentDomain + ' doesn\'t exist');
            error = '<b style="color: #900">[zam-error:domain-config-file]</b>  config file for domain ' + currentDomain + ' doesn\'t exist' + "<br /><br />";
            error += err;
            res.status(500).set('Content-Type', 'text/html').send(error);
          } else {
            domainConfig = require(domainConfig);
            if (!isEmptyObject(domainConfig)) {
              var content = '',
                  path = domainConfig.root + '/' + domainConfig[req.params.assetType].path + '/',
                  contentType = 'text/css';
              if (req.params.assetType === 'scripts') {
                contentType = 'application/javascript';
              }

              Array.prototype.forEach.call(domainConfig[req.params.assetType].packages[req.params.package], function(file) {
                content += '/** ' + path + file + ' **//*' + "\n";
                try {
                  fs.accessSync(path + file, fs.F_OK);
                  content += fs.readFileSync(path + file).toString();
                } catch (err) {
                  content += "/** missing file : " + path + file + " **//*\n";
                  console.log('[zam-log:missing-file] '  + path + file);
                }
              });

              try {
                if (typeof req.params.minification !== "undefined" && req.params.assetType === 'none') { //remove minification
                  // go minification
                  content = uglify.minify(content, {fromString: true});
                  content = content.code;
                }
              } catch (err) {
                console.log('minification failed');
                console.error(err);
              }
              res.status(200).set({
                "Content-Type": contentType,
                //"Content-Length": content.length,
                "Accept-Ranges": "bytes"//,
                //"Cache-Control": "public, max-age=" + (60*60)

              }).send(content);
            } else {
              console.error('[zam-error:domain-config-file] domain ' + currentDomain + ' the config file is empty : ' + domainConfig);
              error = '<b style="color: #900">[zam-error:domain-config-file]</b> domain ' + currentDomain + ' the config file is empty : ' + domainConfig;
              res.status(500).set('Content-Type', 'text/html').send(error);
            }
          }
        });
      });
      zam.listen(config.server.port);
    } else {
      console.log('[zam-error:domain-config-file] the main config file is empty : ' + configFile);
    }
  }
});
