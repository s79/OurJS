/**
 * @name ElementManager.setMaskBehind
 * @author sundongguo
 * @version 20080828
 * @need EventManager
 *       ElementManager
 *
 * 创建一个在指定元素下的遮掩层，该层之下的元素不可点击，不可用tab键遍历。
 * Opera浏览器特殊，遮盖后仍可以用tab键遍历。目前无解决方案。
 *
 * ElementManager.setMaskBehind($target)
 * $target为目标元素，该元素的position属性必须是absolute，并设置了z-index属性，遮掩层将在此元素下方创建。
 * 如果没有指定$target，将清除遮掩层。
 */
//--------------------------------------------------[setMaskBehind]
ElementManager.setMaskBehind = function() {
  function setTabIndex($target, tabIndex) {
    var tagNames = ["a","button","input","select","textarea"];
    for (var n = 0; n < tagNames.length; n++) {
      var elements = $target.getElementsByTagName(tagNames[n]);
      for (var i = 0; i < elements.length; i++) {
        elements[i].tabIndex = tabIndex;
      }
    }
  }

  function maxSize() {
    $mask.style.width = ElementManager.getDocumentWidth() + "px";
    $mask.style.height = ElementManager.getDocumentHeight() + "px";
  }

  function setSize() {
    $mask.style.width = ElementManager.getWindowWidth() + "px";
    $mask.style.height = ElementManager.getWindowHeight() + "px";
    //加延时是为了IE浏览器。
    setTimeout(maxSize, 0);
  }

  function createMask() {
    $mask = document.createElement("div");
    $mask.style.display = "none";
    $mask.style.position = "absolute";
    $mask.style.left = "0px";
    $mask.style.top = "0px";
    $mask.style.background = "#000000";
    //IE5不支持。
    //$mask.style.cursor="not-allowed";
    ElementManager.setOpacity($mask, 0.25);
    document.body.appendChild($mask);
    EventManager.bind(window, "resize", setSize);
    setSize();
  }

  function destoryMask() {
    document.body.removeChild($mask);
    EventManager.unbind(window, "resize", setSize);
    $mask = null;
  }

  var $mask = null;
  return function($target) {
    if ($target) {
      if (!$mask) {
        createMask();
      }
      var zIndex = parseInt(ElementManager.getComputedStyle($target, "z-index"), 10);
      if (!zIndex) {
        zIndex = $target.style.zIndex = 100;
      }
      $mask.style.zIndex = zIndex - 1;
      $mask.style.display = "block";
      //屏蔽当前层之外的tabIndex。
      setTabIndex(document.body, -1);
      setTabIndex($target, 0);
    }
    else {
      if ($mask) {
        destoryMask();
      }
      setTabIndex(document.body, 0);
    }
  };
}();
