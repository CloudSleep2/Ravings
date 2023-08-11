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
    while(true) {
        console.log(rvs.RunSentence(await GetInput("> ")));
    }
}

var rvs = new ravings.Ravings();
Main(rvs);
