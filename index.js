#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

const main = () => {
    execCommands().then(() => {
        createFiles();

        updatePackage();

        updateAngular();

        deleteFiles();

        updateTsConfigSpec();
    });
}

const execCommands = async () => {
    return execCommandPromise('npm i --save-dev jest jest-preset-angular')
        .then(() => execCommandPromise('npm uninstall karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter'))
};

const execCommandPromise = async (command) => {
    return new Promise((res, rej) => {
        const child = exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(`exec error: ${err}`);
                rej(err);
            }
            console.error(stderr);
            res();
        });

        child.stdout.pipe(process.stdout);
    });
}

const createFiles = () => {
    try {
        fs.writeFileSync('src/jestGlobalMock.ts', '');
        console.log('File jestGlobalMock.ts created');
    } catch (err) {
        console.error('Problem with creating file jestGlobalMock.ts');
        console.error(err);
        throw err;
    }

    try {
        fs.writeFileSync('src/setupJest.ts', "import 'jest-preset-angular'\; \n import './jestGlobalMock'\;");
        console.log('File setupJest.ts created');
    } catch (err) {
        console.error('Problem with creating file setupJest.ts');
        console.error(err);
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
        console.log('File package.json updated');
    } catch (err) {
        console.error('Problem with updating file package.json');
        console.log('You can do it by yourself');
        console.log('Just add following to package.json');
        console.log(`jest: ${JSON.stringify(packageJson.jest, null, 2)}`);
        console.log('And change scripts.test to "jest"');
        console.error(err);

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
        console.log('File angular.json updated');
    } catch (err) {
        console.error('Problem with updating file angular.json');
        console.log('You can do it by yourself');
        console.log('Just remove test section from all projects');
        console.error(err);

    }
};

const deleteFiles = () => {
    try {
        fs.unlinkSync('karma.conf.js');
        console.log('File src/karma.config.js deleted');
    } catch (err) {
        console.error('Problem with deleting file src/karma.config.js');
        console.error(err);
    }

    try {
        fs.unlinkSync('src/test.ts');
        console.log('File src/test.ts deleted');
    } catch (err) {
        console.error('Problem with deleting file src/test.ts');
        console.error(err);
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
            console.log('File tsconfig.spec.json updated');
        } catch (err) {
            console.error('Problem with updating file tsconfig.spec.json');
            console.log('You can do it by yourself');
            console.log('Just remove "src/test.ts" from files section');
            console.log('And add "sModuleInterop": true to compiler options');
            console.log('In tsconfig.spec.json');
            console.error(err);
        }
    }
};

main();