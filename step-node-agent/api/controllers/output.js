module.exports = function OutputBuilder (callback) {
  let exports = {}

  exports.builder = {payload: {attachments: [], payload: {}}, attachments: []}

  exports.send = function (payload) {
    exports.builder.payload.payload = payload
    if (callback) {
      callback(exports.builder)
    }
  }

  exports.fail = function (e) {
    function buildDefaultTechnicalError (message) {
      return {msg: message, type: 'TECHNICAL', root: true, code: 0}
    }
    // console.log(e)
    if (e instanceof Error) {
      exports.builder.payload.error = buildDefaultTechnicalError(e.message)
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
      exports.builder.payload.error = buildDefaultTechnicalError(e)
    }
    if (callback) {
      callback(exports.builder)
    }
  }

  exports.attach = function (attachment) {
    exports.builder.payload.attachments.push(attachment)
  }

  return exports
}
