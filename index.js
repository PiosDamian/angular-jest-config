#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const libPackage = require('./package.json');

(function () {
  const createPath = suffix => {
    return path.join(suffix);
  };

  const main = async () => {
    const arguments = process.argv;
    if (arguments.includes('-v') || arguments.includes('--version')) {
      process.stdout.write(`\n${libPackage.version}\n`);
    } else {
      await execCommands();
      createFiles();

      updatePackage();

      updateAngular();

      deleteFiles();

      updateTsConfigSpec();
    }
  };

  const execCommands = () => {
    return execCommandPromise('npm i -D jest jest-preset-angular ts-jest @types/jest').then(() =>
      execCommandPromise(
        'npm uninstall karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter'
      )
    );
  };

  const execCommandPromise = command => {
    return new Promise((res, rej) => {
      const prefix = ['\\', '|', '/', '-'];

      let currentPrefixIndex = prefix.length;

      const interval = setInterval(() => {
        currentPrefixIndex = ++currentPrefixIndex >= prefix.length ? 0 : currentPrefixIndex;
        process.stdout.write(`${prefix[currentPrefixIndex]} Executing ${command}`);
        process.stdout.write('\r');
      }, 200);

      const child = exec(command, (err, stdout, stderr) => {
        clearInterval(interval);
        if (err) {
          process.stderr.write(`\nexec error: ${err}`);
          rej(err);
        }
        process.stderr.write(`\n${stderr}`);
        res();
      });

      child.stdout.pipe(process.stdout);
    });
  };

  const createFiles = () => {
    try {
      fs.writeFileSync(createPath('src/jestGlobalMock.ts'), '');
      process.stdout.write('\nFile jestGlobalMock.ts created');
    } catch (err) {
      process.stderr.write('\nProblem with creating file jestGlobalMock.ts');
      process.stderr.write(`\n${err}`);
      process.stderr.write(`\nYou can do it by yourself`);
      process.stderr.write(`\nJust create empty file src/jestGlobalMock.ts`);
    }

    try {
      fs.writeFileSync(createPath('src/setupJest.ts'), "import 'jest-preset-angular'; \n import './jestGlobalMock';");
      process.stdout.write('\nFile setupJest.ts created');
    } catch (err) {
      process.stderr.write('\nProblem with creating file setupJest.ts');
      process.stderr.write(`\n${err}`);
      process.stderr.write(`\nYou can do it by yourself`);
      process.stderr.write(`\nJust create file src/setupJest.ts`);
      process.stderr.write(`\nand write import 'jest-preset-angular'; \n import './jestGlobalMock';`);
    }
  };

  const updatePackage = () => {
    const packagePath = createPath('package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'UTF-8'));
    packageJson.jest = {
      preset: 'jest-preset-angular',
      setupFilesAfterEnv: ['<rootDir>/src/setupJest.ts'],
      roots: ['src'],
      testPathIgnorePatterns: ['<rootDir>/src/test.ts']
    };
    packageJson.scripts.test = 'jest';

    try {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      process.stdout.write('\nFile package.json updated');
    } catch (err) {
      process.stderr.write('\nProblem with updating file package.json');
      process.stdout.write('\nYou can do it by yourself');
      process.stdout.write('\nJust add following to package.json');
      process.stdout.write(`\njest: ${JSON.stringify(packageJson.jest, null, 2)}`);
      process.stdout.write('\nAnd change scripts.test to "jest"');
      process.stderr.write(`\n${err}`);
    }
  };

  const updateAngular = () => {
    const angularPath = createPath('angular.json');
    const angular = JSON.parse(fs.readFileSync(angularPath, 'UTF-8'));

    const keys = Object.keys(angular.projects);
    keys.forEach(key => {
      try {
        angular.projects[key].architecture.test = undefined;
      } catch (e) {}
    });
    try {
      fs.writeFileSync(angularPath, JSON.stringify(angular, null, 2));
      process.stdout.write('\nFile angular.json updated');
    } catch (err) {
      process.stderr.write('\nProblem with updating file angular.json');
      process.stdout.write('\nYou can do it by yourself');
      process.stdout.write('\nJust remove test section from all projects');
      process.stderr.write(`\n${err}`);
    }
  };

  const deleteFiles = () => {
    try {
      fs.unlinkSync(createPath('karma.conf.js'));
      process.stdout.write('\nFile src/karma.config.js deleted');
    } catch (err) {
      process.stderr.write('\nProblem with deleting file src/karma.config.js');
      process.stderr.write(err);
    }

    try {
      fs.unlinkSync(createPath('src/test.ts'));
      process.stdout.write('\nFile src/test.ts deleted');
    } catch (err) {
      process.stderr.write('\nProblem with deleting file src/test.ts');
      process.stderr.write(err);
    }
  };

  const updateTsConfigSpec = () => {
    const tsconfigPath = createPath('tsconfig.spec.json');
    const tsconfigSpec = JSON.parse(fs.readFileSync(tsconfigPath, 'UTF-8'));

    const specFiles = tsconfigSpec.files;
    tsconfigSpec.compilerOptions.esModuleInterop = true;
    tsconfigSpec.compilerOptions.emitDecoratorMetadata = true;

    const index = specFiles.findIndex(file => file === 'src/test.ts');
    if (index > -1) {
      specFiles.splice(index, 1);
      try {
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfigSpec, null, 2));
        process.stdout.write('\nFile tsconfig.spec.json updated');
      } catch (err) {
        process.stderr.write('\nProblem with updating file tsconfig.spec.json');
        process.stdout.write('\nYou can do it by yourself');
        process.stdout.write('\nJust remove "src/test.ts" from files section');
        process.stdout.write('\nAnd add "sModuleInterop": true to compiler options');
        process.stdout.write('\nIn tsconfig.spec.json');
        process.stderr.write(`\n${err}`);
      }
    }
  };

  main();
})();
