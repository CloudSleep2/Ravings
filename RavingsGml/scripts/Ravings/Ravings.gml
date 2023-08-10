function MakeOperation(op, lval, rval) {
    return { op, lval, rval };
}

function CharIsNum(character) {
	static _ordzero = ord("0"), _ordnine = ord("9");
    return ord(character) >= _ordzero && ord(character) <= _ordnine;
}

function CutSentence(str) {
	static strCalcChars = 
	    " " + // 1
	    ",.()[]{}" + // 2 ~ 9
	    "<>/*+-=%!&|"; // 10 ~ 20
	
    var res = [];
    var len = string_length(str);
    for(var i = 1; i <= len; i++) {

        if(CharIsNum(string_char_at(str, i))) { // 数字
            for(var j = i + 1; j <= len; j++) {
                if(!CharIsNum(string_char_at(str, j))) {
                    break;
                }
            }
            array_push(res, string_copy(str, i, j - i));
            i = j - 1;
            continue;
        }

        var iCalChr = string_pos(string_char_at(str, i), strCalcChars);

        if(iCalChr == 0) { // 标识符
            for(var j = i + 1; j <= len; j++) {
                iCalChr = string_pos(string_char_at(str, j), strCalcChars);
                if(iCalChr != 0) {
                    break;
                }
            }
            array_push(res, string_copy(str, i, j - i));
            i = j - 1;
            continue;
        } else if(iCalChr == 1) { // 空格
            continue;
        } else if(iCalChr <= 9) { // 单字符运算符
            array_push(res, string_char_at(str, i));
        } else if(iCalChr <= 20) { // 双字符运算符
            switch(string_char_at(str, i + 1)) {
                case "=":
                    array_push(res, string_char_at(str, i) + string_char_at(str, i + 1));
                    i++;
                    break;
                case "+":
                case "-":
                case "&":
                case "|":
                    if(string_char_at(str, i) == string_char_at(str, i + 1)) {
                        array_push(res, string_char_at(str, i) + string_char_at(str, i + 1));
                        i++;
                    } else {
                        array_push(res, string_char_at(str, i));
                    }
                    break;
                default:
                    array_push(res, string_char_at(str, i));
            }
        }
    }
    return res;
}

function RunSentence(str = "") {
    var arrParts = CutSentence(str);
    return arrParts;
}

show_debug_message(RunSentence("1+2 +=  {}=+==3-- ++-+=114][abHe llo,cd  he..,=U_U+ijk&|w||or&&ld=!=World"));
game_end();
