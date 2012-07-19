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
   * 分页导航条。
   * @name Paginator
   * @constructor
   * @param {Object} elements 相关元素。
   * @param {Element} elements.prev “上一页”按钮。
   * @param {Element} elements.next “下一页”按钮。
   * @param {Element} elements.pages 页码的容器，用于容纳每次渲染后生成的页码元素。
   * @param {Object} [options] 可选参数。
   * @param {number} options.edgeEntries 在导航条的两端显示的最多页码数量，默认为 1。
   * @param {number} options.sideEntries 在当前页码的两侧显示的最多页码数量，默认为 2。
   * @param {string} options.disabledClassName 为禁用的翻页按钮添加的类名，默认为 'disabled'。
   * @param {string} options.currentClassName 为当前页码添加的类名，默认为 'current'。
   * @fires turn
   *   {number} number 目标页码。
   *   成功调用 turn 方法后触发。
   * @fires render
   *   {number} currentPage 当前页码。
   *   {number} totalPage 总页数。
   *   成功调用 render 方法后触发。
   */
  var Paginator = new Component(function(elements) {
    var paginator = this;

    // 获取选项。
    var options = paginator.options;

    // 保存属性。
    paginator.elements = elements;
    paginator.targetPage = 0;
    paginator.currentPage = 0;
    paginator.totalPage = 0;

    // 翻到上一页/下一页。
    elements.prev.on('click', function() {
      if (!this.hasClass(options.disabledClassName)) {
        paginator.turn(paginator.targetPage - 1);
      }
    });
    elements.next.on('click', function() {
      if (!this.hasClass(options.disabledClassName)) {
        paginator.turn(paginator.targetPage + 1);
      }
    });

    // 翻到指定页。
    elements.pages.on('click:relay(a)', function() {
      paginator.turn(Number.toInteger(this.innerText));
    });

  });

//--------------------------------------------------[Paginator.options]
  /**
   * 默认选项。
   * @name Paginator.options
   */
  Paginator.options = {
    edgeEntries: 1,
    sideEntries: 2,
    disabledClassName: 'disabled',
    currentClassName: 'current'
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
    if (number !== this.targetPage) {
      this.targetPage = number;
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
    if (currentPage !== this.currentPage || totalPage !== this.totalPage) {
      var elements = this.elements;
      var options = this.options;

      // 更新 currentPage 和 totalPage。
      this.targetPage = this.currentPage = currentPage = Math.limit(currentPage, 1, totalPage);
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
      var currentClassName = options.currentClassName;
      elements.prev[currentPage === 1 ? 'addClass' : 'removeClass'](disabledClassName);
      elements.next[currentPage === totalPage ? 'addClass' : 'removeClass'](disabledClassName);
      elements.pages.innerHTML = items.map(function(number) {
        return Number.isNaN(number) ? '<span>...</span>' : '<a href="javascript:void(\'' + number + '\');" title="第 ' + number + ' 页"' + (number === currentPage ? ' class="' + currentClassName + '"' : '') + '>' + number + '</a>';
      }).join('');

      // 触发事件。
      this.fire('render', {currentPage: currentPage, totalPage: totalPage});

    }

    return this;

  };

//--------------------------------------------------[Paginator]
  window.Paginator = Paginator;

});
