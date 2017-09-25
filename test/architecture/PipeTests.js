const expect = require('expect.js')
const Pipe = require('../../src/architecture/Pipe')
const Filter = require('../../src/architecture/Filter')
const { IdentityFilter, AddToArrayFilter } = require('../factories/Filters')

describe('Pipe', () => {
    it('should push data to filter\'s pipes', () => {
        let pipe = new Pipe(new IdentityFilter())
        let array = []
        pipe.filter.addPipe(new Pipe(new AddToArrayFilter(array)))
        pipe.filter.addPipe(new Pipe(new AddToArrayFilter(array)))
        pipe.receiveData(1)
        expect(array.length).to.be(2)
        expect(array[0]).to.be(1)
        expect(array[1]).to.be(1)
    })
})

