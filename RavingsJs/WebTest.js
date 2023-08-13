var rvs = new Ravings();

console.log(rvs.RunCode(`
var n = 12;
var m = 7 + n;
{
	var k = -1 + n * m;
	{
		k /= 2;
	}
	++k;
	{
		{
			{
				{
				}
			}
		}
		{
			{
				{
					var a = 14 / 1000;
					var b = a + k;
				}
			}
		}
	}
}
`));

function Test(input) { // 该函数可以在浏览器的控制台调用
    console.log(rvs.RunCode(input));
}
