### Example
```javascript
let terraform = require('node-terraform')({
  path: '',
  projectId: '',
  tf,
  tfState
})

// ensures dirs created on each command

// run command
terraform.plan({
  tf: {} // override values
})
  .then(({raw, parsed}) =>
    terraform.apply({}) // run apply
  )
  .then(({state, raw, parsed}) =>
    // do something with the state
    terraform.clean({}) // clean directories (optional)
  )

```