/**
 * @name FX.createAnimation
 * @author sundongguo
 * @version 20080831
 *
 * 创建一个动画效果。
 *
 * var animation=FX.createAnimation(config)
 * config=
 * {
 *   before:    动画开始前执行的函数。
 *   tween:    动画过程中执行的函数，将传入一个number数值，从0趋向于1。
 *   after:    动画结束后执行的函数。
 *   mode:    缓动模式。
 *   duration:  动画持续时间。
 *   interval:  动画间隔时间。
 * }
 * animation.play()  播放此效果。
 * animation.stop()  停止此效果。
 */
//--------------------------------------------------[createAnimation]
var FX={};
FX.createAnimation=function()
{
  function animate(o)
  {
    if(o.timeStamp)
    {
      var time=new Date().getTime()-o.timeStamp;
    }
    else
    {
      var time=0;
      o.timeStamp=new Date().getTime();
    }
    if(time>o.duration)time=o.duration;
    o.tween(o.mode(time/o.duration));
    if(time==o.duration)stop(o);
  }
  function play(o)
  {
    if(o.instance)return;
    o.instance=setInterval(function(){animate(o);},o.interval);
    if(o.before)o.before();
  }
  function stop(o)
  {
    if(!o.instance)return;
    clearInterval(o.instance);
    o.instance=null;
    o.timeStamp=0;
    if(o.after)o.after();
  }
  var mode=
  {
    linear:function(x)
    {
      return x;
    },
    easeIn:function(x)
    {
      return x*(2-x);
    },
    easeOut:function(x)
    {
      return x*x;
    },
    backIn:function(x)
    {
      return 1.5*x*x-0.5*x;
    },
    Circ: function(p){
      return 1 - Math.sin(Math.acos(p));
    },
    Sine: function(x){
      return 1 - Math.cos(x * Math.PI / 2);
    },
    Bounce: function(x){
      var y;
      for (var a = 0, b = 1; 1; a += b, b /= 2){
        if (x >= (7 - 4 * a) / 11){
          y = b * b - Math.pow((11 - 6 * a - 11 * x) / 4, 2);
          break;
        }
      }
      return y;
    }
  };
  return function(config)
  {
    var o=
    {
      before:config.before,
      tween:config.tween,
      after:config.after,
      mode:config.mode in mode?mode[config.mode]:mode.linear,
      duration:config.duration||1000,
      interval:config.interval||10,
      timeStamp:0,
      instance:null
    };
    return {
      options: {
        // TODO:添加选项支持。
      },
      play:function()
      {
        play(o);
      },
      stop:function()
      {
        stop(o);
      }
    };
  };
}();
