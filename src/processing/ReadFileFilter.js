const Filter = require('../architecture/Filter')
const fs = require('fs')

module.exports = class ReadFileFilter extends Filter {
    processData(filePath) {
        return fs.readFileSync(filePath, 'utf8')
    }
}
