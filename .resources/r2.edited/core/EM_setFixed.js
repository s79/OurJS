/**
 * @name ElementManager.setFixed
 * @author sundongguo
 * @version 20080825
 * @need EventManager
 *       ElementManager
 *       FX
 *
 * 将指定元素固定在可视区域的指定位置。
 * 在改变窗口大小或滚动内容时，浮动该元素到指定位置。
 *
 * ElementManager.setFixed($target,position)
 * $target:	目标元素。
 * position:	{left:左边距,right:右边距,top:上边距,bottom:下边距}格式的对象，设置其位置。
 *		可以设置像素数或百分比，如left:50代表距左边线50像素，left:50%代表目标元素中心点距左边线占总长度的50%。
 *		如果同时设定left/right或top/bottom，将以后边的为准。
 *		如果省略left/right或top/bottom，则设置left或top为auto，参照文档流的当前坐标定位。
 */
//--------------------------------------------------[setFixed]
ElementManager.setFixed=function()
{
  function setXY(o)
  {
    if(o.xy.x)
    {
      var offsetWidth=o.$target.offsetWidth;
      var windowWidth=ElementManager.getWindowWidth();
      var x=null;
      if("left" in o.position)
      {
        x=o.position.left;
        x=/\d+%/.test(x)?parseInt(x,10)/100*windowWidth-offsetWidth/2:x;
      }
      else
      {
        x=o.position.right;
        x=/\d+%/.test(x)?(1-parseInt(x,10)/100)*windowWidth-offsetWidth/2:windowWidth-offsetWidth-x;
      }
      o.xy.x[1]=Math.floor(x);
    }
    if(o.xy.y)
    {
      var offsetHeight=o.$target.offsetHeight;
      var windowHeight=ElementManager.getWindowHeight();
      var y=null;
      if("top" in o.position)
      {
        y=o.position.top;
        y=/\d+%/.test(y)?parseInt(y,10)/100*windowHeight-offsetHeight/2:y;
      }
      else
      {
        y=o.position.bottom;
        y=/\d+%/.test(y)?(1-parseInt(y,10)/100)*windowHeight-offsetHeight/2:windowHeight-offsetHeight-y;
      }
      o.xy.y[1]=Math.floor(y);
    }
  }
  function onEvent(event)
  {
    if(event.type=="resize")for(var i=0;i<pool.length;i++)setXY(pool[i]);
    animation.stop();
    animation.play();
  }
  var pool=[];
  var animation=FX.createAnimation
  ({
    before:function()
    {
      for(var i=0;i<pool.length;i++)
      {
        var o=pool[i];
        if(o.xy.x)o.xy.x[0]=parseInt(o.$target.style.left,10);
        if(o.xy.y)o.xy.y[0]=parseInt(o.$target.style.top,10);
      }
    },
    tween:function(n)
    {
      for(var i=0;i<pool.length;i++)
      {
        var o=pool[i];
        if(o.xy.x)o.$target.style.left=(o.xy.x[0]+(ElementManager.getWindowSrollLeft()+o.xy.x[1]-o.xy.x[0])*n)+"px";
        if(o.xy.y)o.$target.style.top=(o.xy.y[0]+(ElementManager.getWindowSrollTop()+o.xy.y[1]-o.xy.y[0])*n)+"px";
//				if(o.xy.x)o.$target.style.left=Math.max(Math.min(o.xy.x[0]+(ElementManager.getWindowSrollLeft()+o.xy.x[1]-o.xy.x[0])*n,ElementManager.getDocumentWidth()-o.$target.offsetWidth),0)+"px";
//				if(o.xy.y)o.$target.style.top=Math.max(Math.min(o.xy.y[0]+(ElementManager.getWindowSrollTop()+o.xy.y[1]-o.xy.y[0])*n,ElementManager.getDocumentHeight()-o.$target.offsetHeight),0)+"px";
      }
    },
    mode:"easeIn",
    duration:500
  });
  return function($target,position)
  {
    //设置浮动。
    if(position)
    {
      //首次运行，建立对象池并绑定事件。
      if(pool.length==0)
      {
        EventManager.bind(window,"resize",onEvent);
        EventManager.bind(window,"scroll",onEvent);
//				EventManager.bind(parent,"resize",onEvent);
//				EventManager.bind(parent,"scroll",onEvent);
      }
      //同一元素只能绑定一个坐标，后边的设置将覆盖先前的设置。
      else
      {
        for(var i=0;i<pool.length;i++)if(pool[i].$target===$target)pool.splice(i,1);
      }
      //建立新对象，只保存值，无方法。
      var o=
      {
        $target:$target,
        position:position,
        xy:{}
      };
      if("left" in position&&"right" in position)delete position.left;
      if("top" in position&&"bottom" in position)delete position.top;
      if("left" in position||"right" in position)o.xy.x=[];
      if("top" in position||"bottom" in position)o.xy.y=[];
      setXY(o);
      //设置初始位置。
      if(o.xy.x)$target.style.left=ElementManager.getWindowSrollLeft()+o.xy.x[1]+"px";
      if(o.xy.y)$target.style.top=ElementManager.getWindowSrollTop()+o.xy.y[1]+"px";
//			if(o.xy.x)o.$target.style.left=Math.max(Math.min(ElementManager.getWindowSrollLeft()+o.xy.x[1],ElementManager.getDocumentWidth()-o.$target.offsetWidth),0)+"px";
//			if(o.xy.y)o.$target.style.top=Math.max(Math.min(ElementManager.getWindowSrollTop()+o.xy.y[1],ElementManager.getDocumentHeight()-o.$target.offsetHeight),0)+"px";
      //向池压入。
      pool.push(o);
    }
    //取消浮动。
    else
    {
      if(pool.length==0)return;
      //从池弹出。
      for(var i=0;i<pool.length;i++)if(pool[i].$target===$target)pool.splice(i,1);
      //无浮动对象，清除对象池并解除事件绑定。
      if(pool.length==0)
      {
        EventManager.unbind(window,"resize",onEvent);
        EventManager.unbind(window,"scroll",onEvent);
//				EventManager.unbind(parent,"resize",onEvent);
//				EventManager.unbind(parent,"scroll",onEvent);
      }
    }
  };
}();
