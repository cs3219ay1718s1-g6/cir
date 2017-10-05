const Pipeline = require('../architecture/Pipeline')

const ReadFileFilter = require('./ReadFileFilter')
const XmlParseFilter = require('./XmlParseFilter')
const ExtractDataFilter = require('./ExtractDataFilter')
const SanitizeDataFilter = require('./SanitizeDataFilter')
const TransformDataFilter = require('./TransformDataFilter')

module.exports = class DataProcessingPipeline extends Pipeline {
    constructor(outputCallback) {
        super([
            new ReadFileFilter(),
            new XmlParseFilter(),
            new ExtractDataFilter(),
            new SanitizeDataFilter(0.99),
            new TransformDataFilter()
        ], outputCallback)
    }
}
