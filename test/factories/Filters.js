const Filter = require('../../src/architecture/filter')

module.exports = {
    IdentityFilter: class IdentityFilter extends Filter {
        processData(data) {
            return data;
        }
    },
    AddToArrayFilter: class AddToArrayFilter extends Filter {
        constructor(array) {
            super()
            this._array = array
        }

        processData(data) {
            this._array.push(data)
        }
    },
    PlusOneFilter: class PlusOneFilter extends Filter {
        processData(data) {
            return data + 1
        }
    }
}
