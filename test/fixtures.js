const { exec, spawn } = require('node:child_process');
const _ = require('lodash');
const terminate = require('terminate');
const dotenv = require("dotenv");
// load .env
dotenv.config();

/**
 * @type {import('node:child_process').ChildProcessWithoutNullStreams}
 */
var docker;

async function dockerDown() {
    function isDown(bufferData) {
        const readyMessage = "Container slack-potluck-test-db-1  Removed";

        return bufferData.toString().includes(readyMessage);
    }

    return new Promise((resolve, reject) => {
        var d = spawn('docker', ['compose', '-f', 'docker-compose.test.yml', 'down']);
        let stopped = false;
        const messageHandler = (buffer) => {
            if (isDown(buffer)) {
                stopped = true;
            }
        };

        d.stdout.on('data', messageHandler);
        d.stderr.on('data', messageHandler);
        d.on('error', (e) => {
            reject(e);
        });
        d.on('close', (code) => {
            if (code == 0 && stopped) {
                resolve(code);
                return;
            }
            reject(code);
        });
    
    });
}

async function killDocker() {
    await (new Promise((resolve, reject) => {
        terminate(docker.pid, 'SIGKILL', (e, d) => {
            if (e) {
                reject(e);
                return;
            }
            resolve(d);
        });
    }));
    docker = null;
    await dockerDown();
}

process.on('SIGINT', () => {
   if (docker) {
     killDocker()
        .then(console.log)
        .error(console.error);
   } 
});


async function spawnDocker() {
    function isReady(bufferData) {
        const readyMessage = "ready for connections";
        const readyMessage2 = "Running";

        return bufferData.toString().includes(readyMessage) || 
            bufferData.toString().includes(readyMessage2);
    }

    return new Promise((resolve, reject) => {
        var d = spawn('docker', ['compose', '-f', 'docker-compose.test.yml', 'up', 'db'], {
            killSignal: 'SIGINT',
            shell: '/bin/bash'
        });

        const resolveOnce = _.once(resolve);
        const messageHandler = (buffer) => {
            // console.debug(buffer.toString());
            if (isReady(buffer)) {
                resolveOnce(d);
            }
        };

        d.stdout.on('data', messageHandler);
        d.stderr.on('data', messageHandler);
        d.on('error', (e) => {
            reject(e);
        });
        d.on('disconnect', () => {
            // console.debug('DISCONNECT');
        });
        d.on('exit', (code) => {
            // console.debug('EXIT', code);
        });
        d.on('close', (code) => {
            d.stdin.write('SIGKILL');
            // console.debug('CLOSE', code);
        });
    });
}

function dbMigrate() {
    return new Promise((resolve, reject) => {
        exec('docker compose -f docker-compose.test.yml run --rm db_migrate_job', (e, stdout, stderr) => {
            if (e) {
                reject(e);
                return;
            }
            resolve();
        });
    });
}

exports.mochaGlobalSetup = async function() {
    console.log('SETUP');
    docker = await spawnDocker();
    await dbMigrate();
}

exports.mochaGlobalTeardown = async function() {
    console.log('TEARDOWN');
    await killDocker();
}