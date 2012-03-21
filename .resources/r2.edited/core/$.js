/**
 * @name $
 * @author sundongguo
 * @version 20080825
 *
 * 使用$获取或创建HTML元素。
 */
//--------------------------------------------------[$]
function $(string)
{
	return /^<(.*)>$/.test(string)?document.createElement(RegExp.$1):document.getElementById(string);
}
