const Filter = require('../architecture/Filter')

module.exports = class ExtractDataFilter extends Filter {
    processData(jsonData) {
        // Extract conference information
        let conferenceId = jsonData.fileName.substring(0, jsonData.fileName.indexOf('-'))
        let conferenceCode = conferenceId.replace(/[^A-Z]+/g, '')
        let conferenceYear = 2000 + parseInt(conferenceId.replace(/[^0-9]+/g, ''))

        // Prepare the output data
        let output = {
            conference: {
                id: conferenceId,
                code: conferenceCode,
                year: conferenceYear,
                name: ""
            },
            titles: [],
            notes: [],
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
                    appendData(output.titles, data.title)
                    // Add authors
                    appendData(output.notes, data.note)
                    // Add affiliations
                    appendData(output.authors, data.authors)
                    break

                default:
                    // Do nothing
                    break
            }
        }

        if (output.notes.length > 0 &&
            output.notes[0].constructor === Object &&
            output.notes[0].hasOwnProperty('$t')) {

            output.conference.name = output.notes[0].$t.trim().replace(/\s+[1-9]\d{0,3}$/, '')
        }

        return output
    }
}

//-----------------------------------------------
// Helper Methods
//-----------------------------------------------
const appendData = (array, data) => {
    if (typeof(data) === 'undefined') {
        return
    } else if (data.constructor === Array) {
        Array.prototype.push.apply(array, data)
    } else if (data.constructor === Object) {
        array.push(data)
    }
}
