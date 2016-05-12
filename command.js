#!/usr/bin/env node

var program = require('commander');
var static = require('node-static');
var fs = require('fs');
var path = require('path');

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
    request.url = request.url.replace(program.path, '');
    var dotUrls = [];
    request.addListener('end', function () {
        var fileContents = "";
        if (request.url.indexOf("??") != -1) {
            var rUrls = request.url.match(/^([^\?]*)\?{2}([^\?]*)\??.*$/);
            dotUrls = rUrls[2].split(",");
            dotUrls = dotUrls.map(function(current) {
                return program.foreign + current;
            });
            try {
                dotUrls.forEach(function(current) {
                    fileContents += fs.readFileSync(current, 'utf-8');
                });
            }catch(e) {
                console.log(e);
            }
        }else {
            var fUrl = program.dir +request.url;
            fileContents = fs.readFileSync(fUrl.match(/^([^\?]*)\??.*$/)[1], 'utf-8');
        }
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.write(fileContents);
        response.end();
    }).resume();
}).listen(parseInt(program.ports ? program.ports : 443));

httpCreator.createServer(function (request, response) {
    request.url = request.url.replace(program.path, '');
    var dotUrls = [];
    request.addListener('end', function () {
        var fileContents = "";
        if (request.url.indexOf("??") != -1) {
            var rUrls = request.url.match(/^([^\?]*)\?{2}([^\?]*)\??.*$/);
            dotUrls = rUrls[2].split(",");
            dotUrls = dotUrls.map(function(current) {
                return program.foreign + current;
            });
            try {
                dotUrls.forEach(function(current) {
                    fileContents += fs.readFileSync(current, 'utf-8');
                });
            }catch(e) {
                console.log(e);
            }
        }else {
            var fUrl = program.dir +request.url;
            fileContents = fs.readFileSync(fUrl.match(/^([^\?]*)\??.*$/)[1], 'utf-8');
        }
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.write(fileContents);
        response.end();
    }).resume();
}).listen(parseInt(program.port ? program.port : 80));

console.log('start proxy.');