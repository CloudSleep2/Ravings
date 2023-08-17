var rvs = new Ravings();
var code = `
var j = 0;
for(var i = 1; i <= 1000000; i++) {
	j += i;
}
`;
console.time("Cut Code");
var arrArrParts = rvs.CutCode(code);
console.timeEnd("Cut Code");
console.log(arrArrParts);
for(var i = 0; i < 10; i++) {
	console.time("Time");
	rvs.RunCuttedCode(arrArrParts);
	console.timeEnd("Time");
}

function Test(input) { // 该函数可以在浏览器的控制台调用
    console.log(rvs.RunCode(input));
}
