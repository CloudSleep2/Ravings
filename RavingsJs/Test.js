// node Test.js

ravings = require("./Ravings.js");

readline = require("readline");

function GetInput(ques) {
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	return new Promise(function(resolve) {
		rl.question(ques, function(input) {
			rl.close();
			resolve(input);
		});
	});
}

async function Main(rvs) {
	var codes = [];
	codes[0] = `
var n = 12;
var m = -5 + (2 * n);
{
	var k = -1 + n * m;
	if(3 > 4
		&& n
		== 12 ||
		1
		)
		k /= 2;
	if(n != 12) k *= 2;
	++k;
	n = 1;
	if(n) {
		var a = 14 / 1000;
		var b = a + k;
		k = b;
	}
	k;
}
	`;
	codes[1] = `
var a = 3;
if(a--)if(a--)if(a--)if(a--)if(a--);if(a--);a;
	`;
	codes[2] = `
var a = 3;
var b = 4;
var c = 5;
if(a > 0) {
	var d = b / c + a * -1;
	if(d != 3)
	if(d != 2 && d != 0)
	if(d != 3.8 || d < 0) if(d <= 4) d = 1000;
	d;
}
	`;
	console.log(rvs.RunCode(codes[2]));
	while(true) {
		console.log(rvs.RunCode(await GetInput("> ")));
	}
}

var rvs = new ravings.Ravings();
Main(rvs);
