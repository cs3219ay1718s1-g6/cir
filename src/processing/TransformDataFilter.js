const Filter = require('../architecture/Filter')

module.exports = class TransformDataFilter extends Filter {
    processData(consolidatedData) {
        let output = {}
        for (let key of Object.keys(consolidatedData).filter(k => consolidatedData.hasOwnProperty(k))) {
            switch (key) {
                case 'titles':
                if (consolidatedData[key].length === 0) {
                    output.title = ""
                } else {
                    output.title = consolidatedData[key]
                        // .sort((a, b) => a.confidence - b.confidence)[0]
                        [0]
                        .$t.replace(/\s+/g, ' ')
                }
                break

                case 'authors':
                output[key] = extractUniqueValues(
                    consolidatedData[key].map(value => value.$t)
                    )
                break

                case 'citations':
                output.citations = consolidatedData[key]
                    .map(value => copyObjectExcludingKeys(value, ['valid']))
                    .map(value => {
                        let emptyKeys = Object.keys(value)
                            .filter(k => value.hasOwnProperty(k) && typeof value[k] !== 'undefined')
                            .filter(k => value[k].constructor === Object)
                            .filter(k => Object.keys(value[k]).length === 0)
                        return copyObjectExcludingKeys(value, emptyKeys)
                    })
                break

                case 'conference':
                // Copy as is
                output[key] = consolidatedData[key]
                break

                default:
                // Do nothing
                break
            }
        }
        return output
    }
}

const copyObjectExcludingKeys = (object, excludedKeys) => {
    let output = {}
    let excludedKeysSet = new Set(excludedKeys)
    Object.keys(object).filter(k => object.hasOwnProperty(k))
        .filter(k => !excludedKeysSet.has(k))
        .forEach(k => output[k] = object[k])
    return output
}

const extractUniqueValues = (array) => [...new Set(array).values()]
