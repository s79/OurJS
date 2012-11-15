/**
 * @fileOverview Widget - 分页导航条。
 * @author sundongguo@gmail.com
 * @version 20121021
 */

(function() {
//==================================================[Widget - 分页导航条]
//--------------------------------------------------[Paginator]
  /**
   * 分页导航条。
   * @name Paginator
   * @constructor
   * @attribute data-edge-entries
   *   在导航条的两端显示的最多页码数量。
   *   如果不指定本属性，则使用 1 作为默认值。
   * @attribute data-side-entries
   *   在当前页码的两侧显示的最多页码数量。
   *   如果不指定本属性，则使用 2 作为默认值。
   * @attribute data-target-url
   *   点击页码链接后跳转到的地址，在地址字符串中使用 {page} 表示当前页码。
   *   是否指定本属性将导致分页导航条具备不同的行为。
   *   如果指定本属性，即进入“无脚本模式”，此时当点击页码链接时，将直接跳转到指定的 url 地址，而不会触发 turn 事件。<br>这种模式适用的场景为：页面由服务端代码输出，知道 totalPage 和 currentPage（通过设置 data-total-page 和 data-current-page 属性来指定），且翻页时需要刷新页面。<br>在“无脚本模式”下，不必使用任何 JS 代码来处理导航条内容。
   *   如果不指定本属性，即进入“有脚本模式”，此时当点击页码链接时，会触发 turn 事件，但会阻止点击链接的默认行为。<br>这种模式适用的场景为：页面生成时不知道 totalPage 和 currentPage（这种模式下设置 data-total-page 和 data-current-page 属性是无效的），或当翻页时不希望刷新当前页面。<br>在“有脚本模式”下，应当在合适的时间调用 update 方法来更新导航条内容，并在 turn 事件的监听器中进行后续处理。
   * @attribute data-total-page
   *   要分页显示的数据的总页数。
   *   仅在“无脚本模式”下，本属性才有效。
   * @attribute data-current-page
   *   要分页显示的数据的当前页码。
   *   仅在“无脚本模式”下，本属性才有效。
   * @fires turn
   *   {number} targetPage 目标页码。
   *   调用 turn 方法后触发。
   * @fires update
   *   {number} currentPage 当前页码。
   *   {number} totalPage 总页数。
   *   调用 update 方法后触发。
   * @description
   *   为元素添加 'widget-paginator' 类，即可使该元素成为分页导航条。
   *   分页导航条有两种模式：“无脚本模式”和“有脚本模式”。使用哪种模式取决于是否为本元素指定了 data-target-url 属性。
   *   当分页导航条初始化时，会自动创建其内部的元素。
   *   其中“上一页”按钮的类名为 'prev'，“下一页”按钮的类名为 'next'，页码的容器的类名为 'pages'。
   *   如果一个按钮处于禁用状态，将自动为其添加类名 'disabled'。
   *   表示当前页的页码元素将被自动添加类名 'current'。
   */

  /**
   * 总页数。
   * @name Paginator#totalPage
   * @type number
   */

  /**
   * 当前页。
   * @name Paginator#currentPage
   * @type number
   */

  /**
   * 跳转到指定页。
   * @name Paginator#turn
   * @function
   * @param {number} number 目标页码。
   * @returns {Element} 本元素。
   */

  /**
   * 根据当前页和总页数更新导航条内容。
   * @name Paginator#update
   * @function
   * @param {number} currentPage 当前页码。
   * @param {number} totalPage 总页数。
   * @returns {Element} 本元素。
   */

  Widget.register('paginator', {
    css: [
      '.widget-paginator { font-size: 14px; line-height: 16px; text-align: center; }',
      '.widget-paginator a:link, .widget-paginator a:visited, .widget-paginator a:hover, .widget-paginator a:active { display: inline-block; margin: 2px; padding: 2px 5px; border: 1px solid silver; background: white; color: black; text-decoration: none; }',
      '.widget-paginator a:hover { border-color: firebrick; text-decoration: none; }',
      '.widget-paginator a.current:link, .widget-paginator a.current:visited, .widget-paginator a.current:hover, .widget-paginator a.current:active { border-color: firebrick; background: crimson; color: white; }',
      '.widget-paginator a.disabled:link, .widget-paginator a.disabled:visited, .widget-paginator a.disabled:hover, .widget-paginator a.disabled:active { border-color: gainsboro; color: gainsboro; cursor: default; }'
    ],
    config: {
      edgeEntries: 1,
      sideEntries: 2,
      targetUrl: '',
      totalPage: 1,
      currentPage: 1
    },
    methods: {
      turn: function(targetPage) {
        targetPage = Math.limit(targetPage, 1, this.totalPage);
        this.targetPage = targetPage;
        this.fire('turn', {number: targetPage});
        return this;
      },
      update: function(currentPage, totalPage) {
        // 更新 currentPage 和 totalPage。
        this.targetPage = this.currentPage = currentPage = Math.limit(currentPage, 1, totalPage);
        this.totalPage = totalPage;
        // 生成页码 items。
        var edgeEntries = this.edgeEntries;
        var sideEntries = this.sideEntries;
        var ranges = {left: {}, middle: {}, right: {}};
        ranges.left.min = 1;
        ranges.left.max = Math.min(edgeEntries, totalPage);
        ranges.middle.min = Math.max(Math.min(currentPage - sideEntries, totalPage - (sideEntries * 2 + 1)), ranges.left.max + 1);
        ranges.middle.max = Math.min(ranges.middle.min + (sideEntries * 2), totalPage);
        ranges.right.min = Math.max(totalPage - edgeEntries + 1, ranges.middle.max + 1);
        ranges.right.max = totalPage;
        var items = [];
        var n;
        // 左侧数字。
        n = ranges.left.min;
        while (n <= ranges.left.max) {
          items.push(n++);
        }
        // 左侧省略。
        if (ranges.middle.min > ranges.left.max + 1) {
          items.push(NaN);
        }
        // 中部数字。
        n = ranges.middle.min;
        while (n <= ranges.middle.max) {
          items.push(n++);
        }
        // 右侧省略。
        if (ranges.right.min > ranges.middle.max + 1) {
          items.push(NaN);
        }
        // 右侧数字。
        n = ranges.right.min;
        while (n <= ranges.right.max) {
          items.push(n++);
        }
        // 更新导航条内容。
        var targetUrl = this.targetUrl;
        var elements = this.elements;
        if (targetUrl) {
          elements.prevButton.href = currentPage === 1 ? 'javascript:void(\'prev\');' : targetUrl.replace(/{page}/, currentPage - 1);
          elements.nextButton.href = currentPage === totalPage ? 'javascript:void(\'next\');' : targetUrl.replace(/{page}/, currentPage + 1);
        }
        elements.prevButton[currentPage === 1 ? 'addClass' : 'removeClass']('disabled');
        elements.nextButton[currentPage === totalPage ? 'addClass' : 'removeClass']('disabled');
        elements.pageNumberContainer.innerHTML = items
            .map(function(number) {
              return Number.isNaN(number) ? '<span>...</span>' : '<a href="' + (targetUrl ? targetUrl.replace(/{page}/, number) : 'javascript:void(\'' + number + '\');') + '" title="第 ' + number + ' 页"' + (number === currentPage ? ' class="current"' : '') + '>' + number + '</a>';
            })
            .join('');
        // 触发事件。
        this.fire('update', {currentPage: currentPage, totalPage: totalPage});
        return this;
      }
    },
    events: ['turn', 'update'],
    initialize: function() {
      var $element = this;

      // 添加新元素。
      var $prevButton = document.$('<a href="javascript:void(\'prev\');" class="prev">‹ 上一页</a>').insertTo($element);
      var $pageNumberContainer = document.$('<span class="pages"></span>').insertTo($element);
      var $nextButton = document.$('<a href="javascript:void(\'next\');" class="next">下一页 ›</a>').insertTo($element);

      // 保存属性。
      $element.elements = {
        prevButton: $prevButton,
        pageNumberContainer: $pageNumberContainer,
        nextButton: $nextButton
      };
      $element.targetPage = 0;

      // 根据是否配置了 data-target-url 属性确定工作模式。
      var targetUrl = $element.targetUrl;
      if (!targetUrl) {
        $element.totalPage = 0;
        $element.currentPage = 0;
      }

      // 翻到上一页/下一页。
      $prevButton.on('click.paginator', function(event) {
        if (!targetUrl) {
          if (!this.hasClass('disabled')) {
            $element.turn($element.targetPage - 1);
          }
          event.preventDefault();
        }
      });
      $nextButton.on('click.paginator', function(event) {
        if (!targetUrl) {
          if (!this.hasClass('disabled')) {
            $element.turn($element.targetPage + 1);
          }
          event.preventDefault();
        }
      });

      // 翻到指定页。
      $pageNumberContainer.on('click.paginator:relay(a)', function(event) {
        if (!targetUrl) {
          $element.turn(Number.toInteger(this.innerText));
          event.preventDefault();
        }
      });

      // “无脚本模式”，自动更新导航条内容。
      if (targetUrl) {
        $element.update($element.currentPage, $element.totalPage);
      }

    }
  });

})();
