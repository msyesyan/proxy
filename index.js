#!/usr/bin/env node

const program = require('commander');
const shelljs = require('shelljs');
const child_process = require('child_process');

const { sshUser, sshServer, sshPort } = require('./config/config.json');
const privoxy_config = '/usr/local/etc/privoxy/config';
const privoxy_pidfile = '/Users/channing/privoxy.pid';

const socks = require('./lib/socks.js')

const startPrivoxy = () => {
  shelljs.exec(`privoxy --pidfile ${privoxy_pidfile} ${privoxy_config}`, { async: true });
  shelljs.echo('privoxy start successfully');
};

const stopPrivoxy = () => {
  let pid = shelljs.test('-f', privoxy_pidfile) && shelljs.cat(privoxy_pidfile);
  if (pid) {
    shelljs.exec(`kill -9 ${pid}`, { silent: true }, function(code, stdout, stderr) {
      if (!stderr) {
        shelljs.rm('-rf', privoxy_pidfile);
        shelljs.echo('stop privoxy successfully');
      }
    });
  }
};

const getStatus = () => {
  return {
    ssh_tunnel: socks.pids.length > 0,
    privoxy: shelljs.test('-f', privoxy_pidfile),
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
