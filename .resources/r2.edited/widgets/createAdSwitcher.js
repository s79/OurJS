/**
 * @name createAdSwitcher
 * @author sundongguo
 * @version 20080909
 * @need ElementManager
 *       EvFXentManager
 *
 *
 * 使用createAdSwitcher(config)创建一个广告切换器。
 * config.$target:	广告切换器要替换的HTMLElement。
 * config.ad:		["图片url","图片alt","链接地址"]格式的数组，广告数据。
 * config.duration:	每幅广告持续时间。
 * config.className:	广告切换器的基本样式。
 */
//--------------------------------------------------[createAdSwitcher]
function createAdSwitcher(config)
{
	function setBackgroundPositionY($target,y)
	{
		var p=$target.style.backgroundPosition;
		$target.style.backgroundPosition=p.substring(0,p.indexOf(" ")+1)+y;
	}
	function show(n)
	{
		animation.stop();
		t=n;
		animation.play();
	}
	function showNext()
	{
		show(c==aI.length-1?0:c+1);
		timer=null;
		setTimer();
	}
	function setTimer()
	{
		if(!timer)timer=setTimeout(showNext,config.duration||5000);
	}
	function clearTimer()
	{
		if(!timer)return;
		clearTimeout(timer);
		timer=null;
	}
	function mOver()
	{
		if(this.className=="selected")return;
		this.className="mouseover";
		setBackgroundPositionY(this,"center");
	}
	function mOut()
	{
		if(this.className=="selected")return;
		this.className="";
		setBackgroundPositionY(this,"top");
	}
	function mClick(n)
	{
		if(this.className=="selected")return;
		show(n);
	}
	function bindEvent(n)
	{
		var $li=aL[n];
		EventManager.bind($li,"mouseover",mOver);
		EventManager.bind($li,"mouseout",mOut);
		EventManager.bind($li,"click",function(){mClick.call(this,n);});
	}
	var aI=[];
	var aL=[];
	//建立DOM。
	var $target=config.$target;
	var $element=$("<"+$target.tagName.toLowerCase()+">");
	if($target.id)$element.id=$target.id;
	$element.className=config.className;
	var $ul=$("<ul>");
	for(var i=0;i<config.ad.length;i++)
	{
		var $a=$("<a>");
		$a.target="_blank";
		$a.href=config.ad[i][2];
		var $img=$("<img>");
		$img.src=config.ad[i][0];
		$img.alt=config.ad[i][1];
		$a.appendChild($img);
		$element.appendChild($a);
		var $li=$("<li>");
		$li.className="";
		$li.style.backgroundPosition=-i*100+"px top";
		var $span=$("<span>");
		$span.innerHTML=i+1;
		$li.appendChild($span);
		$ul.appendChild($li);
		aI.push($img);
		aL.push($li);
		bindEvent(i);
	}
	$element.appendChild($ul);
	$target.parentNode.insertBefore($element,$target);
	$target.parentNode.removeChild($target);
	EventManager.bind($element,"DOMMouseEnter",clearTimer);
	EventManager.bind($element,"DOMMouseLeave",setTimer);
	//创建过渡效果。
	var animation=FX.createAnimation
	({
		before:function()
		{
			aL[c].className="";
			setBackgroundPositionY(aL[c],"top");
			aL[t].className="selected";
			setBackgroundPositionY(aL[t],"bottom");
			aI[c].style.zIndex=10;
			ElementManager.setOpacity(aI[t],0);
			aI[t].style.display="block";
			aI[t].style.zIndex=11;
		},
		tween:function(n)
		{
			ElementManager.setOpacity(aI[t],n);
			ElementManager.setOpacity(aI[c],1-n);
		},
		after:function()
		{
			aI[c].style.display="none";
			c=t;
			t=null;
		},
		duration:500
	});
	//开始播放。
	var c=aI.length-1;
	var t=null;
	var timer=null;
	showNext();
}
