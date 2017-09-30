const Filter = require('../architecture/Filter')

module.exports = class SanitizeDataFilter extends Filter {
    constructor(threshold) {
        if (typeof(threshold) === 'undefined' ||
            threshold.constructor !== Number) {

            throw new Error('threshold must be a number')
        }
        super()
        this._threshold = threshold
    }

    processData(jsonData) {
        let algorithms = jsonData.algorithms.algorithm
        let output = {
            citations: []
        }
        algorithms.forEach(algo => {
            switch (algo.name) {
                case 'ParsCit':
                Array.prototype.push.apply(output.citations, algo.citationList.citation
                    .filter(c => c.valid)
                    )
                break

                default:
                // Do nothing
                break
            }
        })
        return output
    }
}
