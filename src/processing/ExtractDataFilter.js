const Filter = require('../architecture/Filter')

module.exports = class ExtractDataFilter extends Filter {
    processData(jsonData) {
        // Prepare the output data
        let output = {
            titles: [],
            authors: [],
            citations: []
        }

        for (let algo of jsonData.algorithms.algorithm) {
            switch (algo.name) {
                case 'ParsCit':
                    Array.prototype.push.apply(output.citations, algo.citationList.citation)
                    break
                case 'SectLabel':
                case 'ParsHed':
                    let data = algo.variant
                    // Add titles
                    if (data.title.constructor === Array) {
                        Array.prototype.push.apply(output.titles, data.title)
                    } else if (data.title.constructor === Object) {
                        output.titles.push(data.title)
                    }
                    // Add authors
                    if (data.author.constructor === Array) {
                        Array.prototype.push.apply(output.authors, data.author)
                    } else if (data.author.constructor === Object) {
                        output.authors.push(data.author)
                    }
                    break

                default:
                    // Do nothing
                    break
            }
        }

        return output
    }
}
