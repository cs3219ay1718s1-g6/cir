// const express = require('express')
const fs = require('fs')
const path = require('path')
const Pipeline = require('./src/architecture/Pipeline')

const ReadFileFilter = require('./src/processing/ReadFileFilter')
const XmlParseFilter = require('./src/processing/XmlParseFilter')
const SanitizeDataFilter = require('./src/processing/SanitizeDataFilter')

const dataFiles = fs.readdirSync(path.join(__dirname, 'datasets'))
    .filter(file => /\.xml$/.test(file))

const firstFile = path.join(__dirname, 'datasets', dataFiles[0])
const pipeline = new Pipeline([
    new ReadFileFilter(),
    new XmlParseFilter(),
    new SanitizeDataFilter(0.85)
    ], data => console.log(JSON.stringify(data, null, 2)))
pipeline.receiveData(firstFile)

