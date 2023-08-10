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

async function Main() {
    while(true) {
        console.log(ravings.RunSentence(await GetInput("")));
    }
}

Main();
