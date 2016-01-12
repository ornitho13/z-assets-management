# z-assets-management aka zam

Heading
-------
0.1

requirement
-----------
node version > 4

require uglyfy-js for js assets minification

how to use it ?
---------------
zam is very simple to use. You need a node server where you run the src/app.js script.

    >node app.js

then you need to update the zam configuration to scope your asset collection in your repository



    {
        "domains" : [
            {
                "label" : "zoomcar",
                "configFile" : "C:/wamp/www/www-perso/test/zam-conf/zam-test-conf.json"
            }
        ],
        "server" : {
            "port" : 8888
        }
    }

in your web application repository, you need a configuration too placed at the domains.configFile parameters

    {
      "root" : "C:/wamp/www/www-perso/test/assets",
      "js" : {
        "path" : "js",
        "packages" : {
          "home" :  [
              "popin.js", "test.js"
          ]
        }
      },
      "css" : {
        "path" : "css",
        "packages" : {
          "home" : [
            "admin-bar-rtl.css", "admin-bar.css"
          ]
        }
      }
    }
