const ERvsType = {
	_val : 0, // 值，[1] = 值
	_id : 1, // 标识符，[1] = 标识符名称
	_op : 2, // 运算符，[1] = ERvsOp.xxx
	_key : 3, // 关键字，[1] = ERvsKeyword.xxx
	_goto : 4, // 跳转到指定行（相对，例如 [ERvsType._goto, 3] 就相当于跳转到后三行的位置）
	_str : 5, // 字符串，[1] = 字符串
	_arr : 6, // 数组，[1] = 数组，每个下标都是一个表达式数组
	_viarr : 7, // 访问数组，[1] = [标识符名称, 表达式数组]
	_callfn : 8, // 调用函数
	_lambda : 9, // 匿名函数
};
// 每个元素都会以数组的形式存储，[0] = ERvsType.xxx，[1] = 本体

const ERvsKeyword = {
	_var : 0,
	_if : 1,
	_else : 2,
	_while : 3,
	_for : 4,
	_break : 5,
	_continue : 6,
	_function : 7,
	_return : 8,
};
const gStructERvsKeywords = {
	"var" : ERvsKeyword._var,
	"if" : ERvsKeyword._if,
	"else" : ERvsKeyword._else,
	"while" : ERvsKeyword._while,
	"for" : ERvsKeyword._for,
	"break" : ERvsKeyword._break,
	"continue" : ERvsKeyword._continue,
	"function" : ERvsKeyword._function,
	"return" : ERvsKeyword._return
};

const ERvsOp = { // 对于各种运算符的枚举
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
	_cm : 41 , // ,
};
const gStructERvsOps = {
	"=" : ERvsOp._set,
	"!" : ERvsOp._not,
	"~" : ERvsOp._rev,
	"++x" : ERvsOp._linc,
	"--x" : ERvsOp._ldec,
	"x++" : ERvsOp._rinc,
	"x--" : ERvsOp._rdec,
	"0+" : ERvsOp._posi,
	"0-" : ERvsOp._nega,
	"*" : ERvsOp._mut,
	"/" : ERvsOp._div,
	"%" : ERvsOp._mod,
	"+" : ERvsOp._add,
	"-" : ERvsOp._min,
	"<" : ERvsOp._les,
	"<=" : ERvsOp._leseq,
	">" : ERvsOp._big,
	">=" : ERvsOp._bigeq,
	"==" : ERvsOp._eqs,
	"!=" : ERvsOp._noteq,
	"&" : ERvsOp._band,
	"^" : ERvsOp._bxor,
	"|" : ERvsOp._bor,
	"&&" : ERvsOp._and,
	"||" : ERvsOp._or,
	"+=" : ERvsOp._addst,
	"-=" : ERvsOp._minst,
	"*=" : ERvsOp._mutst,
	"/=" : ERvsOp._divst,
	"%=" : ERvsOp._modst,
	"&=" : ERvsOp._andst,
	"|=" : ERvsOp._orst,
	"^=" : ERvsOp._xorst,
	"~=" : ERvsOp._revst,
	"." : ERvsOp._dot,
	"(" : ERvsOp._sl,
	")" : ERvsOp._sr,
	"[" : ERvsOp._ml,
	"]" : ERvsOp._mr,
	"{" : ERvsOp._bl,
	"}" : ERvsOp._br,
	"," : ERvsOp._cm,
};

var gRvsMapVar = new Map(); // 装有rvs全局变量的Map

class Ravings {

	arrVarMaps = []; // 装有 装有rvs变量的Map 的数组
	// 关于作用域问题，数组的每个下标代表着一个层级，一个 {} 代表一个层级

	arrStackRun = []; // 运行逆波兰式时候会用来替代栈的数组
	// 该数组会在解析时根据最长的句子长度设定自身长度，具体见 UploadSentence()
	// 这么做是为了不去使用 push() 和 pop()，能省下许多运行时间

	arrExecutables = []; // 解析完成的结果，可以直接被 Ravings 执行

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

	/// @desc 获取变量的值，如果没找到则会从全局变量中查找，如果也没找到就返回 undefined
	GetVariable(name) {
		for(var i = this.arrVarMaps.length - 1; i >= 0; i--) {
			if(this.arrVarMaps[i].has(name)) {
				return this.arrVarMaps[i].get(name);
			}
		}
		return gRvsMapVar.get(name);
		// return undefined;
	}

	/// @desc 设置变量的值，没有变量的话就在当前除全局变量之外的最高层作用域下建立新变量
	SetVariable(name, val) {
		for(var i = this.arrVarMaps.length - 1; i >= 0; i--) {
			if(this.arrVarMaps[i].has(name)) {
				this.arrVarMaps[i].set(name, val);
				return;
			}
		}
		if(gRvsMapVar.has(name)) {
			gRvsMapVar.set(name, val);
			return;
		}
		this.arrVarMaps[0].set(name, val);
	}

	/// @desc 设置全局变量的值
	SetGlobalVar(name, val) {
		gRvsMapVar.set(name, val);
	}

	/// @desc 获取全局变量的值
	GetGlobalVar(name) {
		return gRvsMapVar.get(name);
	}

	/// @desc 检查某一字符是否是阿拉伯数字或小数点
	CharIsNum(character) {
		return (character >= "0" && character <= "9") || character == ".";
	}

	notCalcPrio = 20; // 非运算符的优先级
	/// @desc 获取优先级，也可以用以检查是否为运算符，若不为运算符，则返回 notCalcPrio
	GetPriority(op) {
		switch(op) {
			case ERvsOp._sl:
			case ERvsOp._sr:
			case ERvsOp._ml:
			case ERvsOp._mr:
			case ERvsOp._bl:
			case ERvsOp._br:
			case ERvsOp._dot:
				return 1;
			case ERvsOp._not:
			case ERvsOp._rev:
			case ERvsOp._linc:
			case ERvsOp._ldec:
			case ERvsOp._rinc:
			case ERvsOp._rdec:
			case ERvsOp._posi: // 正号
			case ERvsOp._nega: // 负号
				return 2;
			case ERvsOp._mut:
			case ERvsOp._div:
			case ERvsOp._mod:
				return 3;
			case ERvsOp._add:
			case ERvsOp._min:
				return 4;
			case ERvsOp._les:
			case ERvsOp._leseq:
			case ERvsOp._big:
			case ERvsOp._bigeq:
				return 5;
			case ERvsOp._eqs:
			case ERvsOp._noteq:
				return 6;
			case ERvsOp._band:
				return 7;
			case ERvsOp._bxor:
				return 8;
			case ERvsOp._bor:
				return 9;
			case ERvsOp._and:
				return 10;
			case ERvsOp._or:
				return 11;
			case ERvsOp._set:
			case ERvsOp._addst:
			case ERvsOp._minst:
			case ERvsOp._mutst:
			case ERvsOp._divst:
			case ERvsOp._modst:
			case ERvsOp._andst:
			case ERvsOp._orst:
			case ERvsOp._xorst:
			case ERvsOp._revst:
				return 12;
		}
		return this.notCalcPrio;
	}

	/// @desc 是否为关键字
	IsKeyWord(str) {
		return gStructERvsKeywords[str] != undefined;
		// switch(str) {
		// 	case "var":
		// 	case "function":
		// 	case "if":
		// 	case "else":
		// 	case "for":
		// 	case "while":
		// 	case "break":
		// 	case "continue":
		// 	case "return":
		// 		return true;
		// }
		// return false;
	}

	/// @desc 上传一句切割好的代码
	UploadSentence(arr, destarr, doRevPolish = true) {
		var tmp = arr.splice(0); // 复制出一个新数组并清空原数组
		var res = undefined;
		if(doRevPolish) {
			res = this.ToRevPolish(tmp);
		} else {
			res = tmp;
		}
		destarr.push(res);
		
		for(var i = this.arrStackRun.length; i < res.length; i++) {
			this.arrStackRun[i] = 0;
		}
	}
	
	/// @desc 分段括号内的代码，该函数会和 CutCode 轮流调用彼此并递归
	CutBracket(bracketL, bracketR, str, _begin, len, destArrEnd, loopBeginLine, arrBreak, arrConti) {
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
		return this.CutCode(str.substring(i, j), loopBeginLine, arrBreak, arrConti);
	}

	/// @desc 分段出中括号里的内容，每个表达式之间以逗号分隔
	CutArray(str, i, len, _arrdest, _lchr = "[", _rchr = "]") {
		var _num = 0;
		if(str[i] == _lchr) {
			_num = 1;
		}
		i++;
		for(var j = i; j < len; j++) {
			if(_num <= 1 && (str[j] == "," || str[j] == _rchr)) {
				// console.log(str.substring(i, j));
				_arrdest.push(this.CutCode(str.substring(i, j))[0]);
				i = j + 1;
			}

			if(str[j] == _lchr) {
				if(_num == 0) {
					i = j + 1;
				}
				_num++;
			} else
			if(str[j] == _rchr) {
				_num--;
				if(_num <= 0) {
					break;
				}
			}
		}
		return i - 1;
	}

