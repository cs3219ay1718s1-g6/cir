module.exports = class Pipe {
    constructor(filter) {
        this._filter = filter
    }

    receiveData(input) {
        let output = this._filter.processData(input)
        this._filter.pipes.forEach(pipe => pipe.receiveData(output))
    }

    get filter() { return this._filter }
}
