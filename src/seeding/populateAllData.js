// -------------------
// IMPORT DEPENDENCIES
// -------------------
const collectProcessedData = require('./collectProcessedData')
const {
    getConferenceAlias,
    getDocumentAlias,
    getAuthorAbbr,

    performAsyncInBatches
} = require('./seedingUtils.js')
const db = require('../models/index')

// -----------------------
// DEFINE GLOBAL VARIABLES
// -----------------------
let localConferenceMap = {}
let dbConferenceMap = {}
let localDocumentMap = {}
let dbDocumentMap = {}
let localAuthorMap = {}
let dbAuthorMap = {}

let docAliasToConfAliasMap = {}
let docAliasToAuthorAbbrMap = {}

// --------------
// HELPER METHODS
// --------------
const createLocalConference = (conference, overwrite = false) => {
    let alias = getConferenceAlias(conference.name)
    if (!localConferenceMap.hasOwnProperty(alias)) {
        localConferenceMap[alias] = {
            Alias: alias,
            Name: conference.name,
            Code: conference.code
        }
    } else if (overwrite) {
        localConferenceMap[alias] = Object.assign({}, localConferenceMap[alias], {
            Name: conference.name,
            Code: conference.code
        })
    }
}

const associateDocumentWithAuthors = (document) => {
    if (document.hasOwnProperty('authors') &&
        document.authors.constructor === Array &&
        document.authors.length > 0 &&
        document.hasOwnProperty('title')) {

        let docAlias = getDocumentAlias(document.title)
        if (!docAliasToAuthorAbbrMap.hasOwnProperty(docAlias)) {
            docAliasToAuthorAbbrMap[docAlias] = new Set()
        }
        document.authors.map(a => getAuthorAbbr(a))
            .forEach(abbr => docAliasToAuthorAbbrMap[docAlias].add(abbr))
    }
}

const createLocalDocument = (document, overwrite = false) => {
    let alias = getDocumentAlias(document.title)
    if (!localDocumentMap.hasOwnProperty(alias)) {
        localDocumentMap[alias] = {
            Alias: alias,
            Title: document.title,
            Year: document.year,
            IsInDataset: overwrite
        }
    } else if (overwrite) {
        localDocumentMap[alias] = Object.assign({}, localDocumentMap[alias], {
            Title: document.title,
            Year: document.year,
            IsInDataset: true
        })
    }

    // Save mapping to conference
    if (document.conference) {
        let confAlias = null

        if (document.conference.constructor === Object &&
            document.conference.hasOwnProperty('name')) {

            confAlias = getConferenceAlias(document.conference.name)
        } else if (document.conference.constructor === String) {
            confAlias = getConferenceAlias(document.conference)
        }

        if (confAlias && (!docAliasToConfAliasMap.hasOwnProperty(alias) || overwrite)) {
            docAliasToConfAliasMap[alias] = confAlias
        }
    }

    // Associate current document with authors
    associateDocumentWithAuthors(document)

    // Create new authors
    if (document.hasOwnProperty('citations')) {
        document.citations.filter(c => c.authors).map(c => c.authors)
            .reduce((a, v) => a.concat(v), document.authors || [])
            .forEach(author => {
                let abbr = getAuthorAbbr(author)
                if (!localAuthorMap.hasOwnProperty(abbr)) {
                    localAuthorMap[abbr] = {
                        Name: author,
                        Abbreviation: abbr
                    }
                }
            })

        // Associate citations with authors
        document.citations.forEach(c => associateDocumentWithAuthors(c))
    }

}


const promiseProcessedData = () => Promise.resolve(collectProcessedData())

// -------------
// POPULATE DATA
// -------------
let processedDocuments = null
let createdDocumentObjects = []

