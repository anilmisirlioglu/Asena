import 'mocha';
import request from '../src/utils/Internet';
import { TOP_GG_URL, DISCORD_BOTS_GG_URL } from '../src/Constants';
import assert from 'assert';

require('dotenv').config()

const testServerCount = 296
const testBotId = "716259870910840832"

describe('Top GG Bot Stats Update Test', () => {
    it('should update bot stats', () => {
        request({
            host: TOP_GG_URL,
            path: `/api/bots/${testBotId}/stats`,
            method: 'POST',
            headers: {
                Authorization: process.env.TOP_GG_API_KEY
            }
        }, {
            server_count: testServerCount
        })
    })
})

describe('Discord Bots GG Bot Stats Update Test', () => {
    it('should update bot stats', () => {
        request({
            host: DISCORD_BOTS_GG_URL,
            path: `/api/v1/bots/${testBotId}/stats`,
            method: 'POST',
            headers: {
                Authorization: process.env.DISCORD_BOTS_GG_API_KEY
            }
        }, {
            server_count: testServerCount
        }, (res) => {
            res.setEncoding('utf8')
            res.on('data', (chunk) => {
                assert.ok(chunk)
            })
        })
    })
})
