/**
 * @fileOverview 组件 - 分页导航条。
 * @author sundongguo@gmail.com
 * @version 20120516
 */
execute(function($) {
//==================================================[Pagination]
  /*
   * 创建分页导航条。
   */

//--------------------------------------------------[Pagination Constructor]
  /**
   * 根据当前页码和总页数创建分页导航条。
   * @name Pagination
   * @constructor
   * @param {Element} element 要创建分页导航条的目标元素。
   * @param {Object} [options] 可选参数。
   * @param {number} options.edgeEntries 在导航条的两端显示的最多页码数量，默认为 1。
   * @param {number} options.sideEntries 在当前页码的两侧显示的最多页码数量，默认为 2。
   * @param {string} options.prevText 向前翻页按钮的文字，默认为 '上一页'。
   * @param {string} options.nextText 向后翻页按钮的文字，默认为 '下一页'。
   * @fires turn
   *   {number} number 目标页码。
   *   调用 turnTo 方法时触发。
   * @description
   *   创建分页组件时使用的 DOM 结构如下：
   *   向前翻页按钮 = A.prev
   *   向后翻页按钮 = A.next
   *   省略的页码 = SPAN
   *   显示的页码 = A.number
   *   高级应用：根据情况配置样式表，以满足各种需要。
   */
  function Pagination(element, options) {
    var pagination = this;
    // 未执行 render 方法时，默认当前页及总页数均为 1。
    pagination.currentPage = 1;
    pagination.totalPage = 1;
    // 绑定事件。
    pagination.element = $(element).on('click', function(e) {
      if (!this.hasClass('disabled')) {
        if (this.hasClass('number')) {
          pagination.turnTo(Number.toInteger(this.innerText));
        } else if (this.hasClass('prev')) {
          pagination.turnTo(--pagination.currentPage);
        } else if (this.hasClass('next')) {
          pagination.turnTo(++pagination.currentPage);
        }
      }
      return false;
    }, function() {
      return this.nodeName === 'A';
    });
    // 保存选项。
    pagination.setOptions(options);
  }

//--------------------------------------------------[Pagination.options]
  /**
   * 默认选项。
   * @name Pagination.options
   * @description
   *   可选参数对象，包含的属性及其默认值为：
   *   <table>
   *     <tr><th>edgeEntries</th><td>1</td></tr>
   *     <tr><th>sideEntries</th><td>2</td></tr>
   *     <tr><th>prevText</th><td>'上一页'</td></tr>
   *     <tr><th>nextText</th><td>'下一页'</td></tr>
   *     <tr><th>currentClassName</th><td>'current'</td></tr>
   *     <tr><th>disabledClassName</th><td>'disabled'</td></tr>
   *   </table>
   */
  Pagination.options = {
    edgeEntries: 1,
    sideEntries: 2,
    prevText: '上一页',
    nextText: '下一页',
    currentClassName: 'current',
    disabledClassName: 'disabled'
  };

//--------------------------------------------------[Pagination.prototype.turnTo]
  /**
   * 跳转页码。
   * @name Pagination.prototype.turnTo
   * @function
   * @param {number} number 目标页码。
   * @returns {Object} Pagination 对象。
   */
  Pagination.prototype.turnTo = function(number) {
    number = Math.limit(number, 1, this.totalPage);
    this.currentPage = number;
    this.fire('turn', {number: number});
    return this;
  };

//--------------------------------------------------[Pagination.prototype.render]
  /**
   * 根据当前页和总页数渲染分页导航条。
   * @name Pagination.prototype.render
   * @function
   * @param {number} currentPage 当前页。
   * @param {number} totalPage 总页数。
   * @returns {Object} Pagination 对象。
   */
  Pagination.prototype.render = function(currentPage, totalPage) {
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
    var html = items.map(function(number) {
      return Number.isNaN(number) ? '<span>...</span>' : '<a href="javascript:void(\'' + number + '\');" title="第 ' + number + ' 页" class="number' + (number === currentPage ? ' current' : '') + '">' + number + '</a>';
    });
    html.unshift('<a href="javascript:void(\'prev\');" title="上一页" class="prev' + (currentPage === 1 ? ' disabled' : '') + '">' + options.prevText + '</a>');
    html.push('<a href="javascript:void(\'next\');" title="下一页" class="next' + (currentPage === totalPage ? ' disabled' : '') + '">' + options.nextText + '</a>');
    this.element.innerHTML = html.join('');

    return this;
  };

//--------------------------------------------------[Pagination]
  window.Pagination = new Component(Pagination, Pagination.options, Pagination.prototype);

});
