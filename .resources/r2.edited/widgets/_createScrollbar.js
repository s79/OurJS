/**
 * @name createScrollbar
 * @author sundongguo
 * @version 20080919
 * @need $
 *       EventManager
 *       FX
 *
 * 使用createScrollbar(config)创建一个滚动条。
 * config.$box:		盒模型。
 * config.$track:	轨道。
 * 盒模型和轨道要有共同的父对象，在创建前应该调整好他们的关系和位置。
 */
//--------------------------------------------------[createScrollbar]
var createScrollbar=function(config)
{
	var getScrollbarWidth=function()
	{
		var scrollbarWidth=0;
		return function()
		{
			if(scrollbarWidth)return scrollbarWidth;
			var $outer=$("<div>");
			$outer.style.position="absolute";
			$outer.style.top="0px";
			$outer.style.left="-10000px";
			$outer.style.width="100px";
			$outer.style.height="100px";
			$outer.style.overflow="scroll";
			var $inner=$("<div>");
			$inner.style.height="200px";
			$outer.appendChild($inner);
			document.body.appendChild($outer);
			scrollbarWidth=100-$inner.offsetWidth;
			document.body.removeChild($outer);
			return scrollbarWidth;
		};
	}();
	function setScrollbar()
	{
		sH=$box.scrollHeight;
		vH=$box.offsetHeight;
		var tH=vH-aH*2;
		bH=Math.max(Math.round(vH/sH*tH),18);
		dH=tH-bH;
		//滚动条大小及位置。
		if(sH>vH)
		{
			$bar.style.visibility="visible";
			$bar.style.height=bH+"px";
			$bar.style.top=(Math.round(dH*$box.scrollTop/(sH-vH))+aH)+"px";
			$top.className="button_t";
			$bottom.className="button_b";
		}
		else
		{
			$bar.style.visibility="hidden";
			$bar.style.height="0px";
			$top.className="button_t button_t_disabled";
			$bottom.className="button_b button_b_disabled";
		}
	}
	function s2w(n)
	{
		n=Math.max(Math.min(n,dH),0);
		$bar.style.top=(n+aH)+"px";
		$box.scrollTop=(sH-vH)*n/dH;
	}
	function w2s(n)
	{
		n=Math.max(Math.min(n,sH-vH),0);
		animation.x=n;
		animation.play();
	}
	function w2sDirect(n)
	{
		n=Math.max(Math.min(n,sH-vH),0);
		$box.scrollTop=n;
		$bar.style.top=(Math.round(dH*n/(sH-vH))+aH)+"px";
	}
	function tADown()
	{
	}
	tADown.before=function()
	{
		if(this.className=="button_t button_t_disabled")return;
		tADown.interval=setInterval(function(){w2sDirect($box.scrollTop-50);},10);
		this.className="button_t button_t_down";
	};
	tADown.after=function()
	{
		if(!tADown.interval)return;
		clearInterval(tADown.interval);
		delete tADown.interval;
		this.className="button_t";
	};
	function bADown()
	{
	}
	bADown.before=function()
	{
		if(this.className=="button_b button_b_disabled")return;
		bADown.interval=setInterval(function(){w2sDirect($box.scrollTop+50);},10);
		this.className="button_b button_b_down";
	};
	bADown.after=function()
	{
		if(!bADown.interval)return;
		clearInterval(bADown.interval);
		delete bADown.interval;
		this.className="button_b";
	};
	function trackDown(event)
	{
		if(EventManager.getTargetElement(event)!=this||!EventManager.getMouseButton(event).left)return;
		var y=EventManager.getMousePosition(event).offsetY;
		w2s((sH-vH)*(y-aH-bH/2)/dH);
	}
	function barDrag(event,x,y)
	{
		s2w(barDrag.y+y);
	}
	barDrag.before=function()
	{
		barDrag.y=parseInt($bar.style.top,10)-aH;
		this.className="bar bar_down";
	};
	barDrag.after=function()
	{
		delete barDrag.y;
		this.className="bar";
	};
	function mouseScroll(event)
	{
		w2sDirect($box.scrollTop+(EventManager.getMouseWheel(event)==1?100:-100));
		EventManager.stopPropagation(event);
		EventManager.preventDefault(event);
	}
	function boxClick(event)
	{
		var $target=EventManager.getTargetElement(event);
		if($target.tagName.toLowerCase()=="a"&&$target.href&&$target.href.indexOf("#")>-1)setTimeout(setScrollbar,0);
	}
	function keyDown(event)
	{
		var $target=EventManager.getTargetElement(event);
		var tagName=$target.tagName.toLowerCase();
		var type=$target.type?$target.type.toLowerCase():null;
		if(tagName=="textarea"||(tagName=="input"&&(type=="text"||type=="password")))return;
		var keyCode=EventManager.getKey(event).keyCode;
		if(keyCode==32)
		{
			if(tagName=="a"||tagName=="button"||tagName=="input")return;
			w2s($box.scrollTop+vH);
		}
		else if(keyCode==33)w2s($box.scrollTop-vH);		//Page Up
		else if(keyCode==34)w2s($box.scrollTop+vH);		//Page Down
		else if(keyCode==36)w2s($box.scrollTop-sH);		//Home
		else if(keyCode==35)w2s($box.scrollTop+sH);		//End
		else if(keyCode==38)w2sDirect($box.scrollTop-100);	//Up
		else if(keyCode==40)w2sDirect($box.scrollTop+100);	//Down
	}
	var animation=FX.createAnimation
	({
		before:function()
		{
			animation.y=$box.scrollTop;
			animation.z=animation.x-animation.y;
		},
		tween:function(n)
		{
			var top=animation.y+animation.z*n;
			$box.scrollTop=top;
			$bar.style.top=(Math.round(dH*top/(sH-vH))+aH)+"px";
		},
		mode:"easeIn",
		duration:200
	});
	//获取配置参数。
	var $box=config.$box;
	var $track=config.$track;
	//Opera的div的样式为overflow: hidden时，无法跳转锚点。
	//Opera的textarea无法正常获取scrollHeight属性。
	//因此统一取消Opera的自定滚动条。
	if(window.opera)
	{
		$track.parentNode.removeChild($track);
		$box.style.width="100%";
		$box.style.overflow="auto";
		return;
	}
	//建立DOM。
	var $top=$("<div>");
	$top.className="button_t";
	$top.innerHTML="<span>-</span>";
	var $bar=$("<div>");
	$bar.className="bar";
	$bar.innerHTML="<div class='bar_m'><div class='bar_t'></div><span>-</span><div class='bar_b'></div></div>";
	var $bottom=$("<div>");
	$bottom.className="button_b";
	$bottom.innerHTML="<span>-</span>";
	$track.appendChild($top);
	$track.appendChild($bar);
	$track.appendChild($bottom);
	//准备变量。
	var sH=null;			//盒滚动高
	var vH=null;			//盒可视高
	var bH=null;			//滑块高
	var dH=null;			//可拖动范围
	var aH=$top.offsetHeight;	//箭头高
	//绑定事件。
	EventManager.bind($top,"DOMDrag",tADown);
	EventManager.bind($bottom,"DOMDrag",bADown);
	EventManager.bind($track,"mousedown",trackDown);
	EventManager.bind($bar,"DOMDrag",barDrag);
	EventManager.bind($box,"DOMMouseScroll",mouseScroll);
	//如果目标是div元素:
	//内容单击后检测是否为页内锚点跳转。
	//绑定按键事件。
	//滚动条在window尺寸改变时刷新。
	if($box.tagName.toLowerCase()=="div")
	{
		EventManager.bind($box,"click",boxClick);
		EventManager.bind(document,"keydown",keyDown);
		EventManager.bind(window,"resize",setScrollbar);
	}
	//如果目标是textarea元素：
	//遮掩其自带滚动条，为防止冒出右侧，其父容器要overflow: hidden。
	//滚动条在textarea元素获得焦点后即周期性刷新。（IE可用鼠标中键拖动，释放时才能刷新。）
	else if($box.tagName.toLowerCase()=="textarea")
	{
		var scrollbarWidth=getScrollbarWidth();
		$box.style.width=($box.offsetWidth+scrollbarWidth)+"px";
		var interval=null;
		EventManager.bind($box,"focus",function(){interval=setInterval(setScrollbar,10);});
		EventManager.bind($box,"blur",function(){clearInterval(interval);});
	}
	$box.scrollTop=0;
	setScrollbar();
	return {setScrollbar:setScrollbar};
};
