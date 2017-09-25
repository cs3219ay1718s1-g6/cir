// const express = require('express')
const parser = require('xml2json')
const fs = require('fs')
const path = require('path')

const dataFiles = fs.readdirSync(path.join(__dirname, 'datasets'))
    .filter(file => /\.xml$/.test(file))

const firstFileData = fs.readFileSync(path.join(__dirname, 'datasets', dataFiles[0]), 'utf8')

const data = parser.toJson(firstFileData, { object: true, coerce: true })
console.log(JSON.stringify(data, null, 2))

