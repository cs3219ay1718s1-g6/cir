const Filter = require('../architecture/Filter')
const parser = require('xml2json')

module.exports = class XmlParseFilter extends Filter {
    processData(data) {
        return parser.toJson(data, { object: true, coerce: true })
    }
}
