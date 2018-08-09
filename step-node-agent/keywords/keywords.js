exports.Echo = async (input, output, session, properties) => {
  input['properties'] = properties
  output.send(input)
}

exports.ErrorTestKW = async (input, output, session, properties) => {
  throw new Error(input['ErrorMsg'])
}

exports.onError = async (exception, input, output, session, properties) => {
  console.log('[onError] Exception is: \'' + exception + '\'')
  return input['rethrow_error']
}
