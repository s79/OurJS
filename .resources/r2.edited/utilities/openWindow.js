/**
 * @name openWindow
 * @author sundongguo
 * @version 20081103
 *
 * 弹出窗口并自动居中。
 * openWindow(url,width,height[,scrollbars[,resizable]])
 * url:		弹窗地址。
 * width:	弹窗宽度。
 * height:	弹窗高度。
 * scrollbars:	是否允许滚动条，[true|false]。
 * resizable:	是否允许调整大小，[true|false]。
 */
//--------------------------------------------------[openWindow]
function openWindow(url,width,height,scrollbars,resizable)
{
	scrollbars=typeof scrollbars=="boolean"?scrollbars?"yes":"no":"yes";
	resizable=typeof resizable=="boolean"?resizable?"yes":"no":"no";
	window.open(url,null,"width="+width+",height="+height+",left="+(screen.width-width)/2+",top="+(screen.height-height)/2+",scrollbars="+scrollbars+",resizable="+resizable);
}
