module.exports = function OutputBuilder (callback) {
  let exports = {}

  exports.builder = {attachments: []}

  exports.send = function (payload) {
    exports.builder.payload = payload
    if (callback) {
      callback(exports.builder)
    }
  }

  exports.fail = function (e) {
    // console.log(e)
    if (e instanceof Error) {
      exports.builder.error = e.message
      exports.attach(
        {
          'name': 'exception.log',
          'isDirectory': false,
          'description': 'exception stacktrace from keyword',
          'hexContent': Buffer.from(e.stack).toString('base64')
        })
    } else {
      exports.builder.error = e
    }
    if (callback) {
      callback(exports.builder)
    }
  }

  exports.attach = function (attachment) {
    exports.builder.attachments.push(attachment)
  }

  return exports
}
