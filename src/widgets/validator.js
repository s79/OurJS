/**
 * @fileOverview Widget - 表单验证器。
 * @author sundongguo@gmail.com
 * @version 20121008
 */

(function() {
//==================================================[Widget - 表单验证器]
//--------------------------------------------------[checkType]
  var checkType = {
    number: function(value) {
      return !value || /^([+-]?\d+)(\.\d+)?$/.test(value);
    },
    date: function(value) {
      return !value || value === Date.from(value).format();
    },
    email: function(value) {
      return !value || /^([\w-])+@([\w-])+((\.[\w-]+){1,3})$/.test(value);
    },
    phone: function(value) {
      return !value || /^\d{11}?$/.test(value);
    }
  };

//--------------------------------------------------[validateField]
  var validateField = function($form, name) {
    var validationResultSet = $form.validationResultSet;
    var rules = $form.validationRulesets[name];
    var value = $form.getFieldValue(name);
    var errorMessage = '';
    var rule;
    validationResultSet[name] = undefined;
    $form.fire('fieldvalidate', {name: name, value: value});
    if ((rule = rules.required) && rule[0] && value.length === 0) {
      errorMessage = rule[1] || 'required';
    }
    if (!errorMessage && (rule = rules.equals) && value !== $form.getFieldValue(rule[0])) {
      errorMessage = rule[1] || 'equals';
    }
    if (!errorMessage && (rule = rules.minLength) && value.length < rule[0]) {
      errorMessage = rule[1] || 'minLength';
    }
    if (!errorMessage && (rule = rules.maxLength) && value.length > rule[0]) {
      errorMessage = rule[1] || 'maxLength';
    }
    if (!errorMessage && (rule = rules.type) && !checkType[rule[0]](value)) {
      errorMessage = rule[1] || 'type';
    }
    if (!errorMessage && rules.custom) {
      errorMessage = rules.custom.call($form, value);
    }
    var remote = rules.remote;
    if (!errorMessage && remote) {
      if (rules.lastRequest) {
        rules.lastRequest.off('finish').abort();
      }
      var requestData = {};
      requestData[remote.valueKey] = value;
      rules.lastRequest = new Request(remote.url, remote.options)
          .on('finish', function(e) {
            delete rules.lastRequest;
            var errorMessage = remote.validateResult(e);
            validationResultSet[name] = !errorMessage;
            $form.fire('fieldvalidated', {name: name, value: value, errorMessage: errorMessage});
          })
          .send(requestData);
    } else {
      validationResultSet[name] = !errorMessage;
      $form.fire('fieldvalidated', {name: name, value: value, errorMessage: errorMessage});
    }
  };

//--------------------------------------------------[Validator]
  /**
   * 表单验证器。
   * @name Validator
   * @constructor
   * @fires fieldvalidate
   *   {string} name 验证的表单域的名称。
   *   {string|Array} value 验证的表单域的值。
   *   当开始验证一个表单域时触发。
   * @fires fieldvalidated
   *   {string} name 验证的表单域的名称。
   *   {string|Array} value 验证的表单域的值。
   *   {string} errorMessage “错误信息”字符串，为空则表示验证通过。
   *   在一个表单域验证结束后触发。
   * @fires validate
   *   当表单验证开始时（即表单的 submit 事件发生时）触发。
   * @fires validated
   *   {boolean} result 验证结果，仅当所有已配置的规则均验证通过时为 true，否则为 false。
   *   在表单验证结束后触发。
   * @description
   *   <strong>应用场景：</strong>
   *   需要对一个表单的用户输入部分进行验证，并在不同的状态下显示相应的提示信息。
   *   <strong>使用方法：</strong>
   *   为 FORM 元素添加 'widget-validator' 类，即可使该元素成为表单验证器。
   *   其子元素中包含类名 'messages' 的为“提示信息的容器”，该元素还应指定 data-for="<var>name</var>" 属性，<var>name</var> 为该提示信息对应的表单域的名称。
   *   <strong>新增特性：</strong>
   *   该表单的 submit 事件的默认行为将被阻止。
   *   如果一个表单域配置了验证规则，当其中包含的任何控件的值被用户改变时，都将自动对该表单域进行验证，并触发 fieldvalidate 事件，验证结束后会触发 fieldvalidated 事件。根据验证结果，会在指定的位置显示提示信息。
   *   当表单的 submit 事件发生时，会自动对所有配置的验证规则涉及到的、且尚未验证的表单域进行验证，并触发 validate 事件，验证结束后会触发 validated 事件。如果没有需要服务端验证的表单域，validated 事件将同步触发，否则 validated 事件将在所有的服务端验证结束后异步触发。
   *   在等待的所有服务端验证尚未结束前，如果用户修改了任一控件的值，则会立即取消当前的服务端验证，并触发 validated 事件，本次验证按失败处理。
   *   对提交行为的后续处理应在该表单的 validated 事件监听器中根据验证结果进行。
   *   当该表单触发 reset 事件时，当前的验证结果和所有已显示的提示信息也会随之重置。
   *   要手动验证某一个表单域，触发其中任一控件的 change 事件即可。
   */

  /**
   * 添加验证规则。
   * @name Validator#addValidationRules
   * @function
   * @param {Object} rules 要验证的表单域的名称及规则，格式为 <dfn>{<var>name</var>: <var>rules</var>, ...}</dfn>。
   *   属性名 <var>name</var> 为要验证的表单域的名称。
   *   属性值 <var>rules</var> 为定义验证规则的对象，包括 5 种预置规则和 2 种自定规则。详情如下：
   *   <table>
   *     <tr><th>验证方式</th><th>值类型</th><th>详细描述</th></tr>
   *     <tr><td><dfn>required</dfn></td><td>boolean</td><td>限定该表单域是否为必填项或必选项。</td></tr>
   *     <tr><td><dfn>equals</dfn></td><td>string</td><td>限定该表单域的值与相关表单域的值一致，仅应在这两个表单域均只包含一个文本控件时指定。相关表单域不能为该表单域自身。</td></tr>
   *     <tr><td><dfn>minLength</dfn></td><td>number</td><td>当该表单域只包含一个文本控件时，限定输入文本的最小长度，否则限定选择项的最少数目。</td></tr>
   *     <tr><td><dfn>maxLength</dfn></td><td>number</td><td>当该表单域只包含一个文本控件时，限定输入文本的最大长度，否则限定选择项的最多数目。</td></tr>
   *     <tr><td><dfn>type</dfn></td><td>Array</td><td>限定数据的类型，值可以为 '<dfn>number</dfn>'、'<dfn>date</dfn>'、'<dfn>email</dfn>'、'<dfn>phone</dfn>' 中的任一个。</td></tr>
   *     <tr><td><dfn>custom</dfn></td><td>Function</td><td>用来对该表单域的值进行进一步验证的函数，该函数被调用时传入该表单域的值，其 this 的值为本表单元素，返回值应为一个“错误信息”字符串，为空则表示验证通过。</td></tr>
   *     <tr><td><dfn>remote</dfn></td><td>Object</td><td>指定对该表单域的值进行服务端验证，包含四个属性：<dfn>url</dfn>、<dfn>options</dfn>、<dfn>onSend</dfn>、<dfn>onReceive</dfn>。前两个属性为创建远程请求使用的 Request 的参数。<dfn>onSend</dfn> 是对该表单域的值进行预处理的函数，其返回值为要发送给服务端的数据。<dfn>onReceive</dfn> 是处理服务端返回信息的函数，该函数应该返回“错误信息”字符串，若“错误信息”字符串为空则表示验证通过。</td></tr>
   *   </table>
   *   验证将以上表列出的“验证方式”自上而下的顺序进行。
   *   若不需要某种类型的验证，在 <var>rules</var> 中省略对应的项即可。
   * @returns {Element} 本元素。
   * @description
   *   新的配置将在下次使用到这些验证规则的时候生效。
   */

  /**
   * 删除验证规则。
   * @name Validator#removeValidationRules
   * @function
   * @param {Array} names 要删除验证规则的表单域的名称。
   * @returns {Element} 本元素。
   * @description
   *   删除某个表单域的验证规则将自动清除该针对该表单域的已显示的提示信息。
   */

  /**
   * 设置自定义提示信息，而不使用默认的提示信息。
   * @name Validator#setValidationMessages
   * @function
   * @param {Object} messages 要定义提示信息的表单域的名称及信息内容，格式为 <dfn>{<var>name</var>: <var>messages</var>, ...}</dfn>。
   *   属性名 <var>name</var> 为要自定义提示信息的表单域的名称。
   *   属性值 <var>messages</var> 为定义提示信息的对象，包括 4 种状态。详情如下：
   *   <table>
   *     <tr><th>状态</th><th>值类型</th><th>详细描述</th></tr>
   *     <tr><td><dfn>hint</dfn></td><td>string</td><td>输入提示，默认值为空字符串，即不显示输入提示。仅应为 text、password 和 textarea 类型的表单元素指定输入提示。</td></tr>
   *     <tr><td><dfn>validating</dfn></td><td>string</td><td>进行服务端验证时要显示的信息，默认值为 '<dfn>验证中……</dfn>'。</td></tr>
   *     <tr><td><dfn>valid</dfn></td><td>string</td><td>通过验证时要显示的信息，默认值为空字符串，即通过验证时不显示任何提示信息。</td></tr>
   *     <tr>
   *       <td><dfn>invalid</dfn></td>
   *       <td>string</td>
   *       <td>
   *       <span>未通过验证时要显示的信息，不同验证方式的默认值也不同：</span>
   *       <table>
   *         <tr><th>验证方式</th><th>提示信息默认值</th></tr>
   *         <tr><td><dfn>required</dfn></td><td>当该表单域只包含一个文本控件时为 '<dfn>必填项</dfn>'，否则为 '<dfn>必选项</dfn>'。</td></tr>
   *         <tr><td><dfn>equals</dfn></td><td>'<dfn>两次输入的密码不一致</dfn>'</td></tr>
   *         <tr><td><dfn>minLength</dfn></td><td>当该表单域只包含一个文本控件时为 '<dfn>不能少于 <var>n</var> 个字符</dfn>'，否则为 '<dfn>至少选择 <var>n</var> 项</dfn>'，其中 <var>n</var> 为配置验证规则时指定的值。</td></tr>
   *         <tr><td><dfn>maxLength</dfn></td><td>当该表单域只包含一个文本控件时为 '<dfn>不能超过 <var>n</var> 个字符</dfn>'，否则为 '<dfn>最多选择 <var>n</var> 项</dfn>'，其中 <var>n</var> 为配置验证规则时指定的值。</td></tr>
   *         <tr><td><dfn>type</dfn></td><td>'<dfn>格式错误</dfn>'</td></tr>
   *         <tr><td><dfn>custom</dfn></td><td>无默认值，提示信息为配置此种验证规则时验证函数的返回值。</td></tr>
   *         <tr><td><dfn>remote</dfn></td><td>无默认值，提示信息为配置此种验证规则时 onReceive 函数的返回值。</td></tr>
   *       </table>
   *       </td>
   *     </tr>
   *   </table>
   * @returns {Element} 本元素。
   * @description
   *   新的配置将在下次使用到这些提示信息的时候生效。
   */

  /**
   * 取消自定义的提示信息，使用默认的提示信息。
   * @name Validator#restoreValidationMessages
   * @function
   * @param {Array} names 要取消自定义的提示信息的表单域的名称。
   * @returns {Element} 本元素。
   * @description
   *   新的配置将在下次使用到这些提示信息的时候生效。
   */

  Widget.register('validator', {
    css: [
      '.widget-validator { display: block; }',
      '.widget-validator .panel { display: none; }',
      '.widget-validator .active { display: block; }'
    ],
    config: {
      hoverDelay: NaN
    },
    methods: {
      activate: function(tab) {
        if (tab !== this.activeTab) {
          var index = this.tabs.indexOf(tab);
          if (index !== -1) {
            var inactiveTab = this.activeTab;
            if (inactiveTab) {
              inactiveTab.removeClass('active');
            }
            var inactivePanel = this.activePanel;
            if (inactivePanel) {
              inactivePanel.removeClass('active');
            }
            var activeTab = this.activeTab = tab.addClass('active');
            var activePanel = this.activePanel = this.panels[index].addClass('active');
            this.fire('activate', {
              activeTab: activeTab,
              activePanel: activePanel,
              inactiveTab: inactiveTab,
              inactivePanel: inactivePanel
            });
          }
        }
        return this;
      }
    },
    events: ['activate'],
    initialize: function() {
      var $element = this;

      // 保存属性。
      Object.mixin($element, {
        tabs: $element.find('.tab'),
        panels: $element.find('.panel'),
        activeTab: null,
        activePanel: null
      });

      // 通过点击或指向“标签”激活对应的“标签面板”。
      var timer;
      $element
          .on('click.validator:relay(.tab)', function(event) {
            if ($element.tabs.contains(this)) {
              $element.activate(this);
              // 避免在 IE 中触发 beforeunload 事件，以及链接点击成功后可能出现的音效。
              event.preventDefault();
            }
          })
          .on('mouseenter.validator:relay(.tab)', function() {
            if (Number.isFinite($element.hoverDelay)) {
              var $tab = this;
              if (!timer) {
                timer = setTimeout(function() {
                  $element.activate($tab);
                }, $element.hoverDelay);
              }
            }
          })
          .on('mouseleave.validator:relay(.tab)', function() {
            if (timer) {
              clearTimeout(timer);
              timer = undefined;
            }
          });

      // 默认激活第一组。
      $element.activate($element.tabs.getFirst());

    }
  });

})();
//--------------------------------------------------[HTMLFormElement.prototype.setValidationRules]
HTMLFormElement.prototype.setValidationRules = function(rulesets) {
  var $form = this;

  // 不能重复调用。
  if ($form.validationRulesets) {
    throw new Error('Validation rules has been set');
  }

  // 保存验证规则。不要修改 DOM 对象上的这个属性！
  $form.validationRulesets = rulesets;

  // 每一项的值为 true 表示验证通过，false 表示验证未通过，undefined 表示正在验证中。
  $form.validationResultSet = {};

  var isValidating = false;

  // 为控件添加事件监听器。
  Object.forEach(rulesets, function(rules, name) {
    Array.from($form.elements[name]).forEach(function(control) {
      var $control = $(control).on('change.validation', function() {
        validateField($form, name);
      });
      // 如果设置了 equals 规则且已输入值，则在目标控件的值改变时重新检测本控件的值。
      var relatedName = rules.equals && rules.equals[0];
      if (relatedName) {
        $($form.elements[relatedName]).on('change.validation', function() {
          if ($control.value) {
            validateField($form, name);
          }
        });
      }
    });
  });

  // 为表单添加事件监听器。
  return $form
      .on('submit.validation', function(e) {
        // 单独添加一个监听器，以免验证过程发生异常时导致表单被提交。
        var activeElement = document.activeElement;
        if ($form.contains(activeElement)) {
          activeElement.blur();
        }
        e.preventDefault();
      })
      .on('submit.validation', function() {
        if (!isValidating) {
          isValidating = true;
          $form.fire('validate');
          // 对尚未验证的表单域进行验证。
          Object.forEach(rulesets, function(rules, name) {
            if (!$form.validationResultSet.hasOwnProperty(name)) {
              validateField($form, name);
            }
          });
          // 所有表单域的验证结果均已收集完毕，开始分析。
          var validatingFields = [];
          var allValidationsPassed = true;
          Object.forEach($form.validationResultSet, function(result, name) {
            if (result === undefined) {
              validatingFields.push(name);
            } else {
              allValidationsPassed = allValidationsPassed && result;
            }
          });
          // 处理结果。
          if (validatingFields.length) {
            // 有验证仍在进行。
            $form
                .on('fieldvalidate.validation', function() {
                  $form.fire('validated', {result: false});
                })
                .on('fieldvalidated.validation', function(e) {
                  if (validatingFields.contains(e.name)) {
                    validatingFields.remove(e.name);
                    allValidationsPassed = allValidationsPassed && !e.errorMessage;
                    if (!validatingFields.length) {
                      $form.fire('validated', {result: allValidationsPassed});
                    }
                  }
                });
          } else {
            // 所有验证均已完成。
            $form.fire('validated', {result: allValidationsPassed});
          }
        }
      })
      .on('reset.validation, validated.validation', function() {
        $form.off('fieldvalidate.validation, fieldvalidated.validation');
        isValidating = false;
      })
      .on('reset.validation', function() {
        $form.validationResultSet = {};
        Object.forEach(rulesets, function(rules) {
          if (rules.lastRequest) {
            rules.lastRequest.off('finish').abort();
          }
        });
      });

};

