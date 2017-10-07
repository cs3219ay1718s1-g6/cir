module.exports = {
    getConferenceAlias: (conference) => conference
        .trim()
        .toLowerCase()
        .replace(/[^a-z\s]+/g, '')
        .replace(/\s+/g, ' ')
        .substr(0, 255),

    getDocumentAlias: (documentTitle) => documentTitle
        .toLowerCase()
        .replace(/[^a-z\s]+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substr(0, 255),

    getAuthorAbbr: (authorName) => authorName
        .replace(/[^\w\s-]+/g, ' ')
        .toLowerCase()
        .split(/\s+/)
        .map((component, index, array) => {
            if (index === array.length - 1) {
                return component
            }
            return component.charAt(0)
        })
        .join(' ')
        .reverse()
        .substr(0, 255)
        .reverse(),

    performAsyncInBatches: (promiseGenerator, array, batchSize) => {
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
}
