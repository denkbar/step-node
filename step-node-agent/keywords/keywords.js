exports.Echo = async (input, output, session) => {

  //throw new Error("some type of error.");

  output.send(input)
}
