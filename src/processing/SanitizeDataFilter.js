const Filter = require('../architecture/Filter')

const FALSE_CITATION_AUTHORS = new Set([
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ])

module.exports = class SanitizeDataFilter extends Filter {
    constructor(threshold) {
        if (typeof(threshold) === 'undefined' ||
            threshold.constructor !== Number) {

            throw new Error('threshold must be a number')
        }
        super()
        this._threshold = threshold
    }

    processData(consolidatedData) {
        let output = {}
        Object.keys(consolidatedData).filter(k => consolidatedData.hasOwnProperty(k))
            .forEach(k => {
                // Sanitize the data here
                let sanitizedData = consolidatedData[k].filter(data => {
                    if (data.hasOwnProperty('confidence') && data.confidence < this._threshold) {
                        return false
                    }
                    if (data.hasOwnProperty('valid') && !data.valid) {
                        return false
                    }
                    if (k === 'citations' &&
                        data.hasOwnProperty('authors') &&
                        FALSE_CITATION_AUTHORS.has(data.authors.author)) {

                        return false
                    }
                    return true
                })

                // Take care of missing data
                if (sanitizedData.length === 0 && consolidatedData[k].length > 0 &&
                    consolidatedData[k][0].hasOwnProperty('confidence')) {

                    sanitizedData = consolidatedData[k].sort((a, b) => a.confidence - b.confidence).slice(0, 1)
                }

                output[k] = sanitizedData
            })



        return output
    }
}
