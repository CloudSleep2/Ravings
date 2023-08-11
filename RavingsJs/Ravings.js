class Ravings {

    arrVarMaps = []; // 装有 装有rvs变量的Map 的数组
    // 关于作用域问题，数组的每个下标代表着一个层级，一个 {} 代表一个层级

	constructor() {
		this.AddVarMap(); // 一开始得先有一个层级
	}

    AddVarMap() {
        this.arrVarMaps.push(new Map());
    }
    
    RemoveVarMap() {
        delete this.arrVarMaps[this.arrVarMaps.length - 1];
        this.arrVarMaps.pop();
    }

    /// @desc 声明变量
    NewVariable(name) {
        this.arrVarMaps[this.arrVarMaps.length - 1].set(name, 0);
    }

    /// @desc 获取变量的值
    GetVariable(name) {
        for(var i = this.arrVarMaps.length - 1; i >= 0; i--) {
            if(this.arrVarMaps[i].has(name)) {
                return this.arrVarMaps[i].get(name);
            }
        }
        return undefined;
    }

    /// @desc 设置变量的值，没有变量的话就在当前最高层作用域下建立新变量
    SetVariable(name, val) {
        for(var i = this.arrVarMaps.length - 1; i >= 0; i--) {
            if(this.arrVarMaps[i].has(name)) {
                this.arrVarMaps[i].set(name, val);
                return;
            }
        }
        this.arrVarMaps[0].set(name, val);
    }

	/// @desc 检查某一字符是否是阿拉伯数字或小数点
    CharIsNum(character) {
        return (character >= "0" && character <= "9") || character == ".";
    }

    notCalcPrio = 20; // 非运算符的优先级
	/// @desc 获取优先级，也可以用以检查是否为运算符，若不为运算符，则返回 notCalcPrio
    GetPriority(op) {
        switch(op) {
            case "(":
            case ")":
            case "[":
            case "]":
            case ".":
                return 1;
            case "!":
            case "~":
            case "++":
            case "--":
            case "0+": // 正号
            case "0-": // 负号
                return 2;
            case "*":
            case "/":
            case "%":
                return 3;
            case "+":
            case "-":
                return 4;
            case "<":
            case "<=":
            case ">":
            case ">=":
                return 5;
            case "==":
            case "!=":
                return 6;
            case "&":
                return 7;
            case "^":
                return 8;
            case "|":
                return 9;
            case "&&":
                return 10;
            case "||":
                return 11;
            case "=":
            case "+=":
            case "-=":
            case "*=":
            case "/=":
            case "%=":
            case "&=":
            case "|=":
            case "^=":
            case "~=":
                return 12;
        }
        return this.notCalcPrio;
    }

    /// @desc 是否为关键字
    IsKeyWord(str) {
        switch(str) {
            case "var":
            case "function":
            case "if":
            case "else":
            case "for":
            case "while":
            case "break":
            case "continue":
            case "return":
                return true;
        }
        return false;
    }

    strCalcChars = 
        " " + // 0
        ",.()[]{}" + // 1 ~ 8
        "<>/*+-=%!&|^~"; // 9 ~ 21
	/// @desc 分段句子
    /// @param {array} destArrKeys 装有保留关键字的数组，[[关键字, 位置], [...], ...]
    CutSentence(str, destArrKeys) {
        var res = [];
        var len = str.length;
        for(var i = 0; i < len; i++) {

            if(this.CharIsNum(str[i])) { // 数字
                for(var j = i + 1; j < len; j++) {
                    if(!this.CharIsNum(str[j])) {
                        break;
                    }
                }
                res.push(Number(str.substring(i, j)));
                i = j - 1;
                continue;
            }

            var iCalChr = this.strCalcChars.indexOf(str[i]);

            if(iCalChr == -1) { // 标识符
                for(var j = i + 1; j < len; j++) {
                    iCalChr = this.strCalcChars.indexOf(str[j]);
                    if(iCalChr != -1) {
                        break;
                    }
                }
                var ident = str.substring(i, j);
                if(this.IsKeyWord(ident)) {
                    destArrKeys.push([ident, res.length]);
                } else {
                    res.push(ident);
                }
                i = j - 1;
                continue;
            } else if(iCalChr == 0) { // 空格
                continue;
            } else if(iCalChr <= 8) { // 单字符运算符
                res.push(str[i]);
            } else if(iCalChr <= 21) { // 双字符运算符
                var opTemp = str[i];
                var opNext = str[i + 1];
                if(str[i + 1] == "=") {
                    opTemp += opNext;
                    i++;
                } else { // 处理 ++ -- && || 0+ 0-
                    switch(opTemp) {
                        case "+":
                        case "-":
                            if(opTemp == opNext) {
                                opTemp += opNext;
                                i++;
                            } else { // 不是一样的
                                var lenTemp = res.length;
                                if(lenTemp > 0) {
                                    if(this.GetPriority(res[lenTemp - 1]) != this.notCalcPrio) { // 上一个符号是个运算符
                                        opTemp = "0" + opTemp; // 生成为 0- 或 0+ 运算符，注意这俩也是运算符，一个是正号一个是负号
                                    }
                                } else {
                                    opTemp = "0" + opTemp;
                                }
                            }
                            break;
                        case "&":
                        case "|":
                            if(opTemp == opNext) {
                                opTemp += opNext;
                                i++;
                            }
                            break;
                    }
                }
                res.push(opTemp);
            }
        }

        return res;
    }

    /// @desc 获取指令为有左右值(0)，还是仅有右值(1)，还是仅有左值(2)
    GetOpSide(op) {
        switch(op) {
            case "0+":
            case "0-":
            case "~":
            case "!":
                return 1; // 仅有右值
        }
        return 0; // 有左值也有右值
    }

	/// @desc 执行一条命令
    RunOperation(op, lval, rval) {
        var res = undefined;
        var lres = undefined;

        var lvalData = undefined, rvalData = undefined;
        if(typeof(lval) == "string") {
            lvalData = this.GetVariable(lval);
        }
        if(typeof(rval) == "string") {
            rvalData = this.GetVariable(rval);
        }
        if(lvalData == undefined) {
            lvalData = lval;
        }
        if(rvalData == undefined) {
            rvalData = rval;
        }

        switch(op) {
            case "0+":
                res = rvalData;
                break;
            case "0-":
                res = -rvalData;
                break;
            case "!":
                res = rvalData == 0;
                // 这里因为 GML 和 JS 对于 false 的判定不同（GML 负数视为 false，JS 里负数视为 true）
                // 所以不能写为 res = !rvalData;，应当写成这种更加确定的形式以便 Ravings 运行在不同平台上时能够统一
                break;
            case "~":
                res = ~rvalData;
                break;
            case "+":
                res = lvalData + rvalData;
                break;
            case "-":
                res = lvalData - rvalData;
                break;
            case "*":
                res = lvalData * rvalData;
                break;
            case "/":
                res = lvalData / rvalData;
                break;
            case "%":
                res = lvalData % rvalData;
                break;
            case "&":
                res = lvalData & rvalData;
                break;
            case "|":
                res = lvalData | rvalData;
                break;
            case "^":
                res = lvalData ^ rvalData;
                break;
            case "=":
                lres = rvalData;
                break;
            case "+=":
                lres = lvalData + rvalData;
                break;
            case "-=":
                lres = lvalData - rvalData;
                break;
            case "*=":
                lres = lvalData * rvalData;
                break;
            case "/=":
                lres = lvalData / rvalData;
                break;
            case "%=":
                lres = lvalData % rvalData;
                break;
            case "&=":
                lres = lvalData & rvalData;
                break;
            case "|=":
                lres = lvalData | rvalData;
                break;
            case "^=":
                lres = lvalData ^ rvalData;
                break;
        }
        if(lres != undefined) {
            res = lres;
        }
        return [res, lres];
    }

    /// @desc 中缀表达式 转换为 逆波兰表达式
    /// @param {array} arr 装有一个个符号的数组
    ToRevPolish(arr) {
        var arrSt = []; // Stack
        var arrPo = []; // Reverser Polish

        var len = arr.length;
        for(var i = 0; i < len; i++) {
            var val = arr[i];
            var prio = this.GetPriority(val);
            if(prio != this.notCalcPrio) { // 若为运算符
                if(val == "(") { // 左括号直接入栈
                    arrSt.push(val);
                } else if(val == ")") { // 如果是右括号
                    // 将栈里最后一个左括号到当前操作之间的所有操作都移入逆波兰式
                    for(var j = arrSt.length; j > 0; j--) {
                        var temp = arrSt.pop();
                        if(temp == "(") {
                            break;
                        } else {
                            arrPo.push(temp);
                        }
                    }
                } else if(arrSt.length > 0) { // 栈不为空
                    var stLast = arrSt[arrSt.length - 1];
                    while(stLast != "(" && this.GetPriority(stLast) <= prio) { // 若栈顶运算符优先级高于或等于当前优先级（数字越小，优先级越高）
                        arrPo.push(arrSt.pop()); // 栈顶移入逆波兰式
                        if(arrSt.length <= 0) {
                            break;
                        } else {
                            stLast = arrSt[arrSt.length - 1];
                        }
                    }
                    arrSt.push(val);
                } else { // 栈为空则入栈
                    arrSt.push(val);
                }
            } else { // 操作数入逆波兰式
                arrPo.push(val);
            }
        }

        for(var i = arrSt.length; i > 0; i--) {
            arrPo.push(arrSt.pop());
        }

        return arrPo;
    }

	/// @desc 执行一个句子
    RunSentence(str = "") {
        var res = [];
        var arrKeywords = [];
        var arrParts = this.CutSentence(str, arrKeywords);
        var partsLen = arrParts.length;
        console.log(arrKeywords);
        console.log(arrParts);

        var len = arrKeywords.length;
        for(var i = 0; i < len; i++) { // 关键字处理
            var pos = arrKeywords[i][1];
            if(arrKeywords[i][0] == "var") {
                if(pos < partsLen) {
                    this.NewVariable(arrParts[pos - i]); // 因为关键字不会被推入 arrParts 中，所以需要减去前面的关键字的数量才能得到正确的位置
                }
                continue;
            }
        }

        var arrPolish = this.ToRevPolish(arrParts);
        
        var arrSt = [];
        for(var i = 0; i < partsLen; i++) {
            if(this.GetPriority(arrPolish[i]) == this.notCalcPrio) {
                arrSt.push(arrPolish[i]);
            } else {
                var rval = 0;
                var lval = 0;

                var opSide = this.GetOpSide(arrPolish[i]);
                if(opSide != 2) {
                    rval = arrSt.pop();
                }
                if(opSide != 1) {
                    lval = arrSt.pop();
                }

                var opRes = this.RunOperation(arrPolish[i], lval, rval);
                arrSt.push(opRes[0]);

                if(opRes[1] != undefined) {
                    this.SetVariable(lval, opRes[1]);
                }
            }
        }
        res = arrSt[0];
        console.log(this.arrVarMaps);

        return res;
    }

};

// console.log(RunSentence("1+2 +=  {}=+==3-- ++-+=114][abHe llo,cd  he..,=U_U+ijk&|w||or&&ld=!=World"));

module.exports = {
    Ravings
};

