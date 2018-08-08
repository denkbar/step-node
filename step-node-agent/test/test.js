const runner = require('../api/runner/runner')({'Property1':'Prop1'})
const assert = require('assert')

;(async () => {
  const output = await runner.run('Echo', {Param1:'Val1'})
  assert.equal(output.payload.Param1, 'Val1')
  assert.equal(output.payload.properties.Property1, 'Prop1')
})()

;(async () => {
  const errorMsg = 'My Error';
  const output = await runner.run('ErrorTestKW', {ErrorMsg:errorMsg})
  assert.equal(output.error, errorMsg)
})()
