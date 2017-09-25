const Pipe = require('./Pipe')
const Filter = require('./Filter')

module.exports = class Pipeline extends Pipe {
    constructor(filters, outputCallback) {
        if (filters.length === 0) {
            throw new Error('There must be at least one filter')
        }
        super(filters[0])
        // Build pipeline
        let currentFilter = this.filter
        for (let filterIndex = 1; filterIndex < filters.length; ++filterIndex) {
            let filter = filters[filterIndex]
            currentFilter.addPipe(new Pipe(filter))
            currentFilter = filter
        }
        // Add output to sink
        currentFilter.addPipe(new Pipe(new SinkFilter(outputCallback)))
    }
}

class SinkFilter extends Filter {
    constructor(outputCallback) {
        if (typeof(outputCallback) !== 'function') {
            throw new Error('outputCallback must be a function')
        }
        super()
        this._outputCallback = outputCallback
    }

    processData(data) {
        this._outputCallback(data)
    }
}
