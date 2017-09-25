const Pipeline = require('../../src/architecture/Pipeline')
const { IdentityFilter, PlusOneFilter } = require('../factories/Filters')
const expect = require('expect.js')

describe('Pipeline', () => {
    it('should accept one filter', () => {
        let instantiator = () => new Pipeline([new IdentityFilter()], () => {})
        expect(instantiator).to.not.throwError()
    })

    it('should not accept no filter at all', () => {
        let instantiator = () => new Pipeline([], () => {})
        expect(instantiator).to.throwError()
    })

    it('should accept more than one filter', () => {
        let instantiator = () => new Pipeline([
            new IdentityFilter(),
            new PlusOneFilter()
            ], () => {})
        expect(instantiator).to.not.throwError()
    })

    it('should invoke the callback with the final result', done => {
        let pipeline = new Pipeline([
            new IdentityFilter(),
            new PlusOneFilter(),
            new PlusOneFilter()
            ], output => {
                expect(output).to.be(2)
                done()
            })

        pipeline.receiveData(0)
    })
})

// class IdentityFilter extends filter
