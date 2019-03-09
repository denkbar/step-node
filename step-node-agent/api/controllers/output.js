module.exports = function OutputBuilder(callback) {
  let exports = {}

  exports.builder = { payload: { attachments: [], payload: {} }, attachments: [] }

  exports.send = function (payload) {
    exports.builder.payload.payload = payload
    if (callback) {
      callback(exports.builder)
    }
  }

  exports.buildDefaultTechnicalError = function (message) {
    return { msg: message, type: 'TECHNICAL', root: true, code: 0 }
  }

  exports.dealWithExceptionObject = function (e) {
    if (e instanceof Error) {
      exports.builder.payload.error = exports.buildDefaultTechnicalError('['+e.name+'] '+e.message)
      exports.attach(
        {
          'name': 'exception.log',
          'isDirectory': false,
          'description': 'exception stacktrace from keyword',
          'hexContent': Buffer.from(e.stack).toString('base64')
        })
    } else if (typeof e === 'object') {
      exports.builder.payload.error = e
    } else {
      exports.builder.payload.error = exports.buildDefaultTechnicalError(e)
    }
  }

  exports.failWithException = function (e) {
    exports.dealWithExceptionObject(e);
    if (callback) {
      callback(exports.builder)
    }
  }

  exports.failWithMessage = function (msg) {
    exports.builder.payload.error = exports.buildDefaultTechnicalError(msg)
    if (callback) {
      callback(exports.builder)
    }
  }

  exports.failWithMessageAndException = function(msg, e) {
    exports.dealWithExceptionObject(e)
    exports.builder.payload.error.msg = msg + '. Message was: ' + exports.builder.payload.error.msg
    if (callback) {
      callback(exports.builder)
    }
  }

  exports.attach = function (attachment) {
    exports.builder.payload.attachments.push(attachment)
  }

  return exports
}
