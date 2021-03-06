const npath = require('path')
const exec = require('child_process').exec
const fs = require('fs')

const {
  subCommands,
  files: {
    tfFileName,
    tfStateFileName
  }
} = require('./constants.js')

const causeError = (message) => {
  throw new Error(message)
}

// ensure necessary files exist
const ensureFileSystem = ({
  params: { path, projectPath, projectId, tfState, tf }
}) => {
  // resolve path
  const projectDir = npath.join(projectPath, projectId)

  // ensure project directory exists
  fs.existsSync(projectDir)
  || fs.mkdirSync(projectDir)

  // ensure configs exist
  fs.writeFileSync(
    npath.join(projectDir, tfFileName), 
    JSON.stringify(tf, {}, 2)
  )

  fs.writeFileSync(
    npath.join(projectDir, tfStateFileName), 
    JSON.stringify(tfState, {}, 2)
  )
}

// read state file for given project
const readStateFile = ({
  params : { path, projectPath, projectId, tfState, tf }
}) => JSON.parse(
  fs.readFileSync(
    npath.join(projectPath, projectId, tfStateFileName),
    { encoding: 'utf8' }
  )
)

// run a terraform subcommand
const runCommand = ({
  params: { path, projectPath, projectId, tfState, tf, execOptions },
  subCommand
}) => new Promise((resolve, reject) =>
  // execute the command
  exec(
    // generate command
    `${path} ${subCommand}`,
    //  generate options
    Object.assign(
      { cwd: npath.join(projectPath, projectId) },
      execOptions
    ),
    // resolve promise
    (err, stdout, stderr) => 
      err || stderr
        ? reject(err || stderr)
        : resolve(stdout)
  )
)

// export CLI Wrapper
module.exports = ({
  // all arguments can be set at global level
  tf: glTf = undefined,
  path: glPath = '/usr/bin/terraform',
  projectPath: glProjectPath = '.',
  projectId: glProjectId = 'newUUID',
  tfState: glTfState = {}
}) => {
  // ensures arguments exist and provides defaults
  const validate = ({
    tf = glTf || causeError('Argument "tf" is required'),
    path = glPath,
    projectPath = glProjectPath,
    projectId = glProjectId,
    tfState = glTfState,
    execOptions = null
  }) => ({ path, projectPath, projectId, tfState, tf, execOptions })

  // wrap subcommands in function to call cli
  const subCommandWrapper = (subCommand) => 
    (params = {}) => {
      params = validate(params)
      ensureFileSystem({params})
      return runCommand({ // run subcommand with valid params
        params,
        subCommand
      })
      .then(({stdout}) => ({ // add tfState to output
        stdout,
        tfState: readStateFile({params})
      }))
    }
  
  return Object.assign(
    {
      // provide wrapper to run subcommands as strings
      subCommand: subCommandWrapper
    },
    // create object out of valid commands
    subCommands
    // normalize all commands to { name, cmd } format
    .map(subCommand => 
      typeof subCommand == 'string'
        ? { name: subCommand, cmd: subCommand }
        : subCommand
    )
    // map subcommands to function wrapper
    .map(({name, cmd}) => ({
      // return object keyed by commandName
      [name]: subCommandWrapper(cmd)
    }))
    // reduce into object
    .reduce((subCommandsByName, subCommand) =>
      Object.assign(
        subCommandsByName,
        subCommand
      ),
      {}
    )
  )
}