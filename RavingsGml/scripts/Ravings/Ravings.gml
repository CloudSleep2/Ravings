function Ravings() constructor {

	CharIsNum = function(character) {
		static _ordzero = ord("0"), _ordnine = ord("9");
		return (ord(character) >= _ordzero && ord(character) <= _ordnine) || character == ".";
	}
	
	/// @desc 是否为关键字
	IsKeyWord = function(str) {
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

	/// @desc 分段句子
	/// @param {string} str
	/// @param {array} destArrKeys 装有保留关键字的数组，每个下标内存着一个这个：[[关键字, 位置], [...], ...]
	CutCode = function(str, destArrKeys) {
		static strCalcChars = 
			" \t" + // 1 ~ 2
			",.()[]{}" + // 3 ~ 10
			"<>/*+-=%!&|^~"; // 11 ~ 23
		
		var finalRes = []; // 这里面会装着许多 res
		
		var braceNum = 0; // 花括号的数量
	
		var res = [];
		var keywords = [];
		
		var len = string_length(str);
		for(var i = 1; i <= len; i++) {
			
			if(braceNum == 0 && string_char_at(str, i) == "{") {
				if(array_length(res) != 0 || array_length(keywords) != 0) {
					// 考虑到每次执行函数时声明一个新函数的话效率很慢，所以就干脆每次都复制一次这四行好了
					array_push(finalRes, res);
					array_push(destArrKeys, keywords);
					res = [];
					keywords = [];
				}

				braceNum++;
				for(var j = i + 1; j < len; j++) {
					if(string_char_at(str, j) == "}") {
						braceNum--;
						if(braceNum == 0) {
							i++;
							keywords[0] = ["{", array_length(res)];
							keywords[1] = []; // 下标1里存的是递归切割结果的关键字
							res[0] = CutCode(string_copy(str, i, j - i), keywords[1]); // 遇到 { 时，递归切割
							array_push(finalRes, res);
							array_push(destArrKeys, keywords);
							res = [];
							keywords = [];

							i = j; // 因为后面会 continue;，所以此处不需要 j + 1
							break;
						}
					} else if(string_char_at(str, j) == "{") {
						braceNum++;
					}
				}

				continue;
			}
			
			if(string_char_at(str, i) == ";" || string_char_at(str, i) == "\n") {
				if(array_length(res) != 0 || array_length(keywords) != 0) {
					array_push(finalRes, res);
					array_push(destArrKeys, keywords);
					res = [];
					keywords = [];
					continue;
				}
			}

			if(CharIsNum(string_char_at(str, i))) { // 数字
				for(var j = i + 1; j <= len; j++) {
					if(!CharIsNum(string_char_at(str, j))) {
						break;
					}
				}
				array_push(res, real(string_copy(str, i, j - i)));
				i = j - 1;
				continue;
			}

			var iCalChr = string_pos(string_char_at(str, i), strCalcChars);

			if(iCalChr == 0) { // 标识符
				for(var j = i + 1; j <= len; j++) {
					if(string_char_at(str, j) == ";" || string_char_at(str, j) == "\n") {
						break;
					}
					iCalChr = string_pos(string_char_at(str, j), strCalcChars);
					if(iCalChr != 0) {
						break;
					}
				}
				var ident = string_copy(str, i, j);
				if(IsKeyWord(ident)) {
					array_push(keywords, [ident, array_length(res)]);
				} else {
					array_push(res, ident);
				}
				i = j - 1;
				continue;
			} else if(iCalChr <= 2) { // 空格
				continue;
			} else if(iCalChr <= 10) { // 单字符运算符
				array_push(res, string_char_at(str, i));
			} else if(iCalChr <= 23) { // 双字符运算符
				var opTemp = string_char_at(str, i);
				var opNext = string_char_at(str, i + 1);
				if(opNext == "=") {
					opTemp += opNext;
					i++;
				} else { // 处理 ++ -- && || 0+ 0-
					switch(opTemp) {
						case "=":
							opTemp += opNext;
							i++;
							break;
						case "+":
						case "-":
							var lenTemp = array_length(res);
							var prevop = undefined;
							if(lenTemp > 0) {
								prevop = res[lenTemp - 1];
							}
							
							if(opTemp == opNext) {
								opTemp += opNext;
								i++;
								if(prevop != undefined) {
									if(GetPriority(prevop) == notCalcPrio) { // 上一个符号不是运算符
										opTemp = "x" + opTemp; // 变成 x++ 或 x--
									} else {
										opTemp += "x"; // 变成 ++x 或 --x
									}
								} else {
									opTemp += "x"; // 变成 ++x 或 --x
								}
							} else { // 不是一样的
								if(prevop != undefined) {
									if(prevop != "x++" && prevop != "x--" && GetPriority(prevop) != notCalcPrio) { // 上一个符号是运算符
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
				array_push(res, opTemp);
			}
		}
		if(array_length(res) != 0 || array_length(keywords) != 0) {
			array_push(finalRes, res);
			array_push(destArrKeys, keywords);
		}
		
		return finalRes;
	}

	RunSentence = function(str = "") {
		var arrParts = CutCode(str, []);
		return arrParts;
	}
	
}

var rvs = new Ravings(); 

show_debug_message(rvs.RunSentence("1+2 +=  {}=+==3-- ++-+=114][abHe llo,cd  he..,=U_U+ijk&|w||or&&ld=!=World"));
game_end();
