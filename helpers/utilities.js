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
};

// Create random string

utilities.createRandomString = (strlength) => {
    let len = strlength;
    len = typeof (strlength) === 'number' && strlength > 0 ? strlength : false;

    if (len) {
        let possibleCharacters = 'abcdefghijklmnopqrstwxyz1234567890';
        let output = '';

        for (let index = 0; index < len; index++) {
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            output += randomCharacter;
        }
        return output;
    } else {
        return false;
    }

}

module.exports = utilities;