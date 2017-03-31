module.exports = {
  subCommands: [
    'apply',
    {
      name: 'destroy',
      cmd: 'destroy -force'
    },
    'destroy-managed',
    'fmt',
    'force-unlock',
    'get',
    'graph',
    'import',
    'init',
    'output',
    'plan',
    'push',
    'refresh',
    'show',
    'taint',
    'untaint',
    'validate',
    'version'
  ],
  files: {
    tfFileName: 'resources.tf',
    tfStateFileName: 'resources.tfState'
  }
}