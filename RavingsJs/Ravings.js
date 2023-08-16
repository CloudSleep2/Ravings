const EType = {
	_val : 0, // 值
	_id : 1, // 标识符
	_op : 2, // 运算符
	_code : 3, // 代码块或表达式
	_key : 4, // 关键字
};

const EOp = { // 对于各种运算符的枚举
	_set : 0 , // =
	_not : 1 , // !
	_rev : 2 , // ~
	_linc : 3 , // ++x
	_ldec : 4 , // --x
	_rinc : 5 , // x++
	_rdec : 6 , // x--
	_posi : 7 , // 0+
	_nega : 8 , // 0-
	_mut : 9 , // *
	_div : 10 , // /
	_mod : 11 , // %
	_add : 12 , // +
	_min : 13 , // -
	_les : 14 , // <
	_leseq : 15 , // <=
	_big : 16 , // >
	_bigeq : 17 , // >=
	_eqs : 18 , // ==
	_noteq : 19 , // !=
	_band : 20 , // &
	_bxor : 21 , // ^
	_bor : 22 , // |
	_and : 23 , // &&
	_or : 24 , // ||
	_addst : 25 , // +=
	_minst : 26 , // -=
	_mutst : 27 , // *=
	_divst : 28 , // /=
	_modst : 29 , // %=
	_andst : 30 , // &=
	_orst : 31 , // |=
	_xorst : 32 , // ^=
	_revst : 33 , // ~=
	_dot : 34 , // .
	_sl : 35 , // (
	_sr : 36 , // )
	_ml : 37 , // [
	_mr : 38 , // ]
	_bl : 39 , // {
	_br : 40 , // }
};
var gMapEOps = new Map();
gMapEOps["="] = EOp._set;
gMapEOps["!"] = EOp._not;
gMapEOps["~"] = EOp._rev;
gMapEOps["++x"] = EOp._linc;
gMapEOps["--x"] = EOp._ldec;
gMapEOps["x++"] = EOp._rinc;
gMapEOps["x--"] = EOp._rdec;
gMapEOps["0+"] = EOp._posi;
gMapEOps["0-"] = EOp._nega;
gMapEOps["*"] = EOp._mut;
gMapEOps["/"] = EOp._div;
gMapEOps["%"] = EOp._mod;
gMapEOps["+"] = EOp._add;
gMapEOps["-"] = EOp._min;
gMapEOps["<"] = EOp._les;
gMapEOps["<="] = EOp._leseq;
gMapEOps[">"] = EOp._big;
gMapEOps[">="] = EOp._bigeq;
gMapEOps["=="] = EOp._eqs;
gMapEOps["!="] = EOp._noteq;
gMapEOps["&"] = EOp._band;
gMapEOps["^"] = EOp._bxor;
gMapEOps["|"] = EOp._bor;
gMapEOps["&&"] = EOp._and;
gMapEOps["||"] = EOp._or;
gMapEOps["+="] = EOp._addst;
gMapEOps["-="] = EOp._minst;
gMapEOps["*="] = EOp._mutst;
gMapEOps["/="] = EOp._divst;
gMapEOps["%="] = EOp._modst;
gMapEOps["&="] = EOp._andst;
gMapEOps["|="] = EOp._orst;
gMapEOps["^="] = EOp._xorst;
gMapEOps["~="] = EOp._revst;
gMapEOps["."] = EOp._dot;
gMapEOps["("] = EOp._sl;
gMapEOps[")"] = EOp._sr;
gMapEOps["["] = EOp._ml;
gMapEOps["]"] = EOp._mr;
gMapEOps["{"] = EOp._bl;
gMapEOps["}"] = EOp._br;

