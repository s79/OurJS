/**
 * @name createImageCropper
 * @author sundongguo
 * @version 20080925
 * @need ElementManager
 *       EventManager
 *       FX
 *
 * 使用var ImageCropper=createImageCropper(config)创建一个图片剪切器。
 * config.$target:	图片剪切器要插入的元素。
 * config.imageSrc:	要剪切的图片的地址。
 * config.width:	要剪切的宽度。
 * config.height:	要剪切的高度。
 *
 * ImageCropper.getValue();
 * 获得剪切后的图片尺寸、偏移量、剪切尺寸。
 */
//--------------------------------------------------[createImageCropper]
function createImageCropper(config)
{
	//初始化。
	function init()
	{
		sizeRate=$image.offsetWidth/$image.offsetHeight;
		resizeImage(0);
		$target.style.visibility="visible";
	}
	//拖动图片。
	function dragImage(event,x,y)
	{
		left=Math.max(Math.min(dragImage.x+x,maskX-r),r-width);
		top=Math.max(Math.min(dragImage.y+y,maskY-b),b-height);
		$image.style.left=left+"px";
		$image.style.top=top+"px";
	}
	dragImage.before=function()
	{
		dragImage.x=left;
		dragImage.y=top;
	};
	dragImage.after=function()
	{
		delete dragImage.x;
		delete dragImage.y;
		positionRate=[(maskX/2-left)/width,(maskY/2-top)/height];
	};
	//调整图片尺寸。
	function resizeImage(n,x,y)
	{
		if(typeof n!="number")n=resizeImage.currentX+x;
		bX=Math.max(Math.min(Math.round(n),track),0);
		$bar.style.left=bX+"px";
		$trackLeft.style.width=bX+"px";
		var step=bX*2;
		width=sizeRate<cropX/cropY?cropX+step:Math.round((cropY+step)*sizeRate);
		height=Math.round(width/sizeRate);
		left=Math.max(Math.min(Math.round(maskX/2-width*positionRate[0]),l),r-width);
		top=Math.max(Math.min(Math.round(maskY/2-height*positionRate[1]),t),b-height);
		$image.style.left=left+"px";
		$image.style.top=top+"px";
		$image.style.width=width+"px";
		$image.style.height=height+"px";
	}
	resizeImage.before=function()
	{
		resizeImage.currentX=$bar.offsetLeft;
	};
	resizeImage.after=function()
	{
		delete resizeImage.currentX;
		bT=bX;
	};
	function moveBar(n)
	{
		bT=n;
		animation.stop();
		animation.play();
	}
	function mouseScroll(event)
	{
		EventManager.preventDefault(event);
		moveBar(bT+(EventManager.getMouseWheel(event)==1?10:-10));
	}
	function trackDown(event)
	{
		if(!EventManager.getMouseButton(event).left)return;
		moveBar(EventManager.getMousePosition(event).clientX-$track.offsetLeft-$bar.offsetWidth/2);
	}
	function leftClick()
	{
		moveBar(bT-Math.round(track/10));
	}
	function rightClick()
	{
		moveBar(bT+Math.round(track/10));
	}
	function getValue()
	{
		return {imgSrc:config.imageSrc,width:width,height:height,cropLeft:l-left,cropTop:t-top,cropWidth:cropX,cropHeight:cropY};
	}
	//建立DOM。
	var $target=config.$target;
	$target.style.visibility="hidden";
	var $view=$("<div>");
	$view.className="view";
	var $image=$("<img>");
	//EventManager.bind($image,"load",init);在Opera里有时不执行。改用这种方式可以避免以上情况。
	$image.onload=init;
	$image.src=config.imageSrc;
	$image.alt="image";
	var $mask=$("<div>");
	$mask.className="mask";
	var $track=$("<div>");
	$track.className="track";
	var $trackLeft=$("<div>");
	$trackLeft.className="track_left";
	var $bar=$("<div>");
	$bar.className="bar";
	var $btnL=$("<div>");
	$btnL.className="btn_l";
	var $btnR=$("<div>");
	$btnR.className="btn_r";
	$view.appendChild($image);
	$view.appendChild($mask);
	$track.appendChild($trackLeft);
	$track.appendChild($bar);
	$target.appendChild($view);
	$target.appendChild($track);
	$target.appendChild($btnL);
	$target.appendChild($btnR);
	//准备变量。
	var bX=0;	//barLeft初始值。
	var bT=0;	//barLeft目标值。
	var bO=0;	//barLeft动画前值。
	var left=0,top=0,width=0,height=0;
	var sizeRate=1,positionRate=[0.5,0.5];
	var maskX=$mask.offsetWidth,maskY=$mask.offsetHeight,cropX=config.width,cropY=config.height;
	var l=(maskX-cropX)/2,r=maskX-(maskX-cropX)/2,t=(maskY-cropY)/2,b=maskY-(maskY-cropY)/2;
	var track=$track.offsetWidth-$bar.offsetWidth;
	var animation=FX.createAnimation
	({
		before:function()
		{
			bO=bX;
		},
		tween:function(x)
		{
			bT=Math.max(Math.min(bT,track),0);
			resizeImage(bO+(bT-bO)*x);
		},
		mode:"easeIn",
		duration:250
	});
	//绑定事件。
	EventManager.bind($mask,"DOMDrag",dragImage);
	EventManager.bind($mask,"DOMMouseScroll",mouseScroll);
	EventManager.bind($track,"mousedown",trackDown);
	EventManager.bind($bar,"DOMDrag",resizeImage);
	EventManager.bind($btnL,"click",leftClick);
	EventManager.bind($btnR,"click",rightClick);
	//返回句柄。
	return {getValue:getValue};
}
