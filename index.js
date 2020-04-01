#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

const main = async () => {
    await execCommands()
    createFiles();

    updatePackage();

    updateAngular();

    deleteFiles();

    updateTsConfigSpec();
}

const execCommands = () => {
    return execCommandPromise('npm i --save-dev jest jest-preset-angular')
        .then(() => execCommandPromise('npm uninstall karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter'))
};

const execCommandPromise = (command) => {
    return new Promise((res, rej) => {
        const prefix = [
            '\\', '|', '/', '-'
        ];

        let currentPrefixIndex = prefix.length;

        const interval = setInterval(() => {
            currentPrefixIndex = ++currentPrefixIndex >= prefix.length ? 0 : currentPrefixIndex;
            process.stdout.write(`${prefix[currentPrefixIndex]} Executing ${command}`);
            process.stdout.write('\r');
        }, 200)

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
}

const createFiles = () => {
    try {
        fs.writeFileSync('src/jestGlobalMock.ts', '');
        process.stdout.write('\nFile jestGlobalMock.ts created');
    } catch (err) {
        process.stderr.write('\nProblem with creating file jestGlobalMock.ts');
        process.stderr.write(`\n${err}`);
        throw err;
    }

    try {
        fs.writeFileSync('\nsrc/setupJest.ts', "import 'jest-preset-angular'\; \n import './jestGlobalMock'\;");
        process.stdout.write('\nFile setupJest.ts created');
    } catch (err) {
        process.stderr.write('\nProblem with creating file setupJest.ts');
        process.stderr.write(`\n${err}`);
        throw err;
    }
};

const updatePackage = () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'UTF-8'));
    packageJson.jest = {
        preset: "jest-preset-angular",
        setupFilesAfterEnv: [
            "<rootDir>/src/setupJest.ts"
        ],
        roots: [
            "src"
        ],
        testPathIgnorePatterns: [
            "<rootDir>/src/test.ts"
        ]
    }
    packageJson.scripts.test = 'jest';

    try {
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
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
    const angular = JSON.parse(fs.readFileSync('angular.json', 'UTF-8'));

    const keys = Object.keys(angular.projects);
    keys.forEach(key => {
        try {
            angular.projects[key].architecture.test = undefined;
        } catch (e) {

        }
    });
    try {
        fs.writeFileSync('angular.json', JSON.stringify(angular, null, 2));
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
        fs.unlinkSync('karma.conf.js');
        process.stdout.write('\nFile src/karma.config.js deleted');
    } catch (err) {
        process.stderr.write('\nProblem with deleting file src/karma.config.js');
        process.stderr.write(err);
    }

    try {
        fs.unlinkSync('src/test.ts');
        process.stdout.write('\nFile src/test.ts deleted');
    } catch (err) {
        process.stderr.write('\nProblem with deleting file src/test.ts');
        process.stderr.write(err);
    }
};

const updateTsConfigSpec = () => {
    const tsconfigSpec = JSON.parse(fs.readFileSync('tsconfig.spec.json', 'UTF-8'));

    const specFiles = tsconfigSpec.files;
    tsconfigSpec.compilerOptions.sModuleInterop = true;

    const index = specFiles.findIndex(file => file === 'src/test.ts');
    if (index > -1) {
        specFiles.splice(index, 1);
        try {
            fs.writeFileSync('tsconfig.spec.json', JSON.stringify(tsconfigSpec, null, 2));
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