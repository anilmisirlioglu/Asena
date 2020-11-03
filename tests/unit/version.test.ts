import 'mocha';
import Version from '../../src/utils/Version';
import assert from 'assert';

describe('Version Test', () => {
    it('must be greater than or equal to the last version', () => {
        const currentVersion = new Version('1.3.4')
        const packageVersion = new Version(process.env.npm_package_version)

        assert.notStrictEqual(currentVersion.compare(packageVersion), -1)
    })
})
