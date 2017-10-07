const fs = require('fs')
const path = require('path')
const DataProcessingPipeline = require('./processing/DataProcessingPipeline')

const DEBUG_MODE = false
const OUTPUT_DIR = path.join(__dirname, '..', 'processed')

let fileNames = fs.readdirSync(path.join(__dirname, '..', 'datasets'))
    .filter(name => /.xml$/.test(name))


if (DEBUG_MODE) {

    let pipeline = new DataProcessingPipeline(data => {
        console.log(JSON.stringify(data, null, 4))
    })
    let randomIndex = Math.floor(Math.random() * fileNames.length)
    pipeline.receiveData(path.join(__dirname, '..', 'datasets', fileNames[randomIndex]))

} else {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR)
    }

    for (let fileName of fileNames) {
        let filePath = path.join(__dirname, '..', 'datasets', fileName)
        let pipeline = new DataProcessingPipeline(data => {
            let jsonData = JSON.stringify(data, null, 4)
            let outputName = fileName.replace(/.xml$/, '') + '.json'
            let outputPath = path.join(OUTPUT_DIR, outputName)
            fs.writeFileSync(outputPath, jsonData, 'utf8')
        })
        pipeline.receiveData(filePath)
    }
}

