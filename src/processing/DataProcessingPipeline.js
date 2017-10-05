const Pipeline = require('../architecture/Pipeline')

const ReadFileFilter = require('./ReadFileFilter')
const XmlParseFilter = require('./XmlParseFilter')
const ExtractDataFilter = require('./ExtractDataFilter')

module.exports = class DataProcessingPipeline extends Pipeline {
    constructor(outputCallback) {
        super([
            new ReadFileFilter(),
            new XmlParseFilter(),
            new ExtractDataFilter()
        ], outputCallback)
    }
}
