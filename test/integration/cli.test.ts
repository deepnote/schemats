import { spawnSync } from 'child_process'
import * as assert from 'power-assert'
import { fileSync as tempFile } from 'tmp'

describe('schemats cli tool integration testing', () => {
    describe('schemats generate postgres', () => {
        before(async function () {
            if (!process.env.POSTGRES_URL) {
                return this.skip()
            }
        })
        it('should run without error', () => {
            let {status, stdout, stderr} = spawnSync('node', [
                'dist/bin/schemats', 'generate',
                '-c', process.env.POSTGRES_URL as string,
                '-o', tempFile().name
            ], { encoding: 'utf-8' })
            console.log('opopopopop', stdout, stderr)
            assert.equal(status, 0)
        })
    })
    describe('schemats generate mysql', () => {
        before(async function () {
            if (!process.env.MYSQL_URL) {
                return this.skip()
            }
        })
        it('should run without error', () => {
            let {status} = spawnSync('node', [
                'dist/bin/schemats', 'generate',
                '-c', process.env.MYSQL_URL as string,
                '-s', 'test',
                '-o', tempFile().name
            ])
            assert.equal(status, 0)
        })
    })
})