promiseProcessedData().then(documents => {

    // Save the processed documents
    processedDocuments = documents

    // Populate all conferences
    for (let document of documents) {
        createLocalConference(document.conference, true)
        document.citations
            .filter(c => c.conference)
            .map(c => ({ name: c.conference }))
            .forEach(c => createLocalConference(c))

    }
    return Promise.resolve()
}).then(_ => {
    return db.Conference.bulkCreate(Object.values(localConferenceMap))
}).then(createdConferences => {
    for (let conferenceObject of createdConferences) {
        dbConferenceMap[conferenceObject.get({ plain: true }).Alias] = conferenceObject
    }
    // Can now free up memory from local conference map
    localConferenceMap = null
    // Resolve this promise
    return Promise.resolve()
}).then(_ => {
    // Populate all documents
    for (let document of processedDocuments) {
        createLocalDocument(document, true)
        document.citations
            .filter(c => c.title)
            .forEach(d => createLocalDocument(d))
    }
    return Promise.resolve()
}).then(_ => {
    // Add in batches
    return performAsyncInBatches(batch => new Promise((resolve, reject) => {

        db.Document.bulkCreate(batch).then(documents => {
            Array.prototype.push.apply(createdDocumentObjects, documents)
            resolve()
        }).catch(reject)

    }), Object.values(localDocumentMap), 5000)

}).then(_ => {
    for (let documentObject of createdDocumentObjects) {
        dbDocumentMap[documentObject.get({ plain: true }).Alias] = documentObject
    }
    // Can now free up memory from local document map and created documents
    localDocumentMap = null
    createdDocumentObjects = null

    // Resolve this promise
    return Promise.resolve()
}).then(_ => {
    // Connect documents to conferences
    return performAsyncInBatches(batch => Promise.all(batch.map(document => {
        let documentAlias = document.get({ plain: true }).Alias
        let conferenceAlias = docAliasToConfAliasMap[documentAlias]
        let conference = dbConferenceMap[conferenceAlias]
        if (conference) {
            return document.setConference(conference)
        } else {
            return Promise.resolve()
        }
        })), Object.values(dbDocumentMap), 2000)
}).then(_ => {
    // Can now free up memory from doc alias to conf alias map
    docAliasToConfAliasMap = null

    // Start constructing citation map
    let citations = []

    for (let document of processedDocuments) {
        let fromDoc = dbDocumentMap[getDocumentAlias(document.title)]
        if (typeof fromDoc === 'undefined') {
            continue
        }
        let fromDocId = fromDoc.get({ plain: true }).UID

        let toDocIds = document.citations
            .filter(c => c.title)
            .map(c => getDocumentAlias(c.title))
            .filter(a => dbDocumentMap.hasOwnProperty(a))
            .map(a => dbDocumentMap[a].get({ plain: true }).UID)

        Array.prototype.push.apply(citations, toDocIds.map(t => [fromDocId, t]))
    }

    // Save these to the database
    return performAsyncInBatches(batch => db.Citation.bulkCreate(batch.map(b => ({
            FromDocumentId: b[0],
            ToDocumentId: b[1]
        }))), citations, 5000)
}).then(_ => {
    // Citations completed! Now onto authors
    return performAsyncInBatches(batch => db.Author.bulkCreate(batch)
        .then(authors => {
            for (let author of authors) {
                let authorAbbr = author.get({ plain: true }).Abbreviation
                dbAuthorMap[authorAbbr] = author
            }
            return Promise.resolve()
        }), Object.values(localAuthorMap), 5000)
}).then(_ => {
    // Local author map is no longer needed
    localAuthorMap = null

    // Turn these sets into arrays
    Object.keys(docAliasToAuthorAbbrMap).filter(k => docAliasToAuthorAbbrMap.hasOwnProperty(k))
        .forEach(key => {
            docAliasToAuthorAbbrMap[key] = [...docAliasToAuthorAbbrMap[key].values()]
        })

    // Dump docAliasToAuthorAbbrMap to a file
    // fs.writeFileSync('./databm.json', JSON.stringify(docAliasToAuthorAbbrMap, null, 2), 'utf8')

    // At long last, we can create the document-author relationship
    return performAsyncInBatches(batch => {
        let promises = []
        for (let documentAlias of batch) {
            let document = dbDocumentMap[documentAlias]
            let authorAbbrs = docAliasToAuthorAbbrMap[documentAlias]
            let authors = authorAbbrs.map(a => dbAuthorMap[a])
            promises.push(document.setAuthors(authors))
        }
        return Promise.all(promises)
    }, Object.keys(docAliasToAuthorAbbrMap), 2000)

}).then(_ => {
    console.log("Done!")
}).catch(err => console.error(err))


