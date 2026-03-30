import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';

import { GameConfiguration, GameEnvironment } from '@src/types';
import { BINARIES_PATH } from './binariesUpdate';

let childProcess: ChildProcessWithoutNullStreams | undefined = undefined;
let stdOutRemaining = '';

const scriptCommand = `RubyVM::InstructionSequence.load_from_binary(File.binread("Game.yarb")).eval`;

const getSpawnArgs = (rubyPath: string): [string, string[]] => {
  if (process.platform === 'win32') {
    return [path.join(rubyPath, 'rubyw.exe'), ['-e', scriptCommand]];
  } else if (process.platform === 'linux') {
    return [path.join(rubyPath, 'game-linux.sh'), []];
  } else {
    return [path.join(rubyPath, 'game.rb'), []];
  }
};

export const startGame = (gamePath: GameConfiguration['gamePath'], environment: GameEnvironment, event: IpcMainEvent) => {
  const pathInstall = gamePath.replace('<channel>', environment);

  if (childProcess && childProcess.exitCode === null) {
    return event.sender.send('start-game/result', false);
  }

  if (!fs.existsSync(path.join(pathInstall, 'Game.yarb'))) {
    log.error('File not found: ', path.join(pathInstall, 'Game.yarb'));
    return event.sender.send('start-game/result', false);
  }

  let rubyPath = path.join(pathInstall, BINARIES_PATH);
  if (!fs.existsSync(rubyPath)) {
    log.info('Binaries directory not found:', rubyPath);
    rubyPath = path.join(pathInstall, '../..');
    log.info('Fallback to old binaries directory:', rubyPath);
  }

  childProcess = spawn(...getSpawnArgs(rubyPath), { cwd: pathInstall, detached: true, env: { ...process.env, GAMEDEPS: rubyPath } });
  childProcess.stderr.on('data', (chunk) => log.error(chunk.toString()));
  childProcess.stdout.on('data', (chunk) => {
    const arrData = (stdOutRemaining + chunk.toString()).split('\n');
    stdOutRemaining = arrData.pop() || '';
    // Handle progress
    arrData
      .filter((line) => line.startsWith('progress: '))
      .forEach((line) => {
        event.sender.send('start-game/progress', Number(line.replace('progress: ', '')));
      });
    // Handle process disconnection
    if (arrData.some((line) => line === 'close')) {
      childProcess?.stdout.removeAllListeners();
      childProcess?.unref();
      childProcess = undefined;
      stdOutRemaining = '';
    }
  });

  childProcess.on('exit', (code) => {
    event.sender.send('start-game/progress', 100); // to fix softlock if psdk closes without sending progress
    event.sender.send('start-game/exitCode', code);
  });

  childProcess.on('error', (err) => {
    log.error(err);
    return event.sender.send('start-game/result', false);
  });

  event.sender.send('start-game/result', true);
};
