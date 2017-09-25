module.exports = class Filter {
    constructor() {
        if (this.constructor === Filter) {
            throw new Error('Cannot instantiate abstract class Filter')
        }
        this._pipes = []
    }

    processData(data) {
        throw new Error('Unimplemented Error')
    }

    addPipe(pipe) {
        this._pipes.push(pipe)
    }

    removePipe(pipe) {
        for (let index = 0; index < this._pipes.length; ++index) {
            if (this._pipes[index] === pipe) {
                this._pipes.splice(index, 1)
                break
            }
        }
    }

    get pipes() { return this._pipes }
}
