const collectProcessedData = require('./collectProcessedData')

const getConferenceAlias = (conference) => conference
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]+/g, '')
    .replace(/\s+/g, ' ')

const conferences = collectProcessedData()
    .map(jsonData => {
        let conf = []
        conf.push({
            Name: jsonData.conference.name,
            Code: jsonData.conference.code
        })
        Array.prototype.push.apply(conf, jsonData.citations.filter(c => c.conference).map(c => ({
            Name: c.conference
        })))
        return conf
    })
    .reduce((a, v) => a.concat(v))
    .map(c => Object.assign({}, c, {
        Alias: getConferenceAlias(c.Name)
    }))
    .sort((a, b) => a.Alias.localeCompare(b.Alias))
    .reduce((a, v) => {
        if (a.length === 0 || a[a.length - 1].Alias !== v.Alias) {
            a.push(v)
        }
        return a
    }, [])

// Preparing for database connection
const db = require('../models/index')

for (let conference of conferences) {
    db.Conference.create(conference).then(response => console.log(response))
}

module.exports = {
    getConferenceAlias
}