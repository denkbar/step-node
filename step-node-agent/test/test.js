const runner = require('../api/runner/runner')()
const assert = require('assert')

;(async () => {
  const output = await runner.run('Echo', {Param1:'Val1'})
  assert.equal(output.payload.Param1, 'Val1')
})()
