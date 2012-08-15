execute(function($) {
//--------------------------------------------------[菜单数据]
  var menuData = [
    {
      text: '简介',
      url: '/OurJS/intro/'
    },
    {
      text: '入门指南',
      url: '/OurJS/getting_started/'
    },
    {
      text: '演示',
      url: '/OurJS/demos/',
      submenu: [
        {
          text: 'DOM',
          url: '/OurJS/demos/dom/'
        },
        {
          text: '事件',
          url: '/OurJS/demos/event/'
        },
        {
          text: '动画',
          url: '/OurJS/demos/animation/'
        },
        {
          text: 'Ajax',
          url: '/OurJS/demos/request/'
        },
        {
          text: '存储',
          url: '/OurJS/demos/storage/'
        },
        {
          text: '浏览器信息',
          url: '/OurJS/demos/navigator/'
        }
      ]
    },
    {
      text: 'UI 组件',
      url: '/OurJS/components/',
      submenu: [
        {
          text: '标签面板',
          url: '/OurJS/components/tabpanel/'
        },
        {
          text: '幻灯片播放',
          url: '/OurJS/components/slideshow/'
        },
        {
          text: '模态对话框',
          url: '/OurJS/components/dialog/'
        },
        {
          text: '分页导航条',
          url: '/OurJS/components/paginator/'
        },
        {
          text: '月历 &amp; 日期选择器',
          url: '/OurJS/components/calendar/'
        },
        {
          text: '表单验证',
          url: '/OurJS/components/validator/'
        }
      ]
    },
    {
      text: '参考文档',
      url: '/OurJS/docs/',
      submenu: [
        {
          text: 'API 参考',
          url: '/OurJS/docs/api.html'
        },
        {
          text: 'DOM 事件列表',
          url: '/OurJS/docs/events.html'
        },
        {
          text: '140 个预命名颜色列表',
          url: '/OurJS/docs/colors.html'
        }
      ]
    }
  ];

//--------------------------------------------------[页头]
  $('<div id="header"><div><h1 id="logo"><span>OurJS</span></h1><h2 id="github"><a href="https://github.com/s79/OurJS"><span>OurJS on GitHub</span></a></h2><ul id="menu"></ul></div></div>').insertTo(document.body, 'top');
  if (navigator.isIE6) {
    $('#header').setStyle('position', 'fixed');
  }

  // 生成菜单。
  var pathname = location.pathname;
  var isCurrent = function(href) {
    return pathname.contains(href);
  };
  var getMenuHTML = function(menu) {
    var html = '';
    menu.forEach(function(menu) {
      html = html.concat('<li><a href="' + menu.url + '"' + (isCurrent(menu.url) ? ' class="current"' : '') + '>' + menu.text + '</a>' + (menu.submenu ? '<ul>' + getMenuHTML(menu.submenu) + '</ul>' : '') + '</li>');
    });
    return html;
  };
  var $menu = $('#menu');
  $menu.innerHTML = getMenuHTML(menuData);
  $menu.getFirstChild().addClass('first');
  $menu.find('ul').forEach(function($ul) {
    var $li = $ul.getParent();
    if ($li.getParent() !== $menu) {
      $li.getFirstChild().addClass('folder');
    }
  });

  // 简易多级菜单，未考虑溢出视口的情况。
  var isIE6 = navigator.isIE6;
  $menu
      .on('mouseenter:relay(li)', function() {
        if (isIE6) {
          this.addClass('hover');
        }
        var $ul;
        if ($ul = this.getFirstChild().getNextSibling()) {
          if (isIE6) {
            $ul.setStyle('display', 'block');
          } else {
            $ul.fadeIn();
          }
        }
      })
      .on('mouseleave:relay(li)', function() {
        if (isIE6) {
          this.removeClass('hover');
        }
        var $ul;
        if ($ul = this.getFirstChild().getNextSibling()) {
          if (isIE6) {
            $ul.setStyle('display', 'none');
          } else {
            $ul.fadeOut();
          }
        }
      });

//--------------------------------------------------[页脚]
  $('<div id="footer"><span>©2012 <a href="https://github.com/s79">s79</a>. Released under the <a href="http://www.opensource.org/licenses/mit-license.php" target="_blank">MIT license</a>.</span></div>').insertTo(document.body);

//--------------------------------------------------[书签]
  document.on('click:relay(a)', function() {
    var href = this.href;
    if (href.contains('#')) {
      var $target = $(href.slice(href.indexOf('#')));
      if ($target) {
        var scrollTop = window.getPageOffset().y;
        var top = $target.getClientRect().top + scrollTop;
        new Animation()
            .addClip(
            Animation.createBasicRenderer(function(x, y) {
              window.scrollTo(0, scrollTop + ((top - 50) - scrollTop) * y);
            }), 0, 200, 'easeInOut')
            .on('playfinish', function() {
              $target.highlight('yellow', 'backgroundColor', {duration: 1000})
            })
            .play();
        return false;
      }
    }
  });

//--------------------------------------------------[提纲]
  var $content = $('#content');

  if ($content.getData('outline') === 'enabled') {
    // 创建“显示提纲”按钮。
    var $outline = $('<div id="outline"><a href="javascript:void(\'shownOutline\');" class="control">提纲</a><div><ul></ul></div></div>');
    $outline.setStyle('position', 'fixed').insertTo(document.body);

    // 注入提纲。
    var $outlineList = $outline.getLastChild().getFirstChild();
    // 若标题没有 id 则为其指定一个 id，注意此 id 与标题的位置有关，因此不宜作为书签使用。
    var uid = 12960;
    $content.find('h1, h2 ,h3, dt').forEach(function($heading) {
      if (!$heading.id) {
        $heading.id = (uid++).toString(36);
      }
      $('<li class="' + $heading.nodeName.toLowerCase() + '"><a href="#' + $heading.id + '">' + $heading.innerText + '</a></li>').insertTo($outlineList);
    });

    // 定位及显示。
    var heightProperty = navigator.isIE6 ? 'height' : 'maxHeight';
    window
        .on('resize', function() {
          var viewportSize = window.getClientSize();
          var viewportWidth = viewportSize.width;
          var viewportHeight = viewportSize.height;
          if (viewportWidth < 1110 || viewportHeight < 300) {
            $outline.setStyle('display', 'none');
          } else {
            $outline.setStyles({display: 'block', left: $content.getClientRect().right + 10, top: Math.floor(Math.min(viewportHeight / 3, 120))});
            $outlineList.setStyle(heightProperty, viewportHeight - 150);
          }
        })
        .fire('resize');
    $outline
        .on('mouseenter', function() {
          this.addClass('shown');
        })
        .on('mouseleave', function() {
          this.removeClass('shown');
        });

  }

}, true);