	/// @desc 分出一个函数，i 需要为首个左括号的位置，返回 [[参数列表], [该函数的代码块]]
	CutFunc(str, i, len, _arrdest) {
		var _arrtmp = [];
		i = this.CutArray(str, i, len, _arrtmp, "(", ")");
		var _arrtmplen = _arrtmp.length;

		_arrdest[0] = [];
		for(var j = 0; j < _arrtmplen; j++) {
			_arrdest[0].push(_arrtmp[j][0]);
		}

		var _newend = [0];
		_arrtmp = this.CutBracket("{", "}", str, i, len, _newend);
		_arrdest[1] = _arrtmp;

		return _newend[0];
	}

	_CutCodeArrBreakPh = [];
	_CutCodeArrContiPh = [];
	strCalcChars = 
		" \t\n" + // 0 ~ 2
		",.()[]{}" + // 3 ~ 10
		"<>/*+-=%!&|^~"; // 11 ~ 23
	/// @desc 分段代码成句子
	/// @param {string} str
	/// @param {real} loopBeginLine 给 if 里面的 break 和 continue 看看上一个 for 或 while 在哪并以此来算出自身的行号，递归往内传参数用的
	/// @param {array} arrBreak 递归往外传参数用的
	/// @param {array} arrConti 递归往外传参数用的
	CutCode(str, loopBeginLine = 0, arrBreak = this._CutCodeArrBreakPh, arrConti = this._CutCodeArrContiPh) {
		var finalRes = []; // 这里面会装着许多 res
		var res = [];

		var keyBarceLine = 0; // 哪一行
		var keyBraceLoop = 0; // 是否为循环，0 = 非循环，1 = while，2 = for
		var keyBraceForThird = undefined; // for 的第三个表达式
		var keyBraceIfType = 0; // 0 = 啥也不是，1 = if，2 = else，3 = else if
		
		var arrKeyBraceIfsGoto = []; // 存储一段连续的 if ... else if 的结尾处的 goto 的栈

		var len = str.length;
		for(var i = 0; i < len; i++) {

			if(i < len - 1) {
				if(str[i] == "/") {
					if(str[i + 1] == "/") {
						for(var j = i + 2; j < len; j++) {
							if(str[j] == "\n") {
								break;
							}
						}
						i = j;
						continue;
					} else if(str[i + 1] == "*") {
						for(var j = i + 2; j < len - 1; j++) {
							if(str[j] == "*") {
								if(str[j + 1] == "/") {
									break;
								}
							}
						}
						i = j + 1;
						continue;
					}
				}
			}

			if(str[i] == "{") {

				if(res.length != 0) {
					this.UploadSentence(res, finalRes);
				}
				
				var _newend = [0];
				// res.push([ERvsType._op, ERvsOp._bl]);
				var _arrtmp = undefined;
				var _tmpArrBreak = [], _tmpArrConti = [];
				if(keyBraceLoop > 0) {
					_arrtmp = this.CutBracket("{", "}", str, i, len, _newend, 0, _tmpArrBreak, _tmpArrConti);
				} else {
					_arrtmp = this.CutBracket("{", "}", str, i, len, _newend, loopBeginLine + finalRes.length, arrBreak, arrConti);
				}
				i = _newend[0];
				var _arrtmplen = _arrtmp.length;
				for(var j = 0; j < _arrtmplen; j++) {
					this.UploadSentence(_arrtmp[j], finalRes, false);
				}
				
				if(keyBraceForThird != undefined) {
					this.UploadSentence(keyBraceForThird, finalRes, false);
					keyBraceForThird = undefined;
				}

				if(keyBraceLoop > 0) {
					
					this.UploadSentence([[ERvsType._goto, keyBarceLine - finalRes.length]], finalRes, false);
					finalRes[keyBarceLine].push(finalRes.length - keyBarceLine);

					// break 的处理
					for(var j = _tmpArrBreak.length - 1; j >= 0; j--) {
						var _jline = keyBarceLine + _tmpArrBreak[j];
						finalRes[_jline][0][1] = finalRes.length - _jline;
					}

					// continue 的处理
					for(var j = _tmpArrConti.length - 1; j >= 0; j--) {
						var _jline = keyBarceLine + _tmpArrConti[j];
						finalRes[_jline][0][1] = finalRes.length - _jline - (keyBraceLoop == 2 ? 2 : 1);
					}
					
					keyBraceLoop = 0;

				} else {

					this.UploadSentence([[ERvsType._goto, 1]], finalRes, false);
					if(keyBraceIfType != 2) {
						finalRes[keyBarceLine].push(finalRes.length - keyBarceLine);
					}

					if(keyBraceIfType == 2 || keyBraceIfType == 3) {
						var lenifsgoto = arrKeyBraceIfsGoto.length;
						for(var j = 0; j < lenifsgoto; j++) {
							var lineifsgoto = arrKeyBraceIfsGoto[j];
							finalRes[lineifsgoto][0][1] = finalRes.length - lineifsgoto;
						}
					}
					if(keyBraceIfType == 1 || keyBraceIfType == 3) {
						arrKeyBraceIfsGoto.push(finalRes.length - 1);
					}
				}

				keyBraceIfType = 0;
				
				continue;
			}

			if(str[i] == ";") {
				if(res.length != 0) {
					this.UploadSentence(res, finalRes);
				}
				continue;
			}

			if(str[i] == "\"") {
				var _strtmp = "";
				for(var j = i + 1; j < len; j++) {
					var strj = str[j];

					if(strj == "\\") {
						j++;
						switch(str[j]) {
							case "n":
								strj = "\n";
								break;
							case "0":
								strj = "\0";
								break;
							case "t":
								strj = "\t";
								break;
							case "f":
								strj = "\f";
								break;
							case "r":
								strj = "\r";
								break;
							case "b":
								strj = "\b";
								break;
							case "v":
								strj = "\v";
								break;
							case "\"":
								strj = "\"";
								break;
							case "\\":
								strj = "\\";
								break;
							default:
								j--;
						}
					} else
					if(strj == "\"") {
						break;
					}

					_strtmp += strj;
				}
				// _strtmp = str.substring(i + 1, j);
				i = j;
				res.push([ERvsType._str, _strtmp]);
				continue;
			}

			if(this.CharIsNum(str[i])) { // 数字
				for(var j = i + 1; j < len; j++) {
					if(!this.CharIsNum(str[j])) {
						break;
					}
				}
				res.push([ERvsType._val, Number(str.substring(i, j))]);
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
					if(ident != "for" && ident != "break" && ident != "continue" && ident != "function") { // 这些会到后面单独处理
						res.push([ERvsType._key, gStructERvsKeywords[ident]]); // 关键字
					}
				} else {
					res.push([ERvsType._id, ident]); // 标识符
				}
				i = j - 1;

				switch(ident) {
					case "for": // for 的处理其实是转换成 while
					
						var _newend = [0];
						var _arrtmp = this.CutBracket("(", ";", str, i, len, _newend);
						if(_arrtmp.length > 0) {
							this.UploadSentence(_arrtmp[0], finalRes, false);
						}
						
						res.push([ERvsType._key, ERvsKeyword._while]);
						_arrtmp = this.CutBracket("", ";", str, _newend[0] + 1, len, _newend);
						if(_arrtmp.length == 0) {
							res.push([0, 1]);
						} else {
							var _arrtmplen = _arrtmp[0].length;
							for(var j = 0; j < _arrtmplen; j++) {
								res.push(_arrtmp[0][j]);
							}
						}
						this.UploadSentence(res, finalRes, false);

						keyBraceForThird = this.CutBracket("", ")", str, _newend[0] + 1, len, _newend)[0];
						i = _newend[0];

						keyBarceLine = finalRes.length - 1;

						if(keyBraceForThird.length == 0) {
							keyBraceForThird = undefined;
							keyBraceLoop = 1;
						} else {
							keyBraceLoop = 2;
						}

						break;

					case "if":
					case "while":

						var _newend = [0];
						var _arrtmp = this.CutBracket("(", ")", str, i, len, _newend)[0];
						var _arrtmplen = _arrtmp.length;
						i = _newend[0];
						for(var j = 0; j < _arrtmplen; j++) {
							res.push(_arrtmp[j]);
						}
						this.UploadSentence(res, finalRes, false);

						keyBarceLine = finalRes.length - 1;
						if(ident == "while") {
							keyBraceLoop = 1;
						} else {
							if(keyBraceIfType == 2) {
								keyBraceIfType = 3;
							} else {
								keyBraceIfType = 1;
								arrKeyBraceIfsGoto.length = 0; // 清空 arrKeyBraceIfsGoto
							}
						}

						break;

					case "else":
						keyBraceIfType = 2;
						this.UploadSentence(res, finalRes, false);
						break;

					case "break":
						this.UploadSentence([[ERvsType._goto, 0]], finalRes, false);
						arrBreak.push(finalRes.length + loopBeginLine);
						break;

					case "continue":
						this.UploadSentence([[ERvsType._goto, 0]], finalRes, false);
						arrConti.push(finalRes.length + loopBeginLine);
						break;

					case "function":
						if(res.length == 0) { // function xxx() {}
							var _funcid = "";
							for(var j = ++i; j < len; j++) {
								if(str[j] == " " || str[j] == "(") {
									if(_funcid != "") {
										i = j;
										break;
									}
								} else {
									_funcid += str[j];
								}
							}
							
							var _arrtmp = [];
							i = this.CutFunc(str, i, len, _arrtmp);
							this.SetGlobalVar(_funcid, _arrtmp);
						} else { // xxx = function() {}

						}
						break;
				}
				continue;
			} else if(iCalChr <= 2) { // 空格
				continue;
			} else if(iCalChr <= 10) { // 单字符运算符
				var opTempRes = gStructERvsOps[str[i]];
				if(opTempRes != undefined) {

					var prevIsVar = false;
					if(res.length > 0) {
						var prevop = res[res.length - 1];
						if(prevop[0] == ERvsType._id // 为 标识符
							|| prevop[0] == ERvsType._viarr // 为 访问数组
							|| prevop[0] == ERvsType._callfn // 为 调用函数
						) {
							prevIsVar = true;
						}
					}

					switch(str[i]) {
						case "[":
							var _arrdata = [];
							if(prevIsVar) { // 视为访问数组
								var prevop = res[res.length - 1];
								i = this.CutArray(str, i, len, _arrdata);
								prevop[1] = [[prevop[0], prevop[1]], _arrdata[0]];
								prevop[0] = ERvsType._viarr;
							} else { // 视为建立新数组
								i = this.CutArray(str, i, len, _arrdata);
								res.push([ERvsType._arr, _arrdata]);
							}
							break;

						case "(":
							if(prevIsVar) { // 视为调用函数
								var _arrdata = [];
								var prevop = res[res.length - 1];
								i = this.CutArray(str, i, len, _arrdata, "(", ")");
								prevop[1] = [[prevop[0], prevop[1]], _arrdata];
								prevop[0] = ERvsType._callfn;
							} else { // 视为常规括号
								res.push([ERvsType._op, opTempRes]);
							}
							break;
							
						default:
							res.push([ERvsType._op, opTempRes]);
					}
				} else {
					res.push([ERvsType._op, str[i]]);
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
									if(prevop[0] != ERvsType._op) { // 上一个符号不是运算符
										opTemp = "x" + opTemp; // 变成 x++ 或 x--
									} else {
										opTemp += "x"; // 变成 ++x 或 --x
									}
								} else {
									opTemp += "x"; // 变成 ++x 或 --x
								}
							} else { // 不是一样的
								if(prevop != undefined) {
									if(prevop != "x++" && prevop != "x--" && prevop[0] == ERvsType._op) { // 上一个符号是运算符
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
				var opTempRes = gStructERvsOps[opTemp];
				if(opTempRes != undefined) {
					res.push([ERvsType._op, opTempRes]);
				} else {
					res.push([ERvsType._op, opTemp]);
				}
			}
		}
		if(res.length != 0) {
			this.UploadSentence(res, finalRes);
		}

		return finalRes;
	}

	/// @desc 获取指令为有左右值(0)，还是仅有右值(1)，还是仅有左值(2)，还是跳过(3)
	GetOpSide(op) {
		switch(op) {
			case ERvsOp._posi:
			case ERvsOp._nega:
			case ERvsOp._rev:
			case ERvsOp._not:
			case ERvsOp._linc:
			case ERvsOp._ldec:
				return 1; // 仅有右值
			case ERvsOp._rinc:
			case ERvsOp._rdec:
				return 2; // 仅有左值
			// case ERvsOp._cm:
			// case ERvsOp._ml:
			// case ERvsOp._mr:
			// 	return 3; // 跳过
		}
		return 0; // 有左值也有右值
	}

	/// @desc 执行一个命令
	RunOperation(op, lvalData, rvalData) {
		var res = undefined;
		var lres = undefined;
		var rres = undefined;

		switch(op) {
			case ERvsOp._posi:
				res = rvalData;
				break;
			case ERvsOp._nega:
				res = -rvalData;
				break;
			case ERvsOp._not:
				res = rvalData == 0;
				// 这里因为 GML 和 JS 对于 false 的判定不同（GML 负数视为 false，JS 里负数视为 true）
				// 所以不能写为 res = !rvalData;，应当写成这种更加确定的形式以便 Ravings 运行在不同平台上时能够统一
				break;
			case ERvsOp._rev:
				res = ~rvalData;
				break;

			case ERvsOp._rinc:
				res = lvalData;
				lres = res + 1;
				break;
			case ERvsOp._rdec:
				res = lvalData;
				lres = res - 1;
				break;
			case ERvsOp._linc:
				rres = rvalData + 1;
				break;
			case ERvsOp._ldec:
				rres = rvalData - 1;
				break;

			case ERvsOp._add:
				res = lvalData + rvalData;
				break;
			case ERvsOp._min:
				res = lvalData - rvalData;
				break;
			case ERvsOp._mut:
				res = lvalData * rvalData;
				break;
			case ERvsOp._div:
				res = lvalData / rvalData;
				break;
			case ERvsOp._mod:
				res = lvalData % rvalData;
				break;
			case ERvsOp._band:
				res = lvalData & rvalData;
				break;
			case ERvsOp._bor:
				res = lvalData | rvalData;
				break;
			case ERvsOp._bxor:
				res = lvalData ^ rvalData;
				break;

			case ERvsOp._set:
				lres = rvalData;
				break;
			case ERvsOp._addst:
				lres = lvalData + rvalData;
				break;
			case ERvsOp._minst:
				lres = lvalData - rvalData;
				break;
			case ERvsOp._mutst:
				lres = lvalData * rvalData;
				break;
			case ERvsOp._divst:
				lres = lvalData / rvalData;
				break;
			case ERvsOp._modst:
				lres = lvalData % rvalData;
				break;
			case ERvsOp._andst:
				lres = lvalData & rvalData;
				break;
			case ERvsOp._orst:
				lres = lvalData | rvalData;
				break;
			case ERvsOp._xorst:
				lres = lvalData ^ rvalData;
				break;

			case ERvsOp._and:
				res = (lvalData != 0) && (rvalData != 0);
				break;
			case ERvsOp._or:
				res = (lvalData != 0) || (rvalData != 0);
				break;

			case ERvsOp._eqs:
				res = lvalData == rvalData;
				break;
			case ERvsOp._noteq:
				res = lvalData != rvalData;
				break;
			case ERvsOp._big:
				res = lvalData > rvalData;
				break;
			case ERvsOp._bigeq:
				res = lvalData >= rvalData;
				break;
			case ERvsOp._les:
				res = lvalData < rvalData;
				break;
			case ERvsOp._leseq:
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
			if(val[0] == ERvsType._op) {
				prio = this.GetPriority(val[1]);
			} else {
				prio = this.notCalcPrio;
			}
			if(val[0] == ERvsType._key) { // 若为关键字
				arrPo.push(arr[i]); // 关键字直接入逆波兰式
			} else
			if(val[0] == ERvsType._op) { // 若为运算符
				if(val[1] == ERvsOp._sl) { // 左括号直接入栈
					arrSt.push(val);
				} else
				if(val[1] == ERvsOp._sr) { // 如果是右括号
					// 将栈里最后一个左括号到当前操作之间的所有操作都移入逆波兰式
					for(var j = arrSt.length; j > 0; j--) {
						var temp = arrSt.pop();
						if(temp[1] == ERvsOp._sl) {
							break;
						} else {
							arrPo.push(temp);
						}
					}
				} else
				if(arrSt.length > 0) { // 栈不为空
					var stLast = arrSt[arrSt.length - 1];
					while(
						stLast[1] != ERvsOp._sl
						&& (
							stLast[0] == ERvsType._key
							|| (
								(stLast[0] == ERvsType._op && this.GetPriority(stLast[1]) <= prio)
								|| (stLast[0] != ERvsType._op)
							)
						)
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

		for(var j = arrSt.length; j > 0; j--) {
			arrPo.push(arrSt.pop());
		}

		// for(var i = arrPo.length - 1; i >= 0; i--) { // 剔除掉所有逗号
		// 	if(arrPo[i][0] == ERvsType._op) {
		// 		if(arrPo[i][1] == ERvsOp._cm) {
		// 			arrPo.splice(i, 1);
		// 		}
		// 	}
		// }

		return arrPo;
	}

	/// @desc 执行逆波兰式，结果位于 destarr
	RunRevPolish(arrParts, i, len, destarr, iTop = -1) {
		// var iTop = -1;
		for(; i < len; i++) {
			var part = arrParts[i];
			// console.log("PO", arrParts);console.log("poi", i, part);
			if(part[0] != ERvsType._op) {
				if(part[0] == ERvsType._arr) { // 生成数组
					this.MakeArray(part[1], destarr, ++iTop);
				} else
				if(part[0] == ERvsType._callfn) { // 调用函数
					destarr[++iTop] = this.CallFunc(part[1]);
				} else
				{
					destarr[++iTop] = part;
				}
			} else {

				var opSide = this.GetOpSide(part[1]);
				// console.log("st", opSide, part, destarr, iTop);

				var rval = 0;
				var lval = 0;
				var rvalSrc = 0;
				var lvalSrc = 0;
				if(opSide != 2) {
					var _tmppart = destarr[iTop--];
					rvalSrc = _tmppart[1];
					switch(_tmppart[0]) {
						case ERvsType._id: // 标识符
							rval = this.GetVariable(rvalSrc);
							break;
						case ERvsType._viarr: // 访问数组
							rval = this.VisitArrayGet(_tmppart[1]);
							break;
						default:
							rval = rvalSrc;
					}
				}
				if(opSide != 1) {
					var _tmppart = destarr[iTop--];
					lvalSrc = _tmppart[1];
					switch(_tmppart[0]) {
						case ERvsType._id: // 标识符
							lval = this.GetVariable(lvalSrc);
							break;
						case ERvsType._viarr: // 访问数组
							lval = this.VisitArrayGet(lvalSrc);
							break;
						default:
							lval = lvalSrc;
					}
				}
				// console.log({op: part[1], lval, rval});
				var opRes = this.RunOperation(part[1], lval, rval);
				destarr[++iTop] = [ERvsType._val, opRes[0]];

				if(opRes[1] != undefined) {
					if(_tmppart[0] == ERvsType._viarr) {
						this.VisitArraySet(lvalSrc, opRes[1]);
					} else {
						this.SetVariable(lvalSrc, opRes[1]);
					}
				}
				if(opRes[2] != undefined) {
					this.SetVariable(rvalSrc, opRes[2]);
				}
			}
		}
		return iTop;
	}

	TypeFunc(_type_and_arg) {
		switch(_type_and_arg[0]) {
			case ERvsType._id:
				return this.GetVariable(_type_and_arg[1]);
			case ERvsType._viarr:
				return this.VisitArrayGet(_type_and_arg[1]);
			case ERvsType._callfn:
				return this.CallFunc(_type_and_arg[1]);
		}
		return undefined;
	}

	/// @desc 访问数组，取值
	VisitArrayGet(partval) {
		var tmparr = [];
		// console.log("partval",partval);
		this.RunRevPolish(partval[1], 0, partval[1].length, tmparr);

		return this.TypeFunc(partval[0])[tmparr[0][1]];;
	}

	/// @desc 访问数组，赋值
	VisitArraySet(partval, val) {
		var tmparr = [];
		// console.log("partval",partval, "=", val);
		this.RunRevPolish(partval[1], 0, partval[1].length, tmparr);

		this.TypeFunc(partval[0])[tmparr[0][1]] = val;
	}

	/// @desc 根据 ERvsType._arr 生成一个新的数组
	MakeArray(partval, destarr, destiTop) {
		var tmparr = [];

		var len = partval.length;
		var iTop = -1;
		for(var j = 0; j < len; j++) {
			if(partval[j] != undefined) {
				iTop = this.RunRevPolish(partval[j], 0, partval[j].length, tmparr, iTop);
			}
		}
		
		tmparr.splice(iTop + 1);
		
		len = tmparr.length;
		for(var j = 0; j < len; j++) {
			var _tmp = this.TypeFunc(tmparr[j]);
			if(_tmp == undefined) {
				tmparr[j] = tmparr[j][1];
			} else {
				tmparr[j] = _tmp;
			}
		}

		destarr[destiTop] = [ERvsType._arr, tmparr];
	}

	/// @desc 调用函数
	CallFunc(partval) {
		console.log("partval", partval[1]);
		// TODO
		return 0;
	}

	iLineAddPh = [0]; // PlaceHolder
	/// @desc 执行一句代码，需要提供一些分段后的数据
	/// @param {array} arrArrParts 传入 CutCode() 切割好的数据，若传入的只是切割好的数据中其中一句（其中一个下标的元素），则将 iLine 参数设为 -1 或其它负数
	/// @param {real} iLine 执行第几行
	/// @param {array} iLineAdd 这是一个长度 1 的数组，用以输出
	RunSentence(arrArrParts, iLine, iLineAdd = this.iLineAddPh, i = 0, len = undefined) {
		if(arrArrParts == undefined) {
			return 0;
		}

		var arrParts = undefined;
		if(iLine >= 0) {
			arrParts = arrArrParts[iLine];
		} else {
			arrParts = arrArrParts;
		}

		len ??= arrParts.length;
		// console.log("PARTS", iLine, arrParts, this.arrVarMaps[0].get("i"), iLineAdd);

		var firstType = arrParts[0][0], firstVal = arrParts[0][1];
		
		var conti = false;
		// if(firstType == ERvsType._op) {
		// 	if(firstVal == ERvsOp._bl) {
		// 		this.AddVarMap();
		// 		var blres = this.RunCuttedCode(arrParts[1][1]);
		// 		this.RemoveVarMap();
		// 		return blres;
		// 	}
		// } else 
		if(firstType == ERvsType._goto) {
			iLineAdd[0] = firstVal;
			return 0;
		} else if(firstType == ERvsType._key) {
			conti = true;
			switch(firstVal) {
				case ERvsKeyword._var:
					this.NewVariable(arrParts[1][1]);
					break;
				default:
					conti = false;
			}
		}
// this.arrStackRun[0] = arrArrParts[0];

		// 执行逆波兰式
		if(conti) {
			i++;
		}
		this.RunRevPolish(arrParts, i, len, this.arrStackRun);
		
		var firstStackRun = this.arrStackRun[0];
		if(firstStackRun[0] == ERvsType._key) {
			// console.log("STACKRUN", this.arrStackRun);
			switch(firstStackRun[1]) {
				case ERvsKeyword._if:
					var ifcheck = this.arrStackRun[1];
					var valtemp = undefined;
					if(ifcheck[0] == ERvsType._id) {
						valtemp = this.GetVariable(ifcheck[1]);
					} else {
						valtemp = ifcheck[1];
					}
					if(valtemp == 0) { // 若 if 所判断的表达式为假
						iLineAdd[0] = this.arrStackRun[2];
					}
					return 0;
				case ERvsKeyword._while:
					var ifcheck = this.arrStackRun[1];
					var valtemp = undefined;
					if(ifcheck[0] == ERvsType._id) {
						valtemp = this.GetVariable(ifcheck[1]);
					} else {
						valtemp = ifcheck[1];
					}
					if(valtemp == 0) { // 若 while 所判断的表达式为假
						iLineAdd[0] = this.arrStackRun[2];
					}
					return 0;
			}
		}

		var res = undefined;
		if(firstStackRun[0] == ERvsType._id) {
			res = this.GetVariable(firstStackRun[1]);
		} else {
			res = firstStackRun[1];
		}
		return res;
	}

	/// @desc 执行一段切割好的代码，会返回最后一句结果作为返回值
	RunCuttedCode(arrArrParts) {
		var res = [];
		var len = arrArrParts.length;
		var iLineAdd = [0];
		for(var iLine = 0; iLine < len; iLine++) {
			res = this.RunSentence(arrArrParts, iLine, iLineAdd);
			// console.log(this.arrVarMaps);
			if(iLineAdd[0] != 0) {
				iLine += iLineAdd[0] - 1; // 此处写个 - 1 是因为 for 循环的 iLine++
				iLineAdd[0] = 0;
			}
		}
		return res;
	}

	/// @desc 执行一段代码，会返回最后一句的结果作为返回值，仅供测试用
	RunCode(str = "") {
		return this.RunCuttedCode(this.CutCode(str));
	}

	/// @desc 解析一段代码
	Parse(strcode, _eventId = 0) {
		this.arrExecutables[_eventId] = this.CutCode(strcode);
	}

	/// @desc 运行代码（需要先解析，见 Parse() 函数）
	Run(_eventId = 0) {
		return this.RunCuttedCode(this.arrExecutables[_eventId]);
	}

};

module.exports = {
	Ravings,
	gRvsMapVar
};
