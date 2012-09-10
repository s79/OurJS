/**
 * @fileOverview 组件 - 表单验证器。
 * @author sundongguo@gmail.com
 * @version 20120723
 */

execute(function($) {
//==================================================[Validator]
  /*
   * 说明：
   *   每个表单域包含的控件都会在发生 change 事件时验证其所属域。从表单域的角度看，以下将这种情况称为“主动验证”。
   *   当调用 validator.validate 方法时，会对所有尚未验证的域进行验证。以下将这种情况称为“被动验证”。
   *   无论是“主动验证”还是“被动验证”，验证的结果都会被保存到 validator.resultSet 中，true 为通过，false 为未通过，undefined 为正在验证中。
   *   当 fieldvalidated 事件被触发时，事件对象的 errorMessage 属性值为错误信息，如果为空则表示当前表单域已通过验证。
   *
   * 执行 validator 方法时的流程：
   *   对可能存在的尚未验证的域进行“被动验证”。
   *   检查 validator.resultSet。
   *   如果有需要服务端验证的，触发 validating 事件，并在所有的服务端验证结束时，触发 validated(true/false) 事件。
   *   否则，根据检查结果触发 validated(true/false) 事件。
   *   在 validating 事件触发后，等待的所有服务端验证尚未结束前，如果任一控件触发了“主动验证”，则同时触发 validated(false)，本次验证按失败处理。
   */

  // 验证值是否符合规则，并保存状态。
  var validate = function(validator, name) {
    var resultSet = validator.resultSet;
    var $form = validator.element;
    var rules = validator.validationRules[name];
    var value = $form.getFieldValue(name);
    var errorMessage = '';
    resultSet[name] = undefined;
    validator.fire('fieldvalidate', {name: name, value: value});
    if (rules.required && value.length === 0) {
      errorMessage = 'required';
    }
    if (!errorMessage && rules.equals && value !== $form.getFieldValue(rules.equals)) {
      errorMessage = 'equals';
    }
    if (!errorMessage && rules.minLength && value.length < rules.minLength) {
      errorMessage = 'minLength';
    }
    if (!errorMessage && rules.maxLength && value.length > rules.maxLength) {
      errorMessage = 'maxLength';
    }
    if (!errorMessage && rules.format) {
      errorMessage = rules.format.call($form, value);
    }
    var serverSide = rules.serverSide;
    if (!errorMessage && serverSide) {
      if (rules.lastRequest) {
        rules.lastRequest.off('finish').abort();
      }
      rules.lastRequest = new Request(serverSide.url, serverSide.config)
          .on('start', function() {
            validator.fire('fieldvalidating', {name: name, value: value});
          })
          .on('finish', function(e) {
            delete rules.lastRequest;
            var errorMessage = e.errorMessage;
            resultSet[name] = !errorMessage;
            validator.fire('fieldvalidated', {name: name, value: value, errorMessage: errorMessage});
          })
          .send(value);
    } else {
      resultSet[name] = !errorMessage;
      validator.fire('fieldvalidated', {name: name, value: value, errorMessage: errorMessage});
    }
  };

//--------------------------------------------------[Validator Constructor]
  /**
   * 表单验证器。
   * @name Validator
   * @constructor
   * @param {Element} element 要验证的表单元素。
   * @param {Object} validationRules 要验证的表单域名称及规则，格式为 {name: rules, ...}。
   *   name 为要验证的表单域的名称，即本表单元素内对应的 INPUT/SELECT/TEXTAREA 元素的 name 属性值。
   *   rules 为描述验证规则的一个对象，其<strong>可选的</strong>各个属性的要求和含义如下：
   *   {boolean} required 必填或必选项应设置为 true，否则应设置为 false 或省略。
   *   {string} equals 指定相关表单域的名称，限制该表单域的值与相关表单域的值一致。仅应在这两个表单域均只包含一个文本控件时指定，并且不能指定为该表单域自身的名称。若无此类限制可省略此项。
   *   {number} minLength 当该表单域只包含一个文本控件时，限定输入文本的最小长度，否则限定选择项的最少数目。若无此类限制可省略此项。
   *   {number} maxLength 当该表单域只包含一个文本控件时，限定输入文本的最大长度，否则限定选择项的最多数目。若无此类限制可省略此项。
   *   {Function} format 用来对该表单域的值进行格式验证的函数，该函数被调用时传入该表单域的值，其 this 的值为本表单元素，返回值应为一个错误信息字符串，为空则表示验证通过。若无此类限制可省略此项。
   *   {Object} serverSide 指定对该表单域的值进行服务端验证，包含两个属性：url 和 config，详细内容请参考 Request 组件。注意利用 config.requestParser 和 config.responseParser 对请求和响应数据进行预处理。该表单域的值将被作为参数传入 send 方法，finish 事件对象应具备 errorMessage 属性（错误信息字符串），为空则表示验证通过。若不需要服务端验证可省略此项。
   *   进行验证的步骤为 required - equals - min/maxLength - format - serverSide。
   * @fires fieldvalidate
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   验证每个要验证的表单域开始时触发。
   * @fires fieldvalidating
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   当一个表单域开始服务端异步验证时触发。
   * @fires fieldvalidated
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   {string} errorMessage 错误信息字符串，为空则表示验证通过。
   *   验证每个要验证的表单域结束后触发。errorMessage 的预置值见下表：
   *   <table>
   *     <tr><th>值</th><th>含义</th></tr>
   *     <tr><td>''</td><td>验证通过。</td></tr>
   *     <tr><td>'required'</td><td>本项为必选项，但内容为空。</td></tr>
   *     <tr><td>'equals'</td><td>该表单域的值与相关表单域的值不一致。</td></tr>
   *     <tr><td>'minLength'</td><td>最小长度或最少数目小于限定值。</td></tr>
   *     <tr><td>'maxLength'</td><td>最大长度或最多数目大于限定值。</td></tr>
   *   </table>
   *   可以在格式验证或服务端验证的结果中返回自定义的 errorMessage。
   * @fires validate
   *   调用 validate 方法时触发。
   * @fires validating
   *   调用 validate 方法后，某个表单域开始服务端异步验证时触发。即便有多个表单域都开始服务端异步验证，也仅会触发一次。
   * @fires validated
   *   {boolean} result 验证结果，仅当所有已配置的规则均验证通过时为 true，否则为 false。
   *   对所有已配置的规则验证结束后触发。
   */
  var Validator = new Component(function(element, validationRules) {
    var validator = this;

    // 保存属性。
    var $form = validator.element = $(element);
    validator.validationRules = validationRules;
    validator.resultSet = {};
    validator.isValidating = false;

    // 当验证结束时恢复默认状态。
    validator.on('validated.validation', function() {
      this.off('fieldvalidated.validate, fieldvalidate.validate').isValidating = false;
    });

    // 为控件绑定事件。
    Object.forEach(validationRules, function(rules, name) {
      Array.from($form.elements[name]).forEach(function(control) {
        var $control = $(control).on('change.validation', function() {
          validate(validator, name);
        });
        // 如果设置了 equals 规则且已输入值，则在目标控件的值改变时重新检测本控件的值。
        var relatedName = rules.equals;
        if (relatedName) {
          $($form.elements[relatedName]).on('change.validation', function() {
            if ($control.value) {
              $control.fire('change');
            }
          });
        }
      });
    });

  });

//--------------------------------------------------[Validator.prototype.validate]
  /**
   * 对配置的所有规则进行验证。
   * @name Validator.prototype.validate
   * @function
   * @returns {Object} Validator 对象。
   */
  Validator.prototype.validate = function() {
    var validator = this;
    if (!validator.isValidating) {
      validator.isValidating = true;
      validator.fire('validate');
      // 对尚未验证的域进行验证。
      Object.forEach(validator.validationRules, function(rules, name) {
        if (!validator.resultSet.hasOwnProperty(name)) {
          validate(validator, name);
        }
      });
      // 所有域的验证结果均已收集完毕，开始分析。
      var validatingFields = [];
      var allValidationsPassed = true;
      Object.forEach(validator.resultSet, function(result, name) {
        if (result === undefined) {
          validatingFields.push(name);
        } else {
          allValidationsPassed = allValidationsPassed && result;
        }
      });
      // 处理结果。
      if (validatingFields.length) {
        // 有验证仍在进行。
        validator
            .on('fieldvalidate.validate', function() {
              validator.fire('validated', {result: false});
            })
            .on('fieldvalidated.validate', function(e) {
              if (validatingFields.contains(e.name)) {
                validatingFields.splice(validatingFields.indexOf(e.name), 1);
                allValidationsPassed = allValidationsPassed && !e.errorMessage;
                if (!validatingFields.length) {
                  validator.fire('validated', {result: allValidationsPassed});
                }
              }
            })
            .fire('validating');
      } else {
        // 所有验证均已完成。
        validator.fire('validated', {result: allValidationsPassed});
      }
    }
    return validator;
  };

//--------------------------------------------------[Validator]
  window.Validator = Validator;

});
