const fs = require('fs')
const path = require('path')
const expect = require('expect.js')
const ReadFileFilter = require('../../src/processing/ReadFileFilter')

describe('ReadFileFilter', () => {
    it('should read the file as is', done => {
        let filter = new ReadFileFilter()
        let getFileContents = (fileName) => new Promise((resolve, reject) => {
            fs.readFile(fileName, 'utf8', (err, data) => err ? reject(err) : resolve(data))
        })
        let processWithFilter = (fileName) => new Promise(resolve => resolve(filter.processData(fileName)))
        Promise.all([getFileContents(__filename), processWithFilter(__filename)]).then(([expected, actual]) => {
            done()
            expect(actual).to.be.eql(actual)
        })
    })
})
