const npath = require('path')
const exec = require('child_process').exec
const fs = require('fs')

const causeError = (message) => {
  throw new Error(message)
}

// ensure necessary files exist
const ensureFileSystem = ({
  params: { path, projectPath, projectId, tfState, tf }
}) => {
  // resolve paths
  const projectDir = npath.join(projectPath, projectId)
  const tfFile = npath.join(projectDir, 'resources.tf')
  const tfStateFile = npath.join(projectDir, 'resources.tfState')

  // ensure project directory exists
  fs.existsSync(projectDir)
  || fs.mkdirSync(projectDir)

  fs.existsSync(tfFile)
  || fs.writeFileSync(tfFile, JSON.stringify(tf, {}, 2))

  fs.existsSync(tfStateFile)
  || fs.writeFileSync(tfStateFile, JSON.stringify(tfState, {}, 2))
}

// run a terraform subcommand
const runCommand = ({
  params: { path, projectPath, projectId, tfState, tf },
  subCommand
}) => new Promise((resolve, reject) =>
  // execute the command
  exec(
    `${path} ${subCommand}`,
    { cwd: `${projectPath}/${projectId}` },
    // resolve promise
    ({err, stdout, stderr}) => 
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
    tfState = glTfState
  }) => ({ path, projectPath, projectId, tfState, tf })

  return {
    plan: (params = {}) => {
      params = validate(params)
      ensureFileSystem({params})
      return runCommand({
        params,
        subCommand: 'plan'
      })
    }
  }
}