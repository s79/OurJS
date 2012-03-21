/**
 * @name iFrameAutoResize
 * @author sundongguo
 * @version 20080529
 *
 * 使用iFrameAutoResize(id)自动调整id为id的iframe高度，以适应其内容高度，避免出现滚动条。
 */
//--------------------------------------------------[iFrameAutoResize]
function iFrameAutoResize()
{
	if(parent===window)return;
	var $iframe=parent.document.getElementById("iframe");
	if(!$iframe)return
	$iframe.style.height="680px";
	$iframe.style.height=Math.max((document.documentElement.clientHeight?Math.max(document.body.scrollHeight,document.documentElement.scrollHeight):document.body.scrollHeight),680)+"px";
}
EventManager.setOnDOMReady(iFrameAutoResize);
