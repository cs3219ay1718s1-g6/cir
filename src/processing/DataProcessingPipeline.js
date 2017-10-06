const Pipeline = require('../architecture/Pipeline')

const ParseFileFilter = require('./ParseFileFilter')
const ExtractDataFilter = require('./ExtractDataFilter')
const SanitizeDataFilter = require('./SanitizeDataFilter')
const TransformDataFilter = require('./TransformDataFilter')

module.exports = class DataProcessingPipeline extends Pipeline {
    constructor(outputCallback) {
        super([
            new ParseFileFilter(),
            new ExtractDataFilter(),
            new SanitizeDataFilter(0.9),
            new TransformDataFilter()
        ], outputCallback)
    }
}
