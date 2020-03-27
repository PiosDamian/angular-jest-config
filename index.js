const { exec } = require('child_process');
const fs = require('fs');

const main = () => {
    exec('npm i --save-dev jest jest-preset-angular');
    exec('npm uninstall karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter');
    fs.writeFile('src/jestGlobalMock.ts', '', err => {
        if (err) {
            console.error('Problem with creating file jestGlobalMock.ts');
            console.error(err);
            throw err;
        }
        console.log('File jestGlobalMock.ts created');
    });
    fs.writeFile('src/setupJest.ts', "import 'jest-preset-angular'\;\nimport './jestGlobalMock'\;", err => {
        if (err) {
            console.error('Problem with creating file setupJest.ts');
            console.error(err);
            throw err;
        }
        console.log('File jestGlobalMock.ts created');
    });

    const package = JSON.parse(fs.readFileSync('package.json', 'UTF-8'));
    console.log(package);
    package.jest = {
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
    package.scripts.test = 'jest';
    fs.writeFile('package.json', JSON.stringify(package, null, 2), err => {
        if (err) {
            console.error('Problem with updating file package.json');
            console.log('You can do it by yourself');
            console.log('Just add following to package.json');
            console.log(`jest: ${JSON.stringify(package.jest, null, 2)}`);
            console.log('And change scripts.test to "jest"');
            console.error(err);
        }
        console.log('File package.json updated');
    });

    const angular = JSON.parse(fs.readFileSync('angular.json', 'UTF-8'));

    const keys = Object.keys(angular.projects);
    keys.forEach(key => {
        angular.projects[key].architecture.test = undefined;
    });

    fs.writeFile('angular.json', JSON.stringify(angular, null, 2), err => {
        if (err) {
            console.error('Problem with updating file angular.json');
            console.log('You can do it by yourself');
            console.log('Just remove test section from all projects');
            console.error(err);
        }
        console.log('File angular.json updated');
    });

    fs.unlink('src/karma.config.js', err => {
        if (err) {
            console.error('Problem with deleting file src/karma.config.js');
            console.error(err);
        }
        console.log('File src/karma.config.js updated');
    });

    fs.unlink('src/test.ts', err => {
        if (err) {
            console.error('Problem with deleting file src/test.ts');
            console.error(err);
        }
        console.log('File src/test.ts updated');
    });

    const tsconfigSpec = JSON.parse(fs.readFileSync('tsconfig.spec.json', 'UTF-8'));

    const specFiles = tsconfigSpec.files;

    const index = specFiles.findIndex(file => file === 'src/test.ts');
    if (index > -1) {
        specFiles.splice(index, 1);
        fs.writeFile('tsconfig.spec.json', JSON.stringify(tsconfigSpec, null, 2), err => {
            if (err) {
                console.error('Problem with updating file tsconfig.spec.json');
                console.log('You can do it by yourself');
                console.log('Just remove "src/test.ts" from files section');
                console.error(err);
            }
            console.log('File tsconfig.spec.json updated');
        });
    }
}

main();