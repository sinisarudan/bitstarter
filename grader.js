#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var rest = require('restler');//('./restler');

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile, is_file) {
//console.log('is_file: '+is_file);
    return cheerio.load(is_file ? fs.readFileSync(htmlfile) : htmlfile);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, is_file) {
    $ = cheerioHtmlFile(htmlfile, is_file);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var do_it = function(file, checks, is_file){
	var checkJson = checkHtmlFile(file, checks, is_file);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}

if(require.main == module) {
   program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-u, --url <url_to_file>', 'Url to index.html')
        .parse(process.argv);
	//console.log('url:'+ program.url)
	var file;
	if(program.url){
		//console.log('url is set');	
		
		rest.get(program.url).on('complete', function(result) {
		  if (result instanceof Error) {
			console.log('Error: ' + result.message);
			this.retry(5000); // try again after 5 sec
		  } else {
			//console.log(result);
			do_it(result, program.checks, false);
		  }
		});
	}
	else{
		do_it(program.file, program.checks, true);
	}	
    
} else {
    exports.checkHtmlFile = checkHtmlFile;
}


