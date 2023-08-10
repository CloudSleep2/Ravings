function MakeOperation(op, lval, rval) {
    return { op, lval, rval };
}

function CharIsNum(character) {
    return character >= "0" && character <= "9";
}

var strCalcChars = 
    " " + // 0
    ",.()[]{}" + // 1 ~ 8
    "<>/*+-=%!&|"; // 9 ~ 19
function CutSentence(str) {
    var res = [];
    var len = str.length;
    for(var i = 0; i < len; i++) {

        if(CharIsNum(str[i])) { // 数字
            for(var j = i + 1; j < len; j++) {
                if(!CharIsNum(str[j])) {
                    break;
                }
            }
            res.push(str.substring(i, j));
            i = j - 1;
            continue;
        }

        var iCalChr = strCalcChars.indexOf(str[i]);

        if(iCalChr == -1) { // 标识符
            for(var j = i + 1; j < len; j++) {
                iCalChr = strCalcChars.indexOf(str[j]);
                if(iCalChr != -1) {
                    break;
                }
            }
            res.push(str.substring(i, j));
            i = j - 1;
            continue;
        } else if(iCalChr == 0) { // 空格
            continue;
        } else if(iCalChr <= 8) { // 单字符运算符
            res.push(str[i]);
        } else if(iCalChr <= 19) { // 双字符运算符
            switch(str[i + 1]) {
                case "=":
                    res.push(str[i] + str[i + 1]);
                    i++;
                    break;
                case "+":
                case "-":
                case "&":
                case "|":
                    if(str[i] == str[i + 1]) {
                        res.push(str[i] + str[i + 1]);
                        i++;
                    } else {
                        res.push(str[i]);
                    }
                    break;
                default:
                    res.push(str[i]);
            }
        }
    }
    return res;
}

function RunSentence(str = "") {
    var arrParts = CutSentence(str);
    return arrParts;
}

// console.log(RunSentence("1+2 +=  {}=+==3-- ++-+=114][abHe llo,cd  he..,=U_U+ijk&|w||or&&ld=!=World"));

module.exports = {
    RunSentence
};
