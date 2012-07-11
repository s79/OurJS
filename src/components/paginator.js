/**
 * @fileOverview 组件 - 分页导航条。
 * @author sundongguo@gmail.com
 * @version 20120516
 */
execute(function($) {
//==================================================[Paginator]
  /*
   * 创建分页导航条。
   */

//--------------------------------------------------[Paginator Constructor]
  /**
   * 根据当前页码和总页数创建分页导航条。
   * @name Paginator
   * @constructor
   * @param {Element} element 要创建分页导航条的目标元素。
   * @param {Object} [options] 可选参数。
   * @param {number} options.edgeEntries 在导航条的两端显示的最多页码数量，默认为 1。
   * @param {number} options.sideEntries 在当前页码的两侧显示的最多页码数量，默认为 2。
   * @param {string} options.prevText 向前翻页按钮的文字，默认为 '上一页'。
   * @param {string} options.nextText 向后翻页按钮的文字，默认为 '下一页'。
   * @param {string} options.currentClassName 为当前页码添加的类名，默认为 'current'。
   * @param {string} options.disabledClassName 为禁用的翻页按钮添加的类名，默认为 'disabled'。
   * @fires turn
   *   {number} number 目标页码。
   *   成功调用 turn 方法后触发。
   * @fires render
   *   {number} currentPage 当前页码。
   *   {number} totalPage 总页数。
   *   成功调用 render 方法后触发。
   * @description
   *   创建分页组件时使用的 DOM 结构如下：
   *   向前翻页按钮 = A.prev
   *   向后翻页按钮 = A.next
   *   省略的页码 = SPAN
   *   显示的页码 = A.number
   *   高级应用：根据情况配置样式表，以满足各种需要。
   */
  function Paginator(element, options) {
    var pagination = this;

    // 保存属性。未执行 render 方法时，默认当前页及总页数均为 1。
    pagination.currentPage = 1;
    pagination.totalPage = 1;

    // 保存选项。
    pagination.setOptions(options);

    // 绑定事件。
    pagination.element = $(element).on('click:relay(a)', function() {
      if (!this.hasClass('disabled')) {
        if (this.hasClass('number')) {
          pagination.turn(Number.toInteger(this.innerText));
        } else if (this.hasClass('prev')) {
          pagination.turn(--pagination.currentPage);
        } else if (this.hasClass('next')) {
          pagination.turn(++pagination.currentPage);
        }
      }
      return false;
    });

  }

//--------------------------------------------------[Paginator.options]
  /**
   * 默认选项。
   * @name Paginator.options
   */
  Paginator.options = {
    edgeEntries: 1,
    sideEntries: 2,
    prevText: '上一页',
    nextText: '下一页',
    currentClassName: 'current',
    disabledClassName: 'disabled'
  };

//--------------------------------------------------[Paginator.prototype.turn]
  /**
   * 跳转页码。
   * @name Paginator.prototype.turn
   * @function
   * @param {number} number 目标页码。
   * @returns {Object} Paginator 对象。
   * @description
   *   如果目标页码与当前页码相同，则调用此方法无效。
   */
  Paginator.prototype.turn = function(number) {
    number = Math.limit(number, 1, this.totalPage);
    if (number !== this.currentPage) {
      this.currentPage = number;
      this.fire('turn', {number: number});
    }
    return this;
  };

//--------------------------------------------------[Paginator.prototype.render]
  /**
   * 根据当前页和总页数渲染分页导航条。
   * @name Paginator.prototype.render
   * @function
   * @param {number} currentPage 当前页码。
   * @param {number} totalPage 总页数。
   * @returns {Object} Paginator 对象。
   * @description
   *   如果 currentPage 和 totalPage 与当前页码和总页数相同，则调用此方法无效。
   */
  Paginator.prototype.render = function(currentPage, totalPage) {
    if (currentPage !== this.currentPage && totalPage !== this.totalPage) {
      var options = this.options;

      // 更新 currentPage 和 totalPage。
      this.currentPage = currentPage = Math.limit(currentPage, 1, totalPage);
      this.totalPage = totalPage;

      // 生成页码 items。
      var edgeEntries = options.edgeEntries;
      var sideEntries = options.sideEntries;
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

      // 渲染导航条。
      var disabledClassName = options.disabledClassName;
      var html = items.map(function(number) {
        return Number.isNaN(number) ? '<span>...</span>' : '<a href="javascript:void(\'' + number + '\');" title="第 ' + number + ' 页" class="number' + (number === currentPage ? ' current' : '') + '">' + number + '</a>';
      });
      html.unshift('<a href="javascript:void(\'prev\');" title="上一页" class="prev' + (currentPage === 1 ? ' ' + disabledClassName : '') + '">' + options.prevText + '</a>');
      html.push('<a href="javascript:void(\'next\');" title="下一页" class="next' + (currentPage === totalPage ? ' ' + disabledClassName : '') + '">' + options.nextText + '</a>');
      this.element.innerHTML = html.join('');

      // 触发事件。
      this.fire('render', {currentPage: currentPage, totalPage: totalPage});

    }

    return this;
  };

//--------------------------------------------------[Paginator]
  window.Paginator = new Component(Paginator, Paginator.options, Paginator.prototype);

});
