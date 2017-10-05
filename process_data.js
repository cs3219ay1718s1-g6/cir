const fs = require('fs')
const path = require('path')
const DataProcessingPipeline = require('./src/processing/DataProcessingPipeline')

let pipeline = new DataProcessingPipeline(data => console.log(JSON.stringify(data, null, 2)))

let fileNames = fs.readdirSync(path.join(__dirname, 'datasets'))
    .filter(name => /.xml$/.test(name))

let firstFile = path.join(__dirname, 'datasets', fileNames[0])
pipeline.receiveData(firstFile)
