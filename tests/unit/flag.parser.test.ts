import 'mocha';
import { castValue, findFlagValue, parseFlags } from '../../src/utils/FlagParser';
import assert from 'assert';

describe('FlagParser Value Cast Test', () => {
    it('should return boolean', () => {
        const cast = castValue('true')

        assert.strictEqual(typeof cast, 'boolean')
    })

    it('should return number', () => {
        const cast = castValue('1')

        assert.strictEqual(typeof cast, 'number')
    })

    it('should return number', () => {
        const cast = castValue('7.3')

        assert.strictEqual(typeof cast, 'number')
    })

    it('should return string', () => {
        const cast = castValue('test')

        assert.strictEqual(typeof cast, 'string')
    })

    it('should return undefined', () => {
        const cast = castValue(undefined)

        assert.strictEqual(typeof cast, 'undefined')
    })
})

describe('FlagParser Parse Flag Test', () => {
    it('should return object', () => {
        process.argv = ['--test=1', '--foo', '--bar=foo', '--allow=true', '/bin/sh', '/proc/cpuinfo']

        const flags = parseFlags()
        const expected = {
            test: 1,
            foo: undefined,
            bar: 'foo',
            allow: true
        }
        assert.deepStrictEqual(flags, expected)
    })
})

describe('FlagParser Find Flag Value Test', () => {
    it('should return string', function(){
        process.argv = ['--foo=bar']

        const find = findFlagValue('foo')
        assert.strictEqual(find, 'bar')
    })

    it('should return number', function(){
        process.argv = ['shards=2']

        const find = findFlagValue('shards')
        assert.strictEqual(find, 2)
    })

    it('should return string', function(){
        process.argv = ['--foo=bar']

        const find = findFlagValue('--foo')
        assert.strictEqual(find, 'bar')
    })

    it('should return true', function(){
        process.argv = ['--foo']

        const find = findFlagValue('foo')
        assert.strictEqual(find, true)
    })

    it('should return number', function(){
        process.argv = ['--foo=1']

        const find = findFlagValue('--foo')
        assert.strictEqual(find, 1)
    })

    it('should return undefined', function(){
        process.argv = ['--foo=bar']

        const find = findFlagValue('nullptr')
        assert.strictEqual(find, undefined)
    })
})
