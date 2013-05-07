/**
 * @fileOverview Widget - 表单验证器
 * @author sundongguo@gmail.com
 * @version 20121008
 */

(function() {
//==================================================[Widget - 表单验证器]
//--------------------------------------------------[buildInValidators]
  var buildInValidators = {
    required: function(control, value, ruleValue) {
      return ruleValue && value.length > 0 ? '' : (control.nodeType ? '必填' : '必选');
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
      var passed = true;
      if (value.length) {
        passed = false;
        switch (ruleValue) {
          case 'number':
            passed = /^([+-]?\d+)(\.\d+)?$/.test(value);
            break;
          case 'date':
            passed = value === Date.parseExact(value).format();
            break;
          case 'email':
            passed = /^([\w-])+@([\w-])+((\.[\w-]+){1,3})$/.test(value);
            break;
          case 'phone':
            passed = /^\d{11}?$/.test(value);
        }
      }
      return passed ? '' : '格式错误';
    }
  };

//--------------------------------------------------[validateField]
  var validateField = function($form, name) {
    // 获取指定表单域的控件和值。
    var control = $form.elements[name];
    var value = $form.getFieldValue(name);

    // 取出验证相关的数据。
    var validationData = $form.validationData;
    var ruleSet = validationData.rules[name];
    var flags = validationData.flags;
    var requests = validationData.requests;

    // 开始验证表单域。
    flags[name] = undefined;
    $form.fire('fieldvalidate', {name: name, value: value});

    // 先进行 5 种内置规则的验证。
    var buildInRuleNames = ['required', 'equals', 'minLength', 'maxLength', 'type'];
    var buildInRuleName;
    var errorMessage = '';
    while (!errorMessage && (buildInRuleName = buildInRuleNames.shift())) {
      if (ruleSet.hasOwnProperty(buildInRuleName)) {
        errorMessage = buildInValidators[buildInRuleName](control, value, ruleSet[buildInRuleName]);
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
      requestData[remote.keyName] = value;
      requests[name] = new Request(remote.url, remote.options)
          .on('finish', function(e) {
            delete requests[name];
            var errorMessage = remote.validateResult.call($form, e);
            var passed = flags[name] = !errorMessage;
            $form.fire('fieldvalidated', {name: name, value: value, passed: passed, errorMessage: errorMessage});
          })
          .send(requestData);
    } else {
      // 不需要服务端验证，同步触发 fieldvalidated 事件。
      var passed = flags[name] = !errorMessage;
      $form.fire('fieldvalidated', {name: name, value: value, passed: passed, errorMessage: errorMessage});
    }
  };

//--------------------------------------------------[Validator]
  /**
   * “表单验证器”可以在表单提交的时候根据配置的“验证规则”对表单域的值（而不是某一个控件的值）进行验证，并能在不同的状态下显示相应的提示信息。
   * @name Validator
   * @constructor
   * @fires fieldvalidate
   *   {string} name 验证的表单域的名称。
   *   {string|Array} value 验证的表单域的值。
   *   当开始验证一个表单域时触发。
   * @fires fieldvalidated
   *   {string} name 验证的表单域的名称。
   *   {string|Array} value 验证的表单域的值。
   *   {boolean} passed 本表单域的值是否已通过验证。
   *   {string} errorMessage “提示信息”字符串，若验证通过则为空字符串。
   *   在一个表单域验证结束后触发。
   * @fires validate
   *   当表单验证开始时（即表单的 submit 事件发生时）触发。
   * @fires validated
   *   {boolean} passed 本表单所有已配置验证规则的域的值是否已全部通过验证。
   *   {Array} invalidFields 尚未通过验证的字段，若验证通过则为空数组。
   *   在表单验证结束后触发。
   * @description
   *   <strong>启用方式：</strong>
   *   为一个 FORM 元素添加 'widget-validator' 类，即可使该元素成为“表单验证器”。
   *   <strong>结构约定：</strong>
   *   <ul>
   *     <li>“表单验证器”的后代元素中，类名包含 'state' 的为“状态指示器”，类名包含 'message' 的为“提示信息容器”。这些元素还应指定 data-for="<var>name</var>" 属性，<var>name</var> 为这些元素对应的表单域的名称。</li>
   *     <li>一个表单域最多只能有一个“状态指示器”和一个“提示信息容器”（如果指定了多个则只有第一个生效），并且它们必须在对应的表单域“验证规则”被解析时可访问。</li>
   *   </ul>
   *   <strong>新增行为：</strong>
   *   <ul>
   *     <li>如果一个表单域配置了“验证规则”，当其中包含的任何控件的值被用户改变时，都将对该表单域进行验证，并触发 fieldvalidate 事件，验证结束后会触发 fieldvalidated 事件。<br>如果一个表单域未能通过验证，提示信息会被注入为该表单域指定的“提示信息容器”中。<br>要手动验证某一个表单域，触发其中任一控件的 change 事件即可。</li>
   *     <li>当某个表单域的输入或验证状态发生变化时，“状态指示器”和“提示信息容器”的类名也会随之改变（输入中=input && 验证中=validating || 通过验证=valid || 未通过验证=invalid），可以利用此特性在各种状态下显示不同的内容。</li>
   *     <li>该表单的 submit 事件的默认行为将被阻止，当表单的 submit 事件发生时，会对所有已配置的“验证规则”涉及到的、且尚未验证的表单域进行验证，并触发 validate 事件，验证结束后会触发 validated 事件。<br>如果没有需要服务端验证的表单域，validated 事件将同步触发，否则 validated 事件将在所有的服务端验证结束后异步触发。<br>如果用户在可能存在的服务端验证尚未全部结束之前修改了任一控件的值，则会立即取消当前的服务端验证，并触发 validated 事件，本次验证按失败处理。</li>
   *     <li>当该表单触发 reset 事件时，当前的验证结果和所有已显示的提示信息也会随之重置。</li>
   *   </ul>
   */

  /**
   * 添加“验证规则”。
   * @name Validator#addValidationRules
   * @function
   * @param {Object} rules 要验证的表单域的名称及规则，格式为 <dfn>{<var>name</var>: <var>ruleSet</var>, ...}</dfn>。
   *   属性名 <var>name</var> 为要验证的表单域的名称。
   *   属性值 <var>ruleSet</var> 为定义“验证规则”的对象，包括 5 种预置规则和 2 种自定规则。按照验证进行的顺序排列如下：
   *   <table>
   *     <tr><th>规则名称</th><th>值类型</th><th>详细描述</th><th>提示信息</th></tr>
   *     <tr><td><dfn>required</dfn></td><td>boolean</td><td>限定该表单域是否为必填或必选的。</td><td>当该表单域只包含一个控件时为 '<strong>必填</strong>'，否则为 '<strong>必选</strong>'</td></tr>
   *     <tr><td><dfn>equals</dfn></td><td>string</td><td>指定相关表单域的名称，以限定该表单域的值与相关表单域的值一致。仅应在这两个表单域均只包含一个控件时指定，且相关表单域不能为该表单域自身。</td><td>'<strong>两次输入的密码不一致</strong>'</td></tr>
   *     <tr><td><dfn>minLength</dfn></td><td>number</td><td>当该表单域只包含一个控件时，限定该控件的值的最小长度，否则限定选择项的最少数目。</td><td>当该表单域只包含一个控件时为 '<strong>不能少于 <dfn>minLength</dfn> 个字符</strong>'，否则为 '<strong>至少选择 <dfn>minLength</dfn> 项</strong>'。</td></tr>
   *     <tr><td><dfn>maxLength</dfn></td><td>number</td><td>当该表单域只包含一个控件时，限定该控件的值的最大长度，否则限定选择项的最多数目。</td><td>当该表单域只包含一个控件时为 '<strong>不能超过 <dfn>maxLength</dfn> 个字符</strong>'，否则为 '<strong>最多选择 <dfn>maxLength</dfn> 项</strong>'。</td></tr>
   *     <tr><td><dfn>type</dfn></td><td>Array</td><td>限定数据的类型，值可以为 'number'、'date'、'email'、'phone' 中的任一个。</td><td>'<strong>格式错误</strong>'</td></tr>
   *     <tr><td><dfn>custom</dfn></td><td>Function</td><td>用来对该表单域的值进行进一步验证的函数，该函数被调用时会被传入该表单域的值，其 this 的值为本表单元素，返回值应为一个“提示信息”字符串（若为空字符串则表示验证通过）。</td><td>提示信息为 <dfn>custom</dfn> 函数的返回值。</td></tr>
   *     <tr><td><dfn>remote</dfn></td><td>Object</td><td>指定对该表单域的值进行服务端验证，包含四个属性：url、options、keyName、validateResult。<br>其中前两个属性为创建远程请求时使用的 Request 的参数（细节请参考 Request 的同名参数），keyName 是将该表单域的值（value）以 <var>keyName=value</var> 的形式发送到服务端时使用的字段名，validateResult 是处理服务端返回信息的函数，该函数被调用时传入的参数与 Request 的 finish 事件监听器被调用时传入的参数一致，其 this 的值为“表单验证器”，该函数应该返回“提示信息”字符串（若为空字符串则表示验证通过）。</td><td>提示信息为 validateResult 函数的返回值。</td></tr>
   *   </table>
   *   若不需要某种类型的验证，在 <var>ruleSet</var> 中省略对应的规则即可。
   * @returns {Element} 本元素。
   * @description
   *   新的配置将在下次使用到这些“验证规则”的时候生效。
   */

  /**
   * 删除“验证规则”。
   * @name Validator#removeValidationRules
   * @function
   * @param {Array} names 包含要删除“验证规则”的表单域的名称的数组。
   * @returns {Element} 本元素。
   * @description
   *   删除某个表单域的“验证规则”时，该表单域已显示的提示信息也将被清除。
   */

  Widget.register({
    type: 'validator',
    selector: 'form.widget-validator',
    methods: {
      addValidationRules: function(rules) {
        var $validator = this;
        var validationData = $validator.validationData;
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
        // 添加“验证规则”，并根据 equals 规则生成关联表单域列表。
        Object.forEach(Object.mixin(validationData.rules, rules), function(ruleSet, name) {
          var associatedName = ruleSet.equals;
          if (associatedName) {
            associatedFields[associatedName] = name;
          }
        });
        // 重新查找 DOM 树，生成新的“状态指示器”列表和“提示信息容器”列表。
        $validator.findAll('.state').forEach(function($stateIndicator) {
          var name = $stateIndicator.getData('for');
          if (validationData.rules.hasOwnProperty(name) && !stateIndicators.hasOwnProperty(name)) {
            stateIndicators[name] = $stateIndicator;
          }
        });
        $validator.findAll('.message').forEach(function($messageContainer) {
          var name = $messageContainer.getData('for');
          if (validationData.rules.hasOwnProperty(name) && !messageContainers.hasOwnProperty(name)) {
            messageContainers[name] = $messageContainer;
          }
        });
        return $validator;
      },
      removeValidationRules: function(names) {
        var $validator = this;
        var validationData = $validator.validationData;
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
              stateIndicators[name].removeClass('input, validating, valid, invalid');
            }
            if (messageContainers.hasOwnProperty(name)) {
              messageContainers[name].innerHTML = '';
            }
            delete rules[name];
            delete validationData.flags[name];
          }
        });
        return $validator;
      }
    },
    initialize: function() {
      var $validator = this;

      // 保存属性。
      var validationData = $validator.validationData = {
        rules: {},
        flags: {},
        associatedFields: {},
        requests: {},
        stateIndicators: {},
        messageContainers: {}
      };

      // 验证配置了“验证规则”的表单域。
      var rules = validationData.rules;
      var flags = validationData.flags;
      var associatedFields = validationData.associatedFields;
      var requests = validationData.requests;
      var stateIndicators = validationData.stateIndicators;
      var messageContainers = validationData.messageContainers;
      var isValidating = false;
      $validator
          .on('focusin.validator, focusout.validator', function(e) {
            // 表单控件获取或失去焦点时更改“状态指示器”的类名。
            var name = e.target.name;
            if (rules.hasOwnProperty(name)) {
              if (stateIndicators.hasOwnProperty(name)) {
                // 以下 submit.validator 事件监听器中使用了延时，此处也应使用，以避免提示信息闪烁。
                setTimeout(function() {
                  stateIndicators[name][e.type === 'focusin' ? 'addClass' : 'removeClass']('input');
                }, 0);
              }
            }
          })
          .on('change.validator', function(e) {
            // 表单控件的值发生改变时触发的验证。
            var name = e.target.name;
            if (rules.hasOwnProperty(name)) {
              validateField($validator, name);
            }
            // 如果有关联的表单域，则同时对该关联表单域进行验证。
            var associatedName = associatedFields[name];
            if (associatedName) {
              validateField($validator, associatedName);
            }
          })
          .on('submit.validator', function(e) {
            // 使表单内的活动元素触发 change 事件。
            // 单独添加一个监听器，以免验证过程发生异常时导致表单被提交。
            var activeElement = document.activeElement;
            if ($validator.contains(activeElement)) {
              activeElement.blur();
            }
            e.preventDefault();
          })
          .on('submit.validator', function() {
            // 加入延时来解决 IE6 在文本框内按下回车会先触发表单的 submit 事件后触发文本框的 change 事件的问题。
            setTimeout(function() {
              // 表单提交时触发的验证。
              if (!isValidating) {
                isValidating = true;
                $validator.fire('validate');
                // 对尚未验证的表单域进行验证（flag 的含义：true = 通过验证 / false = 未通过验证 / undefined = 验证中 / 无 = 尚未验证）。
                Object.forEach(rules, function(_, name) {
                  if (!flags.hasOwnProperty(name)) {
                    validateField($validator, name);
                  }
                });
                // 所有配置了“验证规则”的表单域都已有其对应的 flag，分析验证结果。
                var validatingFields = [];
                var invalidFields = [];
                var allFieldsAreValid = true;
                Object.forEach(flags, function(flag, name) {
                  if (flag === undefined) {
                    validatingFields.push(name);
                  } else {
                    if (flag === false) {
                      invalidFields.push(name);
                    }
                    allFieldsAreValid = allFieldsAreValid && flag;
                  }
                });
                if (validatingFields.length) {
                  // 有验证仍在进行。
                  $validator
                      .on('fieldvalidate.validatorTemp', function(e) {
                        var name = e.name;
                        if (!invalidFields.contains(name)) {
                          invalidFields.push(name);
                        }
                        $validator.fire('validated', {passed: false, invalidFields: invalidFields});
                      })
                      .on('fieldvalidated.validatorTemp', function(e) {
                        var name = e.name;
                        var passed = e.passed;
                        if (validatingFields.contains(name)) {
                          validatingFields.remove(name);
                          if (passed === false) {
                            invalidFields.push(name);
                          }
                          allFieldsAreValid = allFieldsAreValid && passed;
                          if (!validatingFields.length) {
                            $validator.fire('validated', {passed: allFieldsAreValid, invalidFields: invalidFields});
                          }
                        }
                      });
                } else {
                  // 所有验证均已完成。
                  $validator.fire('validated', {passed: allFieldsAreValid, invalidFields: invalidFields});
                }
              }
            }, 0);
          })
          .on('reset.validator, validated.validator', function() {
            // 复位表单或验证完毕时，重置临时设定的状态。
            $validator.off('fieldvalidate.validatorTemp, fieldvalidated.validatorTemp');
            isValidating = false;
          })
          .on('reset.validator', function() {
            // 复位表单时清理验证结果，取消可能正在进行中的远程请求，并恢复原始状态、清空提示信息。
            Object.forEach(flags, function(_, name) {
              delete flags[name];
            });
            Object.forEach(requests, function(request, name) {
              request.off('finish').abort();
              delete request[name];
            });
            Object.forEach(stateIndicators, function($stateIndicator) {
              $stateIndicator.removeClass('validating, valid, invalid');
            });
            Object.forEach(messageContainers, function($messageContainer) {
              $messageContainer.innerHTML = '';
            });
          })
          .on('fieldvalidate.validator, fieldvalidated.validator', function(e) {
            // 表单域开始验证及验证完毕时更改提示信息。
            var name = e.name;
            if (rules.hasOwnProperty(name)) {
              if (stateIndicators.hasOwnProperty(name)) {
                stateIndicators[name].removeClass('validating, valid, invalid').addClass(e.type === 'fieldvalidate' ? 'validating' : (e.passed ? 'valid' : 'invalid'));
              }
              if (messageContainers.hasOwnProperty(name)) {
                messageContainers[name].innerHTML = e.errorMessage;
              }
            }
          });

    }
  });

})();
