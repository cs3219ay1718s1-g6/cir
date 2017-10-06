const fs = require('fs')
const path = require('path')

const PROCESSED_DATA_PATH = path.join(__dirname, '..', '..', 'processed')

const processedFiles = fs.readdirSync(PROCESSED_DATA_PATH)
    .filter(name => /.json$/.test(name))

module.exports = () => processedFiles.map(file => path.join(PROCESSED_DATA_PATH, file))
    .map(filePath => fs.readFileSync(filePath, 'utf8'))
    .map(data => JSON.parse(data))