var gMapVar = new Map(); // 装有rvs全局变量的Map

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
			case EOp._sl:
			case EOp._sr:
			case EOp._ml:
			case EOp._mr:
			case EOp._bl:
			case EOp._br:
			case EOp._dot:
				return 1;
			case EOp._not:
			case EOp._rev:
			case EOp._linc:
			case EOp._ldec:
			case EOp._rinc:
			case EOp._rdec:
			case EOp._posi: // 正号
			case EOp._nega: // 负号
				return 2;
			case EOp._mut:
			case EOp._div:
			case EOp._mod:
				return 3;
			case EOp._add:
			case EOp._min:
				return 4;
			case EOp._les:
			case EOp._leseq:
			case EOp._big:
			case EOp._bigeq:
				return 5;
			case EOp._eqs:
			case EOp._noteq:
				return 6;
			case EOp._band:
				return 7;
			case EOp._bxor:
				return 8;
			case EOp._bor:
				return 9;
			case EOp._and:
				return 10;
			case EOp._or:
				return 11;
			case EOp._set:
			case EOp._addst:
			case EOp._minst:
			case EOp._mutst:
			case EOp._divst:
			case EOp._modst:
			case EOp._andst:
			case EOp._orst:
			case EOp._xorst:
			case EOp._revst:
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

	/// @desc 分段括号内的代码，该函数会和 CutCode 轮流调用彼此并递归
	CutBracket(bracketL, bracketR, str, _begin, len, destArrEnd) {
		var i = _begin;
		var bracketNum = 0; // 括号的数量
		for(var j = i; j <= len; j++) {
			if(str[j] == bracketR) {
				bracketNum--;
				if(bracketNum <= 0) {
					i++;
					destArrEnd[0] = j;
					break;
				}
			} else if(str[j] == bracketL) {
				if(bracketNum == 0) {
					i = j;
				}
				bracketNum++;
			}
		}
		return this.CutCode(str.substring(i, j));
	}

	strCalcChars = 
		" \t\n" + // 0 ~ 2
		",.()[]{}" + // 3 ~ 10
		"<>/*+-=%!&|^~"; // 11 ~ 23
	/// @desc 分段代码成句子
	/// @param {string} str
	CutCode(str) {
		var finalRes = []; // 这里面会装着许多 res
		var res = [];

		var keyBrace = false; // 带括号和大括号的关键字，正在扫描括号，例如 if for while
		var keyBracketNum = 0; // 括号的数量
		var keyBracePrev = false; // 用来给 ; 可以直接结束 if for while 之类的用的

		var len = str.length;
		for(var i = 0; i < len; i++) {

			if(str[i] == "{") {
				keyBrace = false;
				keyBracketNum = 0;
				
				if(res.length != 0) {
					finalRes.push(res);
					res = [];
				}
				
				var _newend = [0];
				res.push([EType._op, EOp._bl]);
				res.push([EType._code, this.CutBracket("{", "}", str, i, len, _newend)]); // 下标1里存的是递归切割结果
				i = _newend[0];

				finalRes.push(res);
				res = [];

				continue;
			}

			if(str[i] == ";") {
				if(res.length != 0) {
					finalRes.push(res);
					res = [];
				} else
				if(keyBracePrev == true) {
					keyBracePrev = false;
					keyBracketNum = 0;
					finalRes.push([[EType._op, EOp._bl], [EType._code, []]]);
					res = [];
				}
				continue;
			}

			if(this.CharIsNum(str[i])) { // 数字
				for(var j = i + 1; j < len; j++) {
					if(!this.CharIsNum(str[j])) {
						break;
					}
				}
				res.push([EType._val, Number(str.substring(i, j))]);
				i = j - 1;
				continue;
			}

			var iCalChr = this.strCalcChars.indexOf(str[i]);

			if(iCalChr == -1) { // 标识符 和 关键字
				for(var j = i + 1; j < len; j++) {
					if(str[j] == ";") {
						break;
					}
					iCalChr = this.strCalcChars.indexOf(str[j]);
					if(iCalChr != -1) {
						break;
					}
				}
				var ident = str.substring(i, j);
				if(this.IsKeyWord(ident)) {
					res.push([EType._op, ident]); // 关键字
				} else {
					res.push([EType._id, ident]); // 标识符
				}
				i = j - 1;
				if(ident == "for") {
					var _newend = [0];
					res.push(this.CutBracket("(", ";", str, i, len, _newend)[0]);
					res.push(this.CutBracket("", ";", str, _newend[0] + 1, len, _newend)[0]);
					res.push(this.CutBracket("", ")", str, _newend[0] + 1, len, _newend)[0]);
					finalRes.push(res);
					res = [];
					i = _newend[0];
				} else if(ident == "if" || ident == "while") {
					keyBrace = true;
					keyBracePrev = true;
				} else if(ident == "else") {
					finalRes.push(res);
					res = [];
				}
				continue;
			} else if(iCalChr <= 2) { // 空格
				continue;
			} else if(iCalChr <= 10) { // 单字符运算符
				var opTempRes = gMapEOps[str[i]];
				if(opTempRes != undefined) {
					res.push([EType._op, opTempRes]);
				} else {
					res.push([EType._op, str[i]]);
				}
				
				if(keyBrace == true) {
					if(str[i] == "(") {
						keyBracketNum++;
					} else if(str[i] == ")") {
						keyBracketNum--;
						if(keyBracketNum == 0) {
							keyBrace = false;
							finalRes.push(res);
							res = [];
						}
					}
				}
			} else if(iCalChr <= 23) { // 双字符运算符
				var opTemp = str[i];
				var opNext = str[i + 1];
				if(str[i + 1] == "=") {
					opTemp += opNext;
					i++;
				} else { // 处理 ++ -- && || 0+ 0-
					switch(opTemp) {
						case "+":
						case "-":
							var lenTemp = res.length;
							var prevop = undefined;
							if(lenTemp > 0) {
								prevop = res[lenTemp - 1];
							}
							
							if(opTemp == opNext) {
								opTemp += opNext;
								i++;
								if(prevop != undefined) {
									if(prevop[0] != EType._op) { // 上一个符号不是运算符
										opTemp = "x" + opTemp; // 变成 x++ 或 x--
									} else {
										opTemp += "x"; // 变成 ++x 或 --x
									}
								} else {
									opTemp += "x"; // 变成 ++x 或 --x
								}
							} else { // 不是一样的
								if(prevop != undefined) {
									if(prevop != "x++" && prevop != "x--" && prevop[0] == EType._op) { // 上一个符号是运算符
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
				var opTempRes = gMapEOps[opTemp];
				if(opTempRes != undefined) {
					res.push([EType._op, opTempRes]);
				} else {
					res.push([EType._op, opTemp]);
				}
			}
		}
		if(res.length != 0) {
			finalRes.push(res);
		}

		return finalRes;
	}

	/// @desc 获取指令为有左右值(0)，还是仅有右值(1)，还是仅有左值(2)
	GetOpSide(op) {
		switch(op) {
			case EOp._posi:
			case EOp._nega:
			case EOp._rev:
			case EOp._not:
			case EOp._linc:
			case EOp._ldec:
				return 1; // 仅有右值
			case EOp._rinc:
			case EOp._rdec:
				return 2; // 仅有左值
		}
		return 0; // 有左值也有右值
	}

	/// @desc 执行一个命令
	RunOperation(op, lval, rval) {
		var res = undefined;
		var lres = undefined;
		var rres = undefined;

		var lvalData = this.GetVariable(lval), rvalData = this.GetVariable(rval);
		lvalData ??= lval;
		rvalData ??= rval;

		switch(op) {
			case EOp._posi:
				res = rvalData;
				break;
			case EOp._nega:
				res = -rvalData;
				break;
			case EOp._not:
				res = rvalData == 0;
				// 这里因为 GML 和 JS 对于 false 的判定不同（GML 负数视为 false，JS 里负数视为 true）
				// 所以不能写为 res = !rvalData;，应当写成这种更加确定的形式以便 Ravings 运行在不同平台上时能够统一
				break;
			case EOp._rev:
				res = ~rvalData;
				break;

			case EOp._rinc:
				res = lvalData;
				lres = res + 1;
				break;
			case EOp._rdec:
				res = lvalData;
				lres = res - 1;
				break;
			case EOp._linc:
				rres = rvalData + 1;
				break;
			case EOp._ldec:
				rres = rvalData - 1;
				break;

			case EOp._add:
				res = lvalData + rvalData;
				break;
			case EOp._min:
				res = lvalData - rvalData;
				break;
			case EOp._mut:
				res = lvalData * rvalData;
				break;
			case EOp._div:
				res = lvalData / rvalData;
				break;
			case EOp._mod:
				res = lvalData % rvalData;
				break;
			case EOp._band:
				res = lvalData & rvalData;
				break;
			case EOp._bor:
				res = lvalData | rvalData;
				break;
			case EOp._bxor:
				res = lvalData ^ rvalData;
				break;

			case EOp._set:
				lres = rvalData;
				break;
			case EOp._addst:
				lres = lvalData + rvalData;
				break;
			case EOp._minst:
				lres = lvalData - rvalData;
				break;
			case EOp._mutst:
				lres = lvalData * rvalData;
				break;
			case EOp._divst:
				lres = lvalData / rvalData;
				break;
			case EOp._modst:
				lres = lvalData % rvalData;
				break;
			case EOp._andst:
				lres = lvalData & rvalData;
				break;
			case EOp._orst:
				lres = lvalData | rvalData;
				break;
			case EOp._xorst:
				lres = lvalData ^ rvalData;
				break;

			case EOp._and:
				res = (lvalData != 0) && (rvalData != 0);
				break;
			case EOp._or:
				res = (lvalData != 0) || (rvalData != 0);
				break;

			case EOp._eqs:
				res = lvalData == rvalData;
				break;
			case EOp._noteq:
				res = lvalData != rvalData;
				break;
			case EOp._big:
				res = lvalData > rvalData;
				break;
			case EOp._bigeq:
				res = lvalData >= rvalData;
				break;
			case EOp._les:
				res = lvalData < rvalData;
				break;
			case EOp._leseq:
				res = lvalData <= rvalData;
				break;
		}
		if(res == undefined) {
			if(lres != undefined) {
				res = lres;
			} else
			if(rres != undefined) {
				res = rres;
			}
		}
		return [res, lres, rres]; // 返回值，新左值，新右值
	}

	/// @desc 中缀表达式 转换为 逆波兰表达式
	/// @param {array} arr 装有一个个符号的数组
	ToRevPolish(arr) {
		var arrSt = []; // Stack
		var arrPo = []; // Reverser Polish

		var len = arr.length;
		for(var i = 0; i < len; i++) {
			var val = arr[i];
			var prio = 0;
			if(val[0] == EType._op) {
				prio = this.GetPriority(val[1]);
			} else {
				prio = this.notCalcPrio;
			}
			if(val[0] == EType._op || val[0] == EType._key) { // 若为运算符 或 关键字
				if(val[1] == EOp._sl) { // 左括号直接入栈
					arrSt.push(val);
				} else if(val[1] == EOp._sr) { // 如果是右括号
					// 将栈里最后一个左括号到当前操作之间的所有操作都移入逆波兰式
					for(var j = arrSt.length; j > 0; j--) {
						var temp = arrSt.pop();
						if(temp[1] == EOp._sl && val[1] == EOp._sr) {
							break;
						} else {
							arrPo.push(temp);
						}
					}
				} else if(arrSt.length > 0) { // 栈不为空
					var stLast = arrSt[arrSt.length - 1];
					while(
						stLast[1] != EOp._sl && (stLast[0] == EType._key || ((stLast[0] == EType._op && this.GetPriority(stLast[1]) <= prio) || (stLast[0] != EType._op)))
					) {
						// 若栈顶运算符优先级高于或等于当前优先级（数字越小，优先级越高）或为关键字
						
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

	/* 
		关于 ifskip，这是一个长度 1 的数组，同时用以输入和输出
		该参数作为输出时是为了延续到同一层的下一个 if 或 else
		当函数执行的开始，会判断 ifskip[0] 的值并做出反应：
		0 = 正常执行
		1 = 跳过，因为上一句是 if 且为假
		2 = 上上一句为 if 且为假，这句如果是 else 则执行，如果不是则也依然正常执行并设为 0，该条主要为了 if else 和 while 或 for 嵌套
		11 = 正常执行，只不过上一句是 if 且为真
		10 = 正常执行，只不过上上一句是 if 且为真，所以这句如果是 else 则将 ifskip 设为 21，若不为 else 则设为 0
		21 = 跳过，专门给 else 表示的

		关于 inloop，这是一个长度会变的数组（为了适用于嵌套循环还不写花括号的场景），同时用以输入和输出
		每进入一层循环，inloop.push() 一个新的元素，每结束一层循环，inloop.pop()
		该参数作为输出时是为了给调用该函数的 RunCuttedCode() 看的
		当函数执行结束后，调用该函数的 RunCuttedCode() 会判断 inloop 最后一位的值并做出反应：
		0 = 正常执行
		1 = 正常执行，结束后回到上一句，并设为 2（这个 2 是给 for 和 while 看的，如果接下来表达式为假，则设为 3）
		2 = 正常执行，下一句为循环，所以结束后设为 1
		3 = 跳过，给该函数看的
	*/
	/// @desc 执行一句代码，需要提供一些分段后的数据
	/// @param {array} arrArrParts 传入 CutCode() 切割好的数据，若传入的只是切割好的数据中其中一句（其中一个下标的元素），则将 iLine 参数设为 -1 或其它负数
	RunSentence(arrArrParts, iLine, ifskip, inloop) {
		if(arrArrParts == undefined) {
			return 0;
		}

		var arrParts = undefined;
		if(iLine >= 0) {
			arrParts = arrArrParts[iLine];
		} else {
			arrParts = arrArrParts;
		}

		var len = arrParts.length;
		// console.log("PARTS", iLine, arrParts, this.arrVarMaps[0].get("i"), ifskip, inloop);

		var inloopMax = inloop.length - 1;

		if(ifskip[0] == 0) {
			if(arrParts[0][1] == "else") {
				ifskip[0] = 21;
				return 0;
			}
		} else if(ifskip[0] == 1) { // 若上一句是 if 且为假

			// if for while 等带有花括号的语句需要跳过自身和自身附属的下一句，故此处若为 if for while 则保留 ifskip 的状态
			if(arrParts[0][1] != "if") {
				if(arrParts[0][1] != "for" && arrParts[0][1] != "while") {
					ifskip[0] = 2;
				} else {
					ifskip[0] = 0;
				}
			} else {
				ifskip[0] = 21;
			}

			return 0; // 跳过当前
		} else if(ifskip[0] == 2) {
			if(arrParts[0][1] != "else") {
				ifskip[0] = 0;
			} else {
				return 0;
			}
		} else if(ifskip[0] == 11) {
			if(arrParts[0][1] != "if") {
				if(arrParts[0][1] != "for" && arrParts[0][1] != "while") {
					ifskip[0] = 10;
				} else {
					ifskip[0] = 0;
				}
			}
		} else if(ifskip[0] == 10) {
			if(arrParts[0][1] == "else") {
				ifskip[0] = 21;
				return 0; // 反正 else 单独一句，后面没东西，所以直接结束
			} else {
				ifskip[0] = 0;
			}
		} else if(ifskip[0] == 21) {
			if(arrParts[0][1] != "if" && arrParts[0][1] != "for" && arrParts[0][1] != "while") {
				ifskip[0] = 10;
			}
			return 0; // 跳过当前
		}

		if(inloop[inloopMax] == 3) {
			if(arrParts[0][1] != "if" && arrParts[0][1] != "for" && arrParts[0][1] != "while") {
				inloop.pop();
			}
			return 0;
		}

		if(arrParts[0][1] == "var") {
			this.NewVariable(arrParts[1][1]);
		} else 
		if(arrParts[0][1] == "for") {
			var fortmp1 = [0], fortmp2 = [0];
			if(inloop[inloopMax] == 0 || inloop[inloopMax] == 1) {
				this.RunSentence(arrParts[1], -1, fortmp1, fortmp2);
			} else {
				this.RunSentence(arrParts[3], -1, fortmp1, fortmp2);
			}

			var forcheck = this.RunSentence(arrParts[2], -1, fortmp1, fortmp2);
			var valtemp = this.GetVariable(forcheck);
			valtemp ??= forcheck;
			if(valtemp == 0) { // 若 for 所判断的表达式为假
				inloop[inloopMax] = 3;
			} else if(inloop[inloopMax] != 2) {
				inloop.push(2);
			}
			
			return 0;
		}

		// console.log(arrParts);
		// TODO - 这玩意太占运行了，到时候做进代码解析的部分里
		var arrPolish = this.ToRevPolish(arrParts);
		// console.log("POLISH", arrPolish);
		len = arrPolish.length;
		
		// 执行逆波兰式
		var arrSt = [];
		for(var i = 0; i < len; i++) {
// console.log("pocheck", arrPolish[i]);
			var conti = true;
			switch(arrPolish[i][1]) {
				case EOp._bl:
					this.AddVarMap();
					arrSt.push(this.RunCuttedCode(arrSt.pop()[1]));
					this.RemoveVarMap();
					break;
				case "var":
					break;
				case "if":
					var valtemp = this.GetVariable(arrSt[0][1]);
					valtemp ??= arrSt[0][1];
					if(valtemp == 0) { // 若 if 所判断的表达式为假
						ifskip[0] = 1;
						return 0;
					}
					ifskip[0] = 11;
					break;
				case "while":
					var valtemp = this.GetVariable(arrSt[0][1]);
					valtemp ??= arrSt[0][1];
					if(valtemp == 0) { // 若 while 所判断的表达式为假
						if(inloop[inloopMax] == 0 || inloop[inloopMax] == 1) {
							inloop.push(3);
						}
						inloop[inloopMax] = 3;
					} else
					if(inloop[inloopMax] != 2) {
						inloop.push(2);
					}
					return 0;
				default:
					conti = false;
			}
			if(conti) {
				continue;
			}
			// console.log("PO", arrPolish);console.log("poi", i, arrPolish[i]);
			if(arrPolish[i][0] != EType._op && arrPolish[i][0] != EType._key) {
				arrSt.push(arrPolish[i]);
			} else {
				
				var rval = 0;
				var lval = 0;

				var opSide = this.GetOpSide(arrPolish[i][1]);
				// console.log("st", opSide, arrPolish[i], arrSt);
				if(opSide != 2) {
					rval = arrSt.pop();
				}
				if(opSide != 1) {
					lval = arrSt.pop();
				}
				// console.log("lval", lval, rval);

				var opRes = this.RunOperation(arrPolish[i][1], lval[1], rval[1]);
				arrSt.push([EType._val, opRes[0]]);

				if(opRes[1] != undefined) {
					this.SetVariable(lval[1], opRes[1]);
				}
				if(opRes[2] != undefined) {
					this.SetVariable(rval[1], opRes[2]);
				}
			}
		}

		var res = this.GetVariable(arrSt[0][1]);
		res ??= arrSt[0][1];
		return res;
	}

	/// @desc 执行一段切割好的代码，会返回最后一句结果作为返回值
	RunCuttedCode(arrArrParts) {
		var res = [];
		var len = arrArrParts.length;
		var ifskip = [0]; // 在这里定义而非作为成员变量定义，是为了让递归时候的每一层都有一个自己的 ifskip，而不会影响到别的层
		var inloop = [0], inloopMax = 0, loopiLine = [0];
		for(var iLine = 0; iLine < len; iLine++) {
			res = this.RunSentence(arrArrParts, iLine, ifskip, inloop);
			// console.log(this.arrVarMaps);
			// console.log(ifskip, inloop);

			inloopMax = inloop.length - 1;
			
			if(inloop[inloopMax] == 2) {
				inloop[inloopMax] = 1;
				loopiLine[inloopMax] = iLine - 1;
			} else if(ifskip[0] != 1 && ifskip[0] != 2) {
				if(inloop[inloopMax] == 1 && ifskip[0] != 11) {
					inloop[inloopMax] = 2;
					iLine = loopiLine[inloopMax];
				} else if(inloop[inloopMax] == 3) {
					if(inloopMax > 1) { // 自己是子循环（别忘了还有个 inloop[0] 保持为 0）
						inloop.pop();
						inloop[inloopMax - 1] = 2;
						iLine = loopiLine[inloopMax - 1];
					}
				}
			}
		}
		return res;
	}

	/// @desc 执行一段代码，会返回最后一句的结果作为返回值
	RunCode(str = "") {
		var arrArrParts = this.CutCode(str);
		// console.log(arrArrParts);

		return this.RunCuttedCode(arrArrParts);
	}

};

module.exports = {
	Ravings
};
