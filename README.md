# node-terraform
Wraps the terraform CLI

## basic requirements
Will be able to ensure a file structure exists
* this file structure will be indexed by a projectId

Will be able to run all terraform commands

Will be able to perform basic parsing on output

Will read resulting state file and return it

Will provide option to clean the directory structure
* it can always be recreated

### Usage Example
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