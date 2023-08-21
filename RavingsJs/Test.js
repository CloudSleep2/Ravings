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
var k = -1 + n * m;
if(n != 12) {
	k = 600;
} else if(k == 227) {
	k /= 2;
} else if(k > 250) {
	k *= 2;
} else {
	k = 123;
}
++k;
if(n) {
	var a = 14 / 1000;
	var b = a + k;
	k = b;
}
k;
	`;
	codes[1] = `
var a = 3;
if(a--) { if(a--) { if(a--) { if(a--) { if(a--) {} } } } if(a--) {} }
	`;
	codes[2] = `
var a = 3;
var b = 4;
var c = 5;
var d = b / c + a * -1;
if(a > 0) {
	if(d != 3) {
		if(d != 2 && d != 0) {
			if(d != 3.8 || d < 0) {
				if(d <= 4 && 1) {
					d = 1000;
				} else {
					d = 500;
				}
			}
		}
	}
}
	`;
	codes[3] = `
var n = 10;
if(n) {
	if(n != 10) {
		n = 3;
	} else {
		n = 2;
	}
} else {
	n = 1;
}
	`;
	codes[4] = `
var j = 0;
var i = 1;
while(i <= 100) {
	j += i;
	i++;
}

var l = 0;
var k = 0;
var n = 0;
var m = 0;
while(++l < 10) {
	if(1) {
		while(++k < 10) {
			if(0) {
				n++;
			} else {
				while(++m < 10) {
					n--;
				}
			}
		}
	}
}

var x = 10;
var y = 1;
var z = 0;
while(x > 0) {
	y = 0;
	while(y < 10) {
		z++;
		y++;
	}
	x--;
}
	`;
	codes[5] = `
var j = 0;
for(var i = 1; i <= 100; i++) {
	j += i;
}

var n = 0;
for(var l = 0; l < 10; l++) {
	for(var k = 0; k < 10; k++) {
		for(var m = 0; m < 10; m++) {
			if(0) { n++; }
			else { n--; }
		}
	}
}
	`;
	codes[6] = `
var i = 0							;
var n = 0							;
if(1)								{
	while(i++ < 3)					{
		if(1)						{
			n++						;}}}
n += 10								;
	`;
	codes[7] = `
var n = 0;
for(var i = 1; i <= 1000000; i++) {
	n += i;
}
	`;
	codes[8] = `
var n = 0;
var m = 0;
var i = 1;
while(i <= 1000) {
	n += i;
	var j = 1;
	while(j <= 1000) {
		m++;
		j++;
	}
	i++;
}
	`;
	codes[9] = `
var n = 0;
var m = 0;
var res = 0;
if(0) {
	res = 114;
} else if(2 == 3) {
	res = 514;
} else if(4 == 4) {
	for(var j = 1; j <= 10000; j++) {
		m++;
	}
	res = 1919;
} else if(1 > 1) {
	res = 810;
} else {
	res = 777;
}
n = 1;
	`;
	console.time("Cut Code");
	rvs.Parse(codes[9]);
	console.timeEnd("Cut Code");
	console.log(rvs.executables);
	for(var i = 0; i < 10; i++) {
		console.time("Time");
		for(var j = 0; j < 1000000; j++) {
			rvs.Run();
			// rvs.RunSentence(arrArrParts[0], -1, rvs.ifskipPh, rvs.inloopPh);
		}
		console.timeEnd("Time");
	}
	while(true) {
		console.log(rvs.arrVarMaps);
		console.log(rvs.RunCode(await GetInput("> ")));
	}
}

var rvs = new ravings.Ravings();
Main(rvs);
