/**
 * @fileOverview Widget - 表单验证器。
 * @author sundongguo@gmail.com
 * @version 20121008
 */

(function() {
//==================================================[Widget - 表单验证器]
//--------------------------------------------------[valueValidator]
  var valueValidator = {
    required: function(control, value, ruleValue) {
      return ruleValue && value.length > 0 ? '' : (control.nodeType ? '必填项' : '必选项');
    },
    equals: function(control, value, ruleValue) {
      return value === control.form.getFieldValue(ruleValue) ? '' : '两次输入的密码不一致';
    },
    minLength: function(control, value, ruleValue) {
      return value.length === 0 || value.length >= ruleValue ? '' : (control.nodeType ? '不能少于 ' + ruleValue + ' 个字符' : '至少选择 ' + ruleValue + ' 项');
    },
    maxLength: function(control, value, ruleValue) {
      return value.length === 0 || value.length <= ruleValue ? '' : (control.nodeType ? '不能超过 ' + ruleValue + ' 个字符' : '最多选择 ' + ruleValue + ' 项');
    },
    type: function(_, value, ruleValue) {
      var result = true;
      if (value.length) {
        switch (ruleValue) {
          case 'number':
            result = /^([+-]?\d+)(\.\d+)?$/.test(value);
            break;
          case 'date':
            result = value === Date.from(value).format();
            break;
          case 'email':
            result = /^([\w-])+@([\w-])+((\.[\w-]+){1,3})$/.test(value);
            break;
          case 'phone':
            result = /^\d{11}?$/.test(value);
        }
      }
      return result ? '' : '格式错误';
    }
  };

//--------------------------------------------------[validateField]
  var validateField = function($form, name) {
    // 获取指定表单域的控件和值。
    var control = $form.elements[name];
    var value = $form.getFieldValue(name);

    // 取出验证相关的数据。
    var validationData = $form._validationData_;
    var ruleSet = validationData.rules[name];
    var states = validationData.states;
    var requests = validationData.requests;

    // 开始验证表单域。
    states[name] = undefined;
    $form.fire('fieldvalidate', {name: name, value: value});

    // 先进行 5 种内置规则的验证。
    var ruleNames = ['required', 'equals', 'minLength', 'maxLength', 'type'];
    var ruleName;
    var errorMessage = '';
    while (!errorMessage && (ruleName = ruleNames.shift())) {
      if (ruleSet.hasOwnProperty(ruleName)) {
        errorMessage = valueValidator[ruleName](control, value, ruleSet[ruleName]);
      }
    }

    // 再进行 2 种自定规则的验证。
    var custom = ruleSet.custom;
    var remote = ruleSet.remote;
    if (!errorMessage && custom) {
      errorMessage = custom.call($form, value);
    }
    if (!errorMessage && remote) {
      // 需要服务端验证，在验证结束后异步触发 fieldvalidated 事件。
      if (requests.hasOwnProperty(name)) {
        requests[name].off('finish').abort();
      }
      var requestData = {};
      requestData[remote.valueKey] = value;
      requests[name] = new Request(remote.url, remote.options)
          .on('finish', function(e) {
            delete requests[name];
            var errorMessage = remote.validateResult(e);
            states[name] = !errorMessage;
            $form.fire('fieldvalidated', {name: name, value: value, errorMessage: errorMessage});
          })
          .send(requestData);
    } else {
      // 不需要服务端验证，同步触发 fieldvalidated 事件。
      states[name] = !errorMessage;
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
   *   表单验证器可以在表单提交的时候自动根据配置的验证规则对表单域的值进行验证，并能在不同的状态下显示相应的提示信息。
   *   注意验证的对象是表单域的值，而不是某一个控件的值。
   *   <strong>启用方式：</strong>
   *   为 FORM 元素添加 'widget-validator' 类，即可使该元素成为表单验证器。
   *   <strong>结构约定：</strong>
   *   表单验证器的后代元素中，包含类名 'w-state' 的为“状态指示器”，包含类名 'w-message' 的为“提示信息容器”。
   *   这些元素还应指定 data-for="<var>name</var>" 属性，<var>name</var> 为这些元素对应的表单域的名称。
   *   一个表单域最多只能有一个“状态指示器”和一个“提示信息容器”（如果指定了多个则只有第一个生效），并且它们必须在对应的表单域验证规则被解析时可访问。
   *   <strong>新增行为：</strong>
   *   该表单的 submit 事件的默认行为将被阻止，对提交行为的后续处理应在该表单的 validated 事件监听器中根据验证结果进行。
   *   如果一个表单域配置了验证规则，当其中包含的任何控件的值被用户改变时，都将自动对该表单域进行验证，并触发 fieldvalidate 事件，验证结束后会触发 fieldvalidated 事件。
   *   要手动验证某一个表单域，触发其中任一控件的 change 事件即可。
   *   当表单的 submit 事件发生时，会自动对所有已配置的验证规则涉及到的、且尚未验证的表单域进行验证，并触发 validate 事件，验证结束后会触发 validated 事件。如果没有需要服务端验证的表单域，validated 事件将同步触发，否则 validated 事件将在所有的服务端验证结束后异步触发。
   *   如果用户在可能存在的服务端验证尚未全部结束之前修改了任一控件的值，则会立即取消当前的服务端验证，并触发 validated 事件，本次验证按失败处理。
   *   当该表单触发 reset 事件时，当前的验证结果和所有已显示的提示信息也会随之重置。
   *   当某个表单域的输入或验证状态发生变化时，“状态指示器”和“提示信息容器”的类名也会随之改变（输入中=w-input && 验证中=w-validating || 通过验证=w-valid || 未通过验证=w-invalid），可以利用此特性在各种状态下显示不同的内容。
   *   另外，如果为一个表单域未能通过验证，提示信息会被自动注入为该表单域指定的“提示信息容器”中。
   */

  /**
   * 添加验证规则。
   * @name Validator#addValidationRules
   * @function
   * @param {Object} rules 要验证的表单域的名称及规则，格式为 <dfn>{<var>name</var>: <var>ruleSet</var>, ...}</dfn>。
   *   属性名 <var>name</var> 为要验证的表单域的名称。
   *   属性值 <var>ruleSet</var> 为定义验证规则的对象，包括 5 种预置规则和 2 种自定规则。详情如下：
   *   <table>
   *     <tr><th>规则名称</th><th>值类型</th><th>详细描述</th></tr>
   *     <tr><td><dfn>required</dfn></td><td>boolean</td><td>限定该表单域是否为必填项或必选项。</td></tr>
   *     <tr><td><dfn>equals</dfn></td><td>string</td><td>限定该表单域的值与相关表单域的值一致，仅应在这两个表单域均只包含一个文本控件时指定。相关表单域不能为该表单域自身。</td></tr>
   *     <tr><td><dfn>minLength</dfn></td><td>number</td><td>当该表单域只包含一个文本控件时，限定输入文本的最小长度，否则限定选择项的最少数目。</td></tr>
   *     <tr><td><dfn>maxLength</dfn></td><td>number</td><td>当该表单域只包含一个文本控件时，限定输入文本的最大长度，否则限定选择项的最多数目。</td></tr>
   *     <tr><td><dfn>type</dfn></td><td>Array</td><td>限定数据的类型，值可以为 '<dfn>number</dfn>'、'<dfn>date</dfn>'、'<dfn>email</dfn>'、'<dfn>phone</dfn>' 中的任一个。</td></tr>
   *     <tr><td><dfn>custom</dfn></td><td>Function</td><td>用来对该表单域的值进行进一步验证的函数，该函数被调用时传入该表单域的值，其 this 的值为本表单元素，返回值应为一个“错误信息”字符串，为空则表示验证通过。</td></tr>
   *     <tr><td><dfn>remote</dfn></td><td>Object</td><td>指定对该表单域的值进行服务端验证，包含四个属性：<dfn>url</dfn>、<dfn>options</dfn>、<dfn>onSend</dfn>、<dfn>onReceive</dfn>。前两个属性为创建远程请求使用的 Request 的参数。<dfn>onSend</dfn> 是对该表单域的值进行预处理的函数，其返回值为要发送给服务端的数据。<dfn>onReceive</dfn> 是处理服务端返回信息的函数，该函数应该返回“错误信息”字符串，若“错误信息”字符串为空则表示验证通过。</td></tr>
   *   </table>
   *   验证将以上表列出的“规则名称”自上而下的顺序进行。
   *   若不需要某种类型的验证，在 <var>ruleSet</var> 中省略对应的项即可。
   *   上述规则中的 5 种预置规则均有内置的错误提示信息：
   *   <table>
   *     <tr><th>规则名称</th><th>提示信息默认值</th></tr>
   *     <tr><td><dfn>required</dfn></td><td></td></tr>
   *     <tr><td><dfn>equals</dfn></td><td>'<dfn>两次输入的密码不一致</dfn>'</td></tr>
   *     <tr><td><dfn>minLength</dfn></td><td>当该表单域只包含一个文本控件时为 '<dfn>不能少于 <var>n</var> 个字符</dfn>'，否则为 '<dfn>至少选择 <var>n</var> 项</dfn>'，其中 <var>n</var> 为配置验证规则时指定的值。</td></tr>
   *     <tr><td><dfn>maxLength</dfn></td><td>当该表单域只包含一个文本控件时为 '<dfn>不能超过 <var>n</var> 个字符</dfn>'，否则为 '<dfn>最多选择 <var>n</var> 项</dfn>'，其中 <var>n</var> 为配置验证规则时指定的值。</td></tr>
   *     <tr><td><dfn>type</dfn></td><td>'<dfn>格式错误</dfn>'</td></tr>
   *     <tr><td><dfn>custom</dfn></td><td>无需设置，提示信息为配置此种验证规则时验证函数的返回值。</td></tr>
   *     <tr><td><dfn>remote</dfn></td><td>无需设置，提示信息为配置此种验证规则时 onReceive 函数的返回值。</td></tr>
   *   </table>
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

  Widget.register('validator', {
    methods: {
      addValidationRules: function(rules) {
        var $form = this;
        var validationData = $form._validationData_;
        var associatedFields = validationData.associatedFields;
        var stateIndicators = validationData.stateIndicators;
        var messageContainers = validationData.messageContainers;
        // 清空关联表单域列表、“状态指示器”列表和“提示信息容器”列表。
        Object.forEach(associatedFields, function(_, name) {
          delete associatedFields[name];
        });
        Object.forEach(stateIndicators, function(_, name) {
          delete stateIndicators[name];
        });
        Object.forEach(messageContainers, function(_, name) {
          delete messageContainers[name];
        });
        // 添加验证规则，并根据 equals 规则生成关联表单域列表。
        Object.forEach(Object.mixin(validationData.rules, rules), function(ruleSet, name) {
          var associatedName = ruleSet.equals;
          if (associatedName) {
            associatedFields[associatedName] = name;
          }
        });
        // 重新查找 DOM 树，生成新的“状态指示器”列表和“提示信息容器”列表。
        $form.find('.w-state').forEach(function($stateIndicator) {
          var name = $stateIndicator.getData('for');
          if (validationData.rules.hasOwnProperty(name) && !stateIndicators.hasOwnProperty(name)) {
            stateIndicators[name] = $stateIndicator;
          }
        });
        $form.find('.w-message').forEach(function($messageContainer) {
          var name = $messageContainer.getData('for');
          if (validationData.rules.hasOwnProperty(name) && !messageContainers.hasOwnProperty(name)) {
            messageContainers[name] = $messageContainer;
          }
        });
        return $form;
      },
      removeValidationRules: function(names) {
        var $form = this;
        var validationData = $form._validationData_;
        var rules = validationData.rules;
        var associatedFields = validationData.associatedFields;
        var stateIndicators = validationData.stateIndicators;
        var messageContainers = validationData.messageContainers;
        names.forEach(function(name) {
          if (rules.hasOwnProperty(name)) {
            var associatedName = rules[name].equals;
            if (associatedName) {
              delete associatedFields[associatedName];
            }
            if (stateIndicators.hasOwnProperty(name)) {
              stateIndicators[name].removeClass('w-input, w-validating, w-valid, w-invalid');
            }
            if (messageContainers.hasOwnProperty(name)) {
              messageContainers[name].innerText = '';
            }
            delete rules[name];
            delete validationData.states[name];
          }
        });
        return $form;
      }
    },
    events: ['fieldvalidate', 'fieldvalidated', 'validate', 'validated'],
    initialize: function() {
      var $form = this;

      // 保存属性。
      var validationData = $form._validationData_ = {
        rules: {},
        states: {},
        associatedFields: {},
        requests: {},
        stateIndicators: {},
        messageContainers: {}
      };

      // 自动验证配置了验证规则的表单域。
      var rules = validationData.rules;
      var states = validationData.states;
      var associatedFields = validationData.associatedFields;
      var requests = validationData.requests;
      var stateIndicators = validationData.stateIndicators;
      var messageContainers = validationData.messageContainers;
      var isValidating = false;
      $form
          .on('focusin.validator, focusout.validator', function(e) {
            // 表单控件获取或失去焦点时更改“状态指示器”的类名。
            var name = e.target.name;
            if (rules.hasOwnProperty(name)) {
              if (stateIndicators.hasOwnProperty(name)) {
                stateIndicators[name][e.type === 'focusin' ? 'addClass' : 'removeClass']('w-input');
              }
            }
          })
          .on('change.validator', function(e) {
            // 表单控件的值发生改变时触发的验证。
            var name = e.target.name;
            if (rules.hasOwnProperty(name)) {
              validateField($form, name);
            }
            // 如果有关联的表单域，则同时对该关联表单域进行验证。
            var associatedName = associatedFields[name];
            if (associatedName) {
              validateField($form, associatedName);
            }
          })
          .on('submit.validator', function(e) {
            // 使表单内的活动元素触发 change 事件。
            // 单独添加一个监听器，以免验证过程发生异常时导致表单被提交。
            var activeElement = document.activeElement;
            if ($form.contains(activeElement)) {
              activeElement.blur();
            }
            e.preventDefault();
          })
          .on('submit.validator', function() {
            // 表单提交时触发的验证。
            if (!isValidating) {
              isValidating = true;
              $form.fire('validate');
              // 对尚未验证的表单域进行验证（true = 通过验证 / false = 未通过验证 / undefined = 验证中 / 无 = 尚未验证）。
              Object.forEach(rules, function(_, name) {
                if (!states.hasOwnProperty(name)) {
                  validateField($form, name);
                }
              });
              // 所有配置了验证规则的表单域都已有其对应的 state，分析验证结果。
              var validatingFields = [];
              var allFieldsAreValid = true;
              Object.forEach(states, function(state, name) {
                if (state === undefined) {
                  validatingFields.push(name);
                } else {
                  allFieldsAreValid = allFieldsAreValid && state;
                }
              });
              if (validatingFields.length) {
                // 有验证仍在进行。
                $form
                    .on('fieldvalidate.validatorTemp', function() {
                      $form.fire('validated', {result: false});
                    })
                    .on('fieldvalidated.validatorTemp', function(e) {
                      if (validatingFields.contains(e.name)) {
                        validatingFields.remove(e.name);
                        allFieldsAreValid = allFieldsAreValid && !e.errorMessage;
                        if (!validatingFields.length) {
                          $form.fire('validated', {result: allFieldsAreValid});
                        }
                      }
                    });
              } else {
                // 所有验证均已完成。
                $form.fire('validated', {result: allFieldsAreValid});
              }
            }
          })
          .on('reset.validator, validated.validator', function() {
            // 复位表单或验证完毕时，重置临时设定的状态。
            $form.off('fieldvalidate.validatorTemp, fieldvalidated.validatorTemp');
            isValidating = false;
          })
          .on('reset.validator', function() {
            // 复位表单时清理验证结果，取消可能正在进行中的远程请求，并恢复原始状态、清空提示信息。
            Object.forEach(states, function(_, name) {
              delete states[name];
            });
            Object.forEach(requests, function(request, name) {
              request.off('finish').abort();
              delete request[name];
            });
            Object.forEach(stateIndicators, function($stateIndicator) {
              $stateIndicator.removeClass('w-validating, w-valid, w-invalid');
            });
            Object.forEach(messageContainers, function($messageContainer) {
              $messageContainer.innerText = '';
            });
          })
          .on('fieldvalidate.validator, fieldvalidated.validator', function(e) {
            // 表单域开始验证及验证完毕时更改提示信息。
            var name = e.name;
            var state = e.type === 'fieldvalidate' ? 'validating' : (e.errorMessage ? 'invalid' : 'valid');
            if (rules.hasOwnProperty(name)) {
              if (stateIndicators.hasOwnProperty(name)) {
                stateIndicators[name].removeClass('w-validating, w-valid, w-invalid').addClass('w-' + state);
              }
              if (messageContainers.hasOwnProperty(name)) {
                messageContainers[name].innerText = e.errorMessage;
              }
            }
          });

    }
  });

})();
