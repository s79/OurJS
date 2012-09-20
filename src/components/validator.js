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
   *   当 fieldvalidated 事件被触发时，事件对象的 errorMessage 属性值为“错误信息”，如果为空则表示当前表单域已通过验证。
   *
   * 执行 validate 方法时的流程：
   *   对可能存在的尚未验证的域进行“被动验证”。
   *   检查 validator.resultSet。
   *   如果有需要服务端验证的，触发 validating 事件，并在所有的服务端验证结束时，触发 validated(true/false) 事件。
   *   否则，根据检查结果触发 validated(true/false) 事件。
   *   在 validating 事件触发后，等待的所有服务端验证尚未结束前，如果任一控件触发了“主动验证”，则同时触发 validated(false)，本次验证按失败处理。
   */

  // 类型验证。
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

//--------------------------------------------------[Validator Constructor]
  /**
   * 表单验证器。
   * @name Validator
   * @constructor
   * @param {Element} element 要验证的表单元素。
   * @param {Object} validationRules 要验证的表单域名称及规则，格式为 <dfn>{<var>name</var>: <var>rules</var>, ...}</dfn>。
   *   属性名 <var>name</var> 为要验证的表单域的名称，即本表单元素内对应的 input/select/textarea 元素的 name 属性值。
   *   属性值 <var>rules</var> 为定义验证规则的对象，包括 7 种验证方式。
   *   前 5 种是“预置”的，均以一个包含两个元素的数组来定义：第一个元素为验证的参考值，第二个元素为验证失败时的“错误信息”字符串。
   *   后 2 种是“自定”的，开发者可以自行决定验证方式，并在验证结束时返回“错误信息”。
   *   “错误信息”将作为 fieldvalidated 事件对象的 errorMessage 属性的值。
   *   详情请见下表：
   *   <table>
   *     <tr><th>验证方式</th><th>值类型</th><th>详细描述</th></tr>
   *     <tr><td><dfn>required</dfn></td><td>Array</td><td>限定该表单域的值不能为空。数组的第一个元素为 boolean 类型。</td></tr>
   *     <tr><td><dfn>equals</dfn></td><td>Array</td><td>限定该表单域的值与相关表单域的值一致，仅应在这两个表单域均只包含一个文本控件时指定。数组的第一个元素为 string 类型，用于指定相关表单域的名称（不能指定为该表单域自身的名称）。</td></tr>
   *     <tr><td><dfn>minLength</dfn></td><td>Array</td><td>当该表单域只包含一个文本控件时，限定输入文本的最小长度，否则限定选择项的最少数目。数组的第一个元素为 number 类型。</td></tr>
   *     <tr><td><dfn>maxLength</dfn></td><td>Array</td><td>当该表单域只包含一个文本控件时，限定输入文本的最大长度，否则限定选择项的最多数目。数组的第一个元素为 number 类型。</td></tr>
   *     <tr><td><dfn>type</dfn></td><td>Array</td><td>限定数据的类型。数组的第一个元素为 string 类型，可以为 number/date/email/phone 中的任一个。</td></tr>
   *     <tr><td><dfn>custom</dfn></td><td>Function</td><td>用来对该表单域的值进行进一步验证的函数，该函数被调用时传入该表单域的值，其 this 的值为本表单元素，返回值应为一个“错误信息”字符串，为空则表示验证通过。</td></tr>
   *     <tr><td><dfn>remote</dfn></td><td>Object</td><td>指定对该表单域的值进行服务端验证，包含两个属性：url 和 config，详细内容请参考 Request 组件。注意利用 config.requestParser 和 config.responseParser 对请求和响应数据进行预处理。该表单域的值将被作为参数传入 send 方法，finish 事件对象应具备 errorMessage 属性（“错误信息”字符串），为空则表示验证通过。</td></tr>
   *   </table>
   *   进行验证的步骤为 required - equals - minLength - maxLength - type - custom - remote。
   *   若不需要某种类型的验证，在 <var>rules</var> 中省略对应的项即可。
   * @fires validatefield
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   调用 validateField 方法时触发。当该表单域的值发生改变或调用 validate 方法时，validateField 方法可能被自动调用。
   * @fires fieldvalidating
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   当一个表单域开始服务端验证时触发。
   * @fires fieldvalidated
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   {string} errorMessage “错误信息”字符串，为空则表示验证通过。
   *   当一个表单域验证结束后触发。
   * @fires validate
   *   调用 validate 方法时触发。
   * @fires validating
   *   调用 validate 方法后，某个表单域开始服务端验证时触发。即便有多个表单域都开始了服务端验证，也仅会触发一次。
   * @fires validated
   *   {boolean} result 验证结果，仅当所有已配置的规则均验证通过时为 true，否则为 false。
   *   对所有已配置的规则验证结束后触发。
   * @fires reset
   *   调用 reset 方法时触发。
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
      this.off('fieldvalidated.validate, validatefield.validate').isValidating = false;
    });

    // 为控件绑定事件。
    Object.forEach(validationRules, function(rules, name) {
      Array.from($form.elements[name]).forEach(function(control) {
        var $control = $(control).on('change.validation', function() {
          validator.validateField(name);
        });
        // 如果设置了 equals 规则且已输入值，则在目标控件的值改变时重新检测本控件的值。
        var relatedName = rules.equals && rules.equals[0];
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

//--------------------------------------------------[Validator.prototype.validateField]
  /**
   * 对指定的表单域进行验证。
   * @name Validator.prototype.validateField
   * @function
   * @param {string} name 要验证的表单域名称。
   * @returns {Object} Validator 对象。
   * @description
   *   指定的表单域必须已配置验证规则。
   */
  Validator.prototype.validateField = function(name) {
    var validator = this;
    var resultSet = validator.resultSet;
    var $form = validator.element;
    var value = $form.getFieldValue(name);
    var rules = validator.validationRules[name];
    var errorMessage = '';
    var rule;
    resultSet[name] = undefined;
    validator.fire('validatefield', {name: name, value: value});
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
      rules.lastRequest = new Request(remote.url, remote.config)
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
    return validator;
  };

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
          validator.validateField(name);
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
            .on('validatefield.validate', function() {
              validator.fire('validated', {result: false});
            })
            .on('fieldvalidated.validate', function(e) {
              if (validatingFields.contains(e.name)) {
                validatingFields.remove(e.name);
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

//--------------------------------------------------[Validator.prototype.reset]
  /**
   * 复位表单验证器。
   * @name Validator.prototype.reset
   * @function
   * @returns {Object} Validator 对象。
   */
  Validator.prototype.reset = function() {
    this.resultSet = {};
    this.off('fieldvalidated.validate, validatefield.validate').isValidating = false;
    Object.forEach(this.validationRules, function(rules) {
      if (rules.lastRequest) {
        rules.lastRequest.off('finish').abort();
      }
    });
    this.fire('reset');
    return this;
  };

//--------------------------------------------------[Validator]
  window.Validator = Validator;

});
