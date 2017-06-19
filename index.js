#!/usr/bin/env node

const program = require('commander');
const shelljs = require('shelljs');

const { sshUser, sshServer, sshPort } = require('./config/config.json');
const privoxy_config = '/usr/local/etc/privoxy/config';

const socks = require('./lib/socks.js')

const startPrivoxy = () => {
  shelljs.exec(`privoxy ${privoxy_config}`);
  shelljs.echo('privoxy start successfully');
};

const stopPrivoxy = () => {
  let pid = shelljs.exec('ps -axc | pgrep privoxy | head -n 1')
  if (pid) {
    shelljs.exec(`kill -9 ${pid}`, { silent: true }, function(code, stdout, stderr) {
      if (!stderr) {
        shelljs.echo(`kill pid ${pid}, stop privoxy successfully`);
      }
    });
  }
};

const getStatus = () => {
  return {
    ssh_tunnel: socks.pids.length > 0,
    privoxy: !!shelljs.exec('ps -axc | pgrep privoxy | head -n 1')
  }
}

const start = () => {
  startPrivoxy();
  socks.start({ async: true} );
};

const stop = () => {
  stopPrivoxy();
  socks.stop();
  shelljs.echo('stop proxy successfully');
};

const status = () => {
  shelljs.echo(getStatus());
};

program.version('1.0.0')

program
  .command('start')
  .action(start)

program
  .command('stop')
  .action(stop)

program
  .command('status')
  .action(status)

program.parse(process.argv);
