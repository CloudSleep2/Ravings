# 胡言乱语 Ravings

已弃坑，因为做了套更好的解决方案：https://github.com/WheatBox/FxxkGML （使 C++ 能够间接用于 GameMaker 引擎中进行开发，主要用于 Mod 系统）

## 介绍

你说的对，但是《胡言乱语 Ravings》是由 Github@WheatBox 专为 GML 开发的一款在游戏运行时无需编译即可直接运行的脚本语言（准确点来说，是它的解释器），主要用于 Mod 系统、热更新 等要在运行时增加新内容的情况。

该脚本语言适用于一个被称作「GameMaker」的游戏引擎，在这里，被游戏开发者选中的游戏将被授予「胡言乱语解释器」，引导 Mod 系统之力。你将扮演一位名为「第三方创作者」的神秘角色，在自由的支持 Ravings 的游戏中制作形式多样、功能独特的 Mod，用以扩充游戏内容，增加游戏乐趣——同时，逐步发掘「胡言乱语 Ravings」的真相。

胡言乱语 Ravings 的语法主要参照了 JS（如果遇到 GM 和 JS 冲突的地方优先采取 JS 的语法），甚至可以说就是山寨出来了个阉割版的 JS 来给 GM 的游戏在运行时用的，所以会 GM 或 JS 的开发者很容易就能上手

## 进度

### GameMaker 版

搁在一边，等 JS 版做完了直接复制过来改改数组、字符串、Map之类的数据结构和相关函数就能用了

至于为啥做了 JS 版，因为 VSCode 写代码体验比 GameMaker 内置的代码编辑器要舒服太多了，而且用 Node.js 或浏览器来进行调试更方便一些

### JavaScript 版

- [x] 运算能力
- [x] 关键字 var 和 赋值
- [x] 关键字 if
- [x] 关键字 else
- [x] 关键字 while
- [x] 关键字 for
- [x] 关键字 break
- [x] 关键字 continue
- [x] 关键字 function 创建全局函数
- [ ] 关键字 function 创建 lambda 函数
- [ ] 关键字 return
- [ ] 函数调用 ()
- [x] 创建数组 []
- [x] 访问数组 []
- [ ] 创建对象 {}
- [ ] 访问对象 .
- [x] 字符串 ""
- [x] 注释 // /* */
- [ ] 全局变量

## 保留关键字

	var 定义变量
	if 分歧语句
	else 分歧语句
	while 循环语句
	for 循环语句
	break 终止循环
	continue 跳过一次循环
	function 定义函数
	return 返回
