const fs = require('fs')
const parser = require('xml2json')
const path = require('path')
const Filter = require('../architecture/Filter')

module.exports = class ParseFileFilter extends Filter {
    processData(filePath) {
        let fileData = fs.readFileSync(filePath, 'utf8')
        let parsedData = parser.toJson(fileData, { object: true, coerce: true })
        parsedData.fileName = path.basename(filePath, '.xml')
        return parsedData
    }
}
