const Filter = require('../../src/architecture/Filter')
const Pipe = require('../../src/architecture/Pipe')
const expect = require('expect.js')
const { IdentityFilter, PlusOneFilter } = require('../factories/Filters')


describe('Filter', () => {
    it('should be abstract', () => {
        let instantiator = () => new Filter()
        expect(instantiator).to.throwError()
    })

    it('should be able to add pipes', () => {
        let filter = new IdentityFilter()
        let pipe = new Pipe(new IdentityFilter())
        expect(filter.pipes).to.be.an('array')
        expect(filter.pipes.length).to.be(0)
        filter.addPipe(pipe)
        expect(filter.pipes.length).to.be(1)
    })

    it('should be able to remove pipes', () => {
        let filter = new IdentityFilter()
        let pipe1 = new Pipe(new IdentityFilter())
        let pipe2 = new Pipe(new PlusOneFilter())
        filter.addPipe(pipe1)
        filter.addPipe(pipe2)
        expect(filter.pipes.length).to.be(2)
        filter.removePipe(pipe2)
        expect(filter.pipes.length).to.be(1)
        expect(filter.pipes[0].filter).to.be.an(IdentityFilter)

    })
})

