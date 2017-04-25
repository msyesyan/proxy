const shelljs = require('shelljs');

const { sshUser, sshServer, sshPort } = require('../config/config.json');
const homedir = require('os').homedir();

module.exports = {
  get cmd() {
    return `ssh -D ${sshPort} -CfNg ${sshUser}@${sshServer}`;
  },
  get pids() {
    const pids_cmd = `ps -ax -o command -o pid | grep "^ssh -D ${sshPort}"`;
    return shelljs.exec(pids_cmd, { silent: true }).stdout.split('\n').filter(Boolean).map(pros => {
      return pros.split(' ').pop();
    });
  },
  get started() {
    return this.pids.length > 0;
  },
  start: function(options = {}) {
    shelljs.echo('creating ssh tunel to proxy server');
    if (this.started) {
      shelljs.echo('ssh tunel to ssh server has already been created');
    } else {
      if (shelljs.test('-f', `${homedir}/.secrets/blink`)) {
        shelljs.exec(`pbcopy < ${homedir}/.secrets/blink`);
      }
      shelljs.exec(this.cmd, options);
    }
  },
  stop: function() {
    shelljs.exec(`kill -9 ${this.pids.join(' ')}`, { silent: true });
    shelljs.echo('socks stopped successfully');
  }
};
