/**
 * @fileOverview Widget - 分页导航条
 * @author sundongguo@gmail.com
 * @version 20121021
 */

(function() {
//==================================================[Widget - 分页导航条]
//--------------------------------------------------[createNavigationLinks]
  var createNavigationLinks = function($paginator, currentPage, totalPages) {
    // 更新 currentPage 和 totalPages。
    $paginator.targetPage = $paginator.currentPage = currentPage = Math.limit(currentPage, 1, $paginator.totalPages = totalPages = Math.max(totalPages, 1));
    // 生成页码 pages。
    var endpointPages = $paginator.endpointPages;
    var adjacentPages = $paginator.adjacentPages;
    var ranges = {left: {}, middle: {}, right: {}};
    ranges.left.min = 1;
    ranges.left.max = Math.min(endpointPages, totalPages);
    ranges.middle.min = Math.max(Math.min(currentPage - adjacentPages, totalPages - (adjacentPages * 2 + 1)), ranges.left.max + 1);
    ranges.middle.max = Math.min(ranges.middle.min + (adjacentPages * 2), totalPages);
    ranges.right.min = Math.max(totalPages - endpointPages + 1, ranges.middle.max + 1);
    ranges.right.max = totalPages;
    var pages = [];
    var n;
    // 左侧数字。
    n = ranges.left.min;
    while (n <= ranges.left.max) {
      pages.push(n++);
    }
    // 左侧省略。
    if (ranges.middle.min > ranges.left.max + 1) {
      pages.push(NaN);
    }
    // 中部数字。
    n = ranges.middle.min;
    while (n <= ranges.middle.max) {
      pages.push(n++);
    }
    // 右侧省略。
    if (ranges.right.min > ranges.middle.max + 1) {
      pages.push(NaN);
    }
    // 右侧数字。
    n = ranges.right.min;
    while (n <= ranges.right.max) {
      pages.push(n++);
    }
    // 创建“导航链接”。
    var targetUrl = $paginator.targetUrl;
    var elements = $paginator.elements;
    if (targetUrl) {
      elements.prevButton.href = currentPage === 1 ? 'javascript:void(\'prev\');' : targetUrl.replace(/{page}/, currentPage - 1);
      elements.nextButton.href = currentPage === totalPages ? 'javascript:void(\'next\');' : targetUrl.replace(/{page}/, currentPage + 1);
    }
    elements.prevButton[currentPage === 1 ? 'addClass' : 'removeClass']('disabled');
    elements.nextButton[currentPage === totalPages ? 'addClass' : 'removeClass']('disabled');
    elements.pages.innerHTML = pages
        .map(function(number) {
          return Number.isNaN(number) ? '<span>...</span>' : '<a href="' + (targetUrl ? targetUrl.replace(/{page}/, number) : 'javascript:void(\'' + number + '\');') + '" title="第 ' + number + ' 页"' + (number === currentPage ? ' class="current"' : '') + '>' + number + '</a>';
        })
        .join('');
    // 使“分页导航条”可见。
    $paginator.setStyle('visibility', 'visible');
    return $paginator;
  };

//--------------------------------------------------[Paginator]
  /**
   * “分页导航条”用于生成数据分页时的“导航链接”，可以满足以下两种场景的需求：
   * * 对于服务端输出的静态页，应将当前页码和总页数输出为 <dfn>data-current-page</dfn> 和 <dfn>data-total-pages</dfn> 属性的值，以直接生成“导航链接”。此外，还应指定 <dfn>data-target-url</dfn>，以使每个“导航链接”都可以像普通链接一样被点击。
   *   在这种情况下，不必编写任何 JS 代码来做其他处理。
   * * 对于一个富应用页面，上述三个属性均不必指定。
   *   当使用脚本获得了当前页码和总页数后，应通过调用 update 方法来创建“导航链接”。
   *   当一个“导航链接”被点击时，会自动调用 turn 方法并触发 turn 事件，对于本次点击行为的处理可以在该事件的监听器中进行。
   * @启用方式
   *   为一个 DIV 元素添加 'widget-paginator' 类，即可使该元素成为“分页导航条”。
   * @结构约定
   *   <div class="widget-paginator"></div>
   *   * “分页导航条”会在其内部<strong>自动创建</strong>“导航链接”，其中“上一页”的类名为 'prev'，“下一页”的类名为 'next'，“当前页码”的类名为 'current'。
   * @默认样式
   *   div.widget-paginator { visibility: hidden; font-size: 14px; line-height: 16px; text-align: center; }
   *   div.widget-paginator a:link, div.widget-paginator a:visited, div.widget-paginator a:hover, div.widget-paginator a:active { display: inline-block; margin: 2px; padding: 2px 5px; border: 1px solid silver; background-color: white; color: black; text-decoration: none; }
   *   div.widget-paginator a:hover { border-color: gray; background-color: gainsboro; }
   *   div.widget-paginator a:active { border-color: dimgray; background-color: silver; }
   *   div.widget-paginator a.current:link, div.widget-paginator a.current:visited, div.widget-paginator a.current:hover, div.widget-paginator a.current:active { border-color: black; background-color: steelblue; color: white; }
   *   div.widget-paginator a.disabled:link, div.widget-paginator a.disabled:visited, div.widget-paginator a.disabled:hover, div.widget-paginator a.disabled:active { border-color: gainsboro; background-color: white; color: gainsboro; cursor: default; }
   * @可配置项
   *   data-current-page
   *     当前页码。
   *     只有本属性和 data-total-pages 一并指定时才有效。
   *   data-total-pages
   *     总页数。
   *     如果同时指定了 data-current-page 和本属性，则对 update 方法的调用将失效，“导航链接”会在“分页导航条”被解析后将自动生成。
   *   data-target-url
   *     点击“导航链接”后跳转到的地址，其中应包含子串 '{page}'，该子串将在生成链接时被替换为页码数字。
   *     如果指定了本属性，则对 turn 方法的调用将失效，当点击一个“导航链接”时，浏览器将直接跳转到对应的链接地址。
   *     如果不指定本属性，当点击一个“导航链接”时，会自动调用 turn 方法，并将对应的页码作为参数传入。
   *   data-endpoint-pages
   *     在导航条的两端最多可以显示的“导航链接”数量。
   *     如果不指定本属性，则使用 1 作为默认值。
   *   data-adjacent-pages
   *     在当前页码的两侧最多可以显示的“导航链接”数量。
   *     如果不指定本属性，则使用 2 作为默认值。
   * @新增行为
   * * “分页导航条”在创建“导航链接”之前是不可见的。
   * * “分页导航条”被解析时，会根据各配置参数决定主动或被动的创建各“导航链接”。
   * * 点击“导航链接”时，会根据 data-target-url 的配置执行相应的操作。
   *   如果没有指定 data-target-url，则在“导航链接”上发生的 click 事件的默认行为将被阻止。
   * * 如果“上一页”或“下一页”处于禁用状态，将为其添加类名 'disabled'。
   * @新增属性
   *   {number} currentPage 当前页码。
   *   {number} totalPages 总页数。
   * @新增方法
   *   update
   *     根据当前页码和总页数创建“导航链接”。
   *     仅当没有配置 data-current-page 和 data-total-pages 时，调用本方法才有效。
   *     参数：
   *       {number} currentPage 当前页码。
   *       {number} totalPages 总页数。
   *     返回值：
   *       {Element} 本元素。
   *   turn
   *     跳转到指定页。
   *     仅当没有配置 data-target-url 时，调用本方法才有效。
   *     当主动调用本方法时，targetPage 可能超过当前客户端保存的 totalPages。因此需要服务端做必要的容错处理，以确保能够正常的返回数据。
   *     参数：
   *       {number} number 目标页码。
   *     返回值：
   *       {Element} 本元素。
   * @新增事件
   *   update
   *     成功调用 update 方法后触发。
   *     属性：
   *       {number} currentPage 当前页码。
   *       {number} totalPages 总页数。
   *   turn
   *     成功调用 turn 方法后触发。
   *     属性：
   *       {number} targetPage 目标页码。
   */

  Widget.register({
    type: 'paginator',
    selector: 'div.widget-paginator',
    styleRules: [
      'div.widget-paginator { visibility: hidden; font-size: 14px; line-height: 16px; text-align: center; }',
      'div.widget-paginator a:link, div.widget-paginator a:visited, div.widget-paginator a:hover, div.widget-paginator a:active { display: inline-block; margin: 2px; padding: 2px 5px; border: 1px solid silver; background-color: white; color: black; text-decoration: none; }',
      'div.widget-paginator a:hover { border-color: gray; background-color: gainsboro; }',
      'div.widget-paginator a:active { border-color: dimgray; background-color: silver; }',
      'div.widget-paginator a.current:link, div.widget-paginator a.current:visited, div.widget-paginator a.current:hover, div.widget-paginator a.current:active { border-color: black; background-color: steelblue; color: white; }',
      'div.widget-paginator a.disabled:link, div.widget-paginator a.disabled:visited, div.widget-paginator a.disabled:hover, div.widget-paginator a.disabled:active { border-color: gainsboro; background-color: white; color: gainsboro; cursor: default; }'
    ],
    config: {
      currentPage: NaN,
      totalPages: NaN,
      targetUrl: '',
      endpointPages: 1,
      adjacentPages: 2
    },
    methods: {
      update: function(currentPage, totalPages) {
        if (this.updateEnabled) {
          createNavigationLinks(this, currentPage, totalPages);
          this.fire('update', {currentPage: this.currentPage, totalPages: this.totalPages});
        }
        return this;
      },
      turn: function(targetPage) {
        if (this.turnEnabled) {
          targetPage = Math.max(targetPage, 1);
          this.targetPage = targetPage;
          this.fire('turn', {number: targetPage});
        }
        return this;
      }
    },
    initialize: function() {
      var $paginator = this;

      // 添加新元素。
      var $prevButton = document.$('<a href="javascript:void(\'prev\');" class="prev">‹ 上一页</a>').insertTo($paginator);
      var $pages = document.$('<span></span>').insertTo($paginator);
      var $nextButton = document.$('<a href="javascript:void(\'next\');" class="next">下一页 ›</a>').insertTo($paginator);

      // 保存属性。
      $paginator.elements = {
        prevButton: $prevButton,
        pages: $pages,
        nextButton: $nextButton
      };
      $paginator.targetPage = NaN;
      $paginator.updateEnabled = !($paginator.currentPage && $paginator.totalPages);
      $paginator.turnEnabled = !$paginator.targetUrl;

      // 如果启用了 update 方法，则任何已设定的当前页码和总页数都无效。否则根据它们的配置立即创建“导航链接”。
      if ($paginator.updateEnabled) {
        $paginator.currentPage = $paginator.totalPages = NaN;
      } else {
        createNavigationLinks($paginator, $paginator.currentPage, $paginator.totalPages);
      }

      // 仅当启用了 turn 方法时才使用脚本处理。
      if ($paginator.turnEnabled) {
        // 翻到上一页/下一页。
        $prevButton.on('click.paginator', function(e) {
          if (!this.hasClass('disabled')) {
            $paginator.turn($paginator.targetPage - 1);
          }
          e.preventDefault();
        });
        $nextButton.on('click.paginator', function(e) {
          if (!this.hasClass('disabled')) {
            $paginator.turn($paginator.targetPage + 1);
          }
          e.preventDefault();
        });
        // 翻到指定页。
        $pages.on('click:relay(a).paginator', function(e) {
          $paginator.turn(Number.toInteger(this.innerText));
          e.preventDefault();
        });
      }

    }
  });

})();
