const fs = require('fs')
const path = require('path')
const DataProcessingPipeline = require('./processing/DataProcessingPipeline')

const DEBUG_MODE = false

let fileNames = fs.readdirSync(path.join(__dirname, '..', 'datasets'))
    .filter(name => /.xml$/.test(name))

let outputDir = path.join(__dirname, '..', 'processed')

if (DEBUG_MODE) {

    let pipeline = new DataProcessingPipeline(data => {
        console.log(JSON.stringify(data, null, 4))
    })
    let randomIndex = Math.floor(Math.random() * fileNames.length)
    pipeline.receiveData(path.join(__dirname, '..', 'datasets', fileNames[randomIndex]))

} else {
    for (let fileName of fileNames) {
        let filePath = path.join(__dirname, '..', 'datasets', fileName)
        let pipeline = new DataProcessingPipeline(data => {
            console.log(data.title)
            for (let citation of data.citations) {
                if (citation.title) {
                    console.log(citation.title)
                }
            }
            // let jsonData = JSON.stringify(data, null, 4)
            // let outputName = fileName.replace(/.xml$/, '') + '.json'
            // let outputPath = path.join(outputDir, outputName)
            // fs.writeFileSync(outputPath, jsonData, 'utf8')
        })
        pipeline.receiveData(filePath)
    }
}

