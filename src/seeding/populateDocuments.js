const collectProcessedData = require('./collectProcessedData')
const { getConferenceAlias } = require('./populateConferences')

let documents = {}
let authors = {}

const getAlias = (string) => string
    .toLowerCase()
    .replace(/[^a-z\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const processedData = collectProcessedData()

const getAuthorAlias = (authorName) => authorName
    .replace(/[^\w\s-]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .map((component, index, array) => {
        if (index === array.length - 1) {
            return component
        }
        return component.charAt(0)
    }).join(' ')

for (let document of processedData) {
    // Populate documents
    let documentAlias = getAlias(document.title)
    if (!documents.hasOwnProperty(documentAlias)) {
        documents[documentAlias] = {
            title: document.title,
            alias: documentAlias,
            year: document.conference.year,
            isInDataset: true,
            authorAliases: new Set(),
            conferenceAlias: getConferenceAlias(document.conference.name)
        }
    } else {
        documents[documentAlias].title = document.title
        documents[documentAlias].year = document.conference.year
        documents[documentAlias].isInDataset = true
        documents[documentAlias].conferenceAlias = getConferenceAlias(document.conference.name)
    }

    // Populate authors
    for (let author of document.authors) {
        let authorAlias = getAuthorAlias(author)
        if (!authors.hasOwnProperty(authorAlias)) {
            authors[authorAlias] = {
                name: author,
                abbreviation: authorAlias
            }
        }
        documents[documentAlias].authorAliases.add(authorAlias)
    }

    for (let citation of document.citations) {
        if (citation.title) {
            let citationDocAlias = getAlias(citation.title)
            if (!documents.hasOwnProperty(citationDocAlias)) {
                documents[citationDocAlias] = {
                    title: citation.title,
                    alias: citationDocAlias,
                    isInDataset: false,
                    authorAliases: new Set(),
                }
                if (citation.date) {
                    documents[citationDocAlias].year = citation.date
                }
                if (citation.conference) {
                    documents[citationDocAlias].conferenceAlias = getConferenceAlias(citation.conference)
                }
            }

            if (citation.authors) {
                for (let author of citation.authors) {
                    let authorAlias = getAuthorAlias(author)
                    if (!authors.hasOwnProperty(authorAlias)) {
                        authors[authorAlias] = {
                            name: author,
                            abbreviation: authorAlias
                        }
                    }

                    documents[citationDocAlias].authorAliases.add(authorAlias)
                }
            }
        }
    }
}

// Define database constants
const db = require('../models/index')
const Op = db.Sequelize.Op

const performInBatches = (action, array, batchSize) => {
    let currentIndex = 0
    while (currentIndex < array.length) {
        let endIndex = Math.min(currentIndex + batchSize, array.length)
        action(array.slice(currentIndex, endIndex))
        currentIndex += batchSize
    }
}

const performAsyncInBatches = (promiseGenerator, array, batchSize) => {
    let currentIndex = 0
    let promise = Promise.resolve()
    while (currentIndex < array.length) {
        let beginIndex = currentIndex
        let endIndex = Math.min(currentIndex + batchSize, array.length)
        promise = promise.then(_ => {
            return promiseGenerator(array.slice(beginIndex, endIndex))
        })
        currentIndex += batchSize
    }
    return promise
}

const DEFAULT_BATCH_SIZE = 5000

// Creating documents
// performInBatches(batch => {
//     db.Document.bulkCreate(batch.map(d => ({
//         Title: d.title,
//         Year: d.year,
//         IsInDataset: d.isInDataset,
//         Alias: d.alias
//     }))).then(_ => console.log(`Created ${batch.length} documents`))
// }, Object.values(documents), DEFAULT_BATCH_SIZE)

// Creating authors
// performInBatches(batch => {
//     db.Author.bulkCreate(batch.map(a => ({
//         Name: a.name,
//         Abbreviation: a.abbreviation
    // }))).then(_ => console.log(`Created ${batch.length} authors`))
// }, Object.values(authors), DEFAULT_BATCH_SIZE)

// Creating citations
// for (let document of processedData) {
//     let fromAlias = getAlias(document.title)
//     for (let citation of document.citations) {
//         if (citation.title) {
//             let toAlias = getAlias(citation.title)

//             // Query both and get their UIDs
//             db.Document.findAll({ where: { Alias: { [Op.in]: [fromAlias, toAlias] }}})
//                 .then(result => {
//                     let doc1 = result[0].get({ plain: true })
//                     let doc2 = result[1].get({ plain: true })
//                     if (doc1.Alias === toAlias) {
//                         let temp = doc1
//                         doc1 = doc2
//                         doc2 = temp
//                     }
//                     db.Citation.create({
//                         FromDocumentId: doc1.UID,
//                         ToDocumentId: doc2.UID
//                     }).then(_ => console.log(`Cited ${doc2.UID} in ${doc1.UID}`))
//                 })
//         }
//     }
// }

// performAsyncInBatches(batch => Promise.all(batch.map(document => {
//     let authorAliases = [...document.authorAliases.values()]

//     return Promise.all([
//         db.Document.findOne({where:{Alias:{[Op.eq]: document.alias}}}),
//         db.Author.findAll({where:{Abbreviation:{[Op.in]: authorAliases}}}),
//         ]).then(results => {
//             let [document, authors] = results
//             if (!document || !authors) {
//                 return Promise.resolve()
//             }
//             return document.setAuthors(authors)
//         })
// })), Object.values(documents), 500)

// Connect document to conferences
Promise.all([
    db.Document.findAll(),
    db.Conference.findAll({ attributes: ['UID', 'Alias' ]})
]).then(results => {
    let [ds, cs] = results
    let conferences = {}
    cs.forEach(c => conferences[c.get({ plain: true }).Alias] = c)

    for (let document of ds) {
        let attribs = document.get({ plain: true })
        if (documents[attribs.Alias].hasOwnProperty('conferenceAlias') &&
            conferences.hasOwnProperty(documents[attribs.Alias].conferenceAlias)) {

            document.setConference(conferences[documents[attribs.Alias].conferenceAlias])
        }
    }
})

