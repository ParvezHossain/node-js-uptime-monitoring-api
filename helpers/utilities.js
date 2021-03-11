// dependencies
const crypto = require('crypto');
const environments = require('./environments');

const utilities = {};

// paser JSON string to Object
utilities.parseJSON = (jsonString) => {
    let output;
    try {
        output = JSON.parse(jsonString);
    } catch (error) {
        output = {};
    }
    return output;
}
// hasing the string

utilities.hash = (str) => {
    if (typeof (str) === 'string' && str.length > 0) {
        const hash = crypto
            // .createHmac('sha256', environments[process.env.NODE_ENV].secretKey)
            .createHmac('sha256', "parvez")
            .update(str)
            .digest('hex');
        return hash;
    }
}

module.exports = utilities;