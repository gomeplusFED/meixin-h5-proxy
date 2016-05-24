#!/usr/bin/env node

var program = require('commander');
var static = require('node-static');
var fs = require('fs');
var path = require('path');
var when = require('when');
program
    .version('0.0.1')
    .option('-d, --dir <path>', 'the catalog to be proxyed')
    .option('-o, --port <path>', 'http portal, default 80')
    .option('-s, --ports <path>', 'https portal, default 443')
    .option('-p, --path <path>', 'middle path,default /m/app/src', '/m/app/src')
    .option('-f, --foreign <path>', 'public dependencies path')
    .parse(process.argv);


var fileServer = new static.Server(program.dir);
var httpsCreator = require('https');
var httpCreator = require('http');

var options = {
    key: fs.readFileSync(path.join(__dirname, 'privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cacert.pem'))
};
options.agent = new httpsCreator.Agent(options);

httpsCreator.createServer(options, function (request, response) {
    doProxy(request, response);
}).listen(parseInt(program.ports ? program.ports : 443));

httpCreator.createServer(function (request, response) {
    doProxy(request, response);
}).listen(parseInt(program.port ? program.port : 80));

function doProxy(request, response) {
    // console.log("before...", request.url);
    var pa = program.path.split(",");
    pa.sort(function(a, b){
        if (a.length < b.length) {
            return 1;
        }else if (a.length > b.length) {
            return -1;
        }else {
            return 0;
        }
    });
    pa = pa.filter(function(cur){
        if (request.url.indexOf(cur) != -1){
            return cur;
        }
    });

    request.url = request.url.replace(pa[0], '');

    var dotUrls = [];
    request.addListener('end', function () {
        response.setHeader("Access-Control-Allow-Origin", "*");
        var fileContents = "",
            promiseArr = [];
        if (request.url.indexOf("??") != -1) {
            var rUrls = request.url.match(/^([^\?]*)\?{2}([^\?]*)\??.*$/);
            dotUrls = rUrls[2].split(",");
            dotUrls = dotUrls.map(function (current) {
                return program.foreign + current;
            });

            try {
                dotUrls.forEach(function (current) {
                    promiseArr.push(when.promise(function (resolve) {
                        fs.readFile(current, 'utf-8', function (error, data) {
                            resolve(data.toString());
                        });
                    }));
                });
                when.join.apply(this, promiseArr).then(function (arr) {
                    arr.forEach(function (current) {
                        fileContents += current;
                    });
                    response.write(fileContents);
                    response.end();
                });
            }catch (e) {
                console.log(e);
            }
        } else {
            var fUrl = program.dir + request.url;
            // console.log("after...", fUrl);
            fileContents = fs.readFileSync(fUrl.match(/^([^\?]*)\??.*$/)[1], 'utf-8');
            response.write(fileContents);
            response.end();
        }
    }).resume();
}

console.log('start proxy.');