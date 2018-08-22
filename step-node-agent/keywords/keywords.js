exports.Echo = async (input, output, session, properties) => {
  input['properties'] = properties
  output.send(input)
}

exports.ErrorTestKW = async (input, output, session, properties) => {
  throw new Error(input['ErrorMsg'])
}

exports.ErrorRejectedPromiseTestKW = async (input, output, session, properties) => {
  Promise.reject(new Error('test'))
  output.send()
}

exports.ErrorUncaughtExceptionTestKW = async (input, output, session, properties) => {
  process.nextTick(function () {
    throw new Error()
  })
  output.send()
}

exports.onError = async (exception, input, output, session, properties) => {
  console.log('[onError] Exception is: \'' + exception + '\'')
  global.isOnErrorCalled = true
  return input['rethrow_error']
}
