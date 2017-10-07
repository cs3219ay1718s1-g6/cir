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
                name: getConferenceName(conferenceCode)
            },
            titles: [],
            notes: [],
            authors: [],
            citations: []
        }

        for (let algo of jsonData.algorithms.algorithm) {
            switch (algo.name) {
                case 'ParsCit':
                    Array.prototype.push.apply(
                        output.citations,
                        extractCitations(algo.citationList.citation || [])
                        )
                    break
                case 'SectLabel':
                case 'ParsHed':
                    let data = algo.variant
                    // Add titles
                    appendData(output.titles, data.title)
                    // Add authors
                    appendData(output.notes, data.note)
                    // Add affiliations
                    appendData(output.authors, data.author)
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
    if (typeof(data) === 'undefined') {
        return
    } else if (data.constructor === Array) {
        Array.prototype.push.apply(array, data)
    } else if (data.constructor === Object) {
        array.push(data)
    }
    return array
}

const extractCitations = (citations) => citations.constructor === Array ? citations.map(citation => {
    let output = {
        confidence: citation.confidence,
        original: citation.rawString
    }
    if (citation.hasOwnProperty('authors')) {
        // Add authors
        output.authors = (a => a.constructor === Array ? a : [a])(citation.authors.author)
    }
    if (citation.hasOwnProperty('booktitle')) {
        output.conference = convertBookTitleToConference(citation.booktitle)
        // output.booktitle = citation.booktitle
    }
    for (let retainedKey of ['date', 'title']) {
        if (citation.hasOwnProperty(retainedKey)) {
            output[retainedKey] = citation[retainedKey]
        }
    }

    return output
}) : extractCitations([citations])

const getConferenceName = (conferenceCode) => {
    return {
        D: "EMNLP-CoNLL",
        J: "CLV40",
        Q: "TACL",
        W: "EACL"
    }[conferenceCode] || ""
}

const CONFERENCE_LOOKUP_TABLE = Object.freeze({
    EMNLP: [
        /Empirical Methods in Natural Language Processing/i,
        /\bEMNLP\b/
    ],
    CoNLL: [
        /((Computational|Conference on) Natural Language Learning)/i,
        /\bCoNLL\b/
    ],
    NAACL: [
        /\bNAACL\b/,
        /\bNorth American\b\w+?Association for Computational Linguistics\b/i
    ],
    HLT: [/\bHLT\b/],
    ICJAI: [
        /\bInternational Joint Conference on Artificial Intelligence\b/i,
        /\bICJAI\b/
    ],
    IJCNLP: [
        /\bInternational Joint Conference on Natural Language Processing\b/i,
        /\bIJCNLP\b/
    ]
})

const convertBookTitleToConference = (bookTitle) => {
    let title = bookTitle.trim()
    let abbrMatch = title.match(/\([a-zA-Z]+[0-9\-]+(\)|\)?$)/g)
    if (abbrMatch) {
        return abbrMatch.map(m => m.substring(1, m.length - 1)).join('-')
    }

    let ofTheLastIndex = title.lastIndexOf('of the ')
    if (ofTheLastIndex != -1) {
        title = title.substring(ofTheLastIndex + 'of the '.length)
    }
    // Remove preceding in
    title = title.replace(/^In\s+/i, '')
    // Remove preceding proceedings of
    title = title.replace(/^(proceedings|proc\.)(\s+of)?\s*/i, '')

    // Remove ordinal
    title = title.replace(/^[0-9]+[a-z]{2}\s+?/i,'')
    title = title.replace(/^.*?(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|\w+?teenth)\s+/i, '')
    // Remove preceding digits
    title = title.replace(/^[0-9]+\s+/, '')

    // Remove trailing commas and periods
    title = title.replace(/\s*[,\.]+\s*$/, '')

    // Remove trailing colon description
    title = title.replace(/:.+$/, '')

    // Check for trailing abbreviation
    let trailingAbbrMatch = title.match(/(\w+)\s*\'\d{2,4}$/i)
    if (trailingAbbrMatch) {
        return trailingAbbrMatch[1]
    }

    // Remove trailing digits
    title = title.replace(/[^\w]*[0-9]{1,4}$/, '')

    // Remove excess tabs
    title = title.split('\t')[0]

    // Search in a lookup table of sort
    let conferences = []
    for (let conf in CONFERENCE_LOOKUP_TABLE) {
        let foundConf = false
        for (let regExp of CONFERENCE_LOOKUP_TABLE[conf]) {
            if (regExp.test(title)) {
                foundConf = true
                break
            }
        }
        if (foundConf) {
            conferences.push(conf)
        }
    }

    if (conferences.length > 0) {
        return conferences.sort().join('-')
    }

    if (/(Association for Computational Linguistics|ACL\b)/i.test(title)) {
        return "ACL"
    }

    return title
}
