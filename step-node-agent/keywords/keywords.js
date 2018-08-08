exports.Echo = async (input, output, session, properties) => {
  // throw new Error("some type of error.");
  input['properties'] = properties
  output.send(input)
}

exports.ErrorTestKW = async (input, output, session, properties) => {
  throw new Error(input['ErrorMsg'])
}
