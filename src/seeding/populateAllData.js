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

let docAliasToConfAliasMap = {}

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

}).catch(err => console.error(err))


