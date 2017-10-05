const Filter = require('../architecture/Filter')

module.exports = class ExtractDataFilter extends Filter {
    processData(jsonData) {
        // Prepare the output data
        let output = {
            titles: [],
            authors: [],
            affiliations: [],
            addresses: [],
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
                    appendData(output.titles, data.title)
                    // Add authors
                    appendData(output.authors, data.author)
                    // Add affiliations
                    appendData(output.affiliations, data.affiliation)
                    // Add addresses
                    appendData(output.addresses, data.address)
                    break

                default:
                    // Do nothing
                    break
            }
        }

        return output
    }
}

//-----------------------------------------------
// Helper Methods
//-----------------------------------------------
const appendData = (array, data) => {
    if (data.constructor === Array) {
        Array.prototype.push.apply(array, data)
    } else if (data.constructor === Object) {
        array.push(data)
    }
}
