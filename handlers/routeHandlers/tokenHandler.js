// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { createRandomString } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {

    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const phone = typeof (requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone && password) {
        data.read('users', phone, (err, userData) => {
            let usrData = parseJSON(userData);
            if (usrData) {
                let hashedPassword = hash(password);

                if (hashedPassword === usrData.password) {
                    let tokenId = createRandomString(20);
                    let expires = Date.now() + 60 * 60 * 1000;
                    let tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    data.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {
                                error: "Server error",
                            })
                        }
                    })
                } else (
                    callback(400, {
                        error: "Invalid Credential",
                    })
                );
            } else {
                callback(404, {
                    error: "no user found",
                })
            }

        })
    } else {
        callback(400, {
            error: "Error",
        })
    }
};
handler._token.get = (requestProperties, callback) => {
    const id = typeof
        requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id
        : false;

    if (id) {
        // look up for the user
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(200, token)
            } else {
                callback(404, {
                    "error": "token not found",
                })
            }
        })
    } else {
        callback(404, {
            "error": "requested token not found",
        })
    }
};
handler._token.put = (requestProperties, callback) => {
    const id = typeof (requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    const extend = typeof requestProperties.body.extend === "boolean" && requestProperties.body.extend === true ? true : false;

    if (id && extend) {
        data.read('tokens', id, (err, tokenData) => {
            let tokenObject = parseJSON(tokenData);
            if (tokenObject) {
                if (tokenObject.expires > Date.now()) {
                    tokenObject.expires = Date.now() + 60 * 60 * 1000;
                    data.update('tokens', id, tokenObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {
                                error: "Error",
                            })
                        }
                    })
                } else {
                    callback(400, {
                        error: "Token already expired.",
                    })
                }
            } else {
                callback(400, {
                    error: "Error occured",
                })
            }
        })
    } else {
        callback(400, {
            error: "Error..",
        })
    }
};
handler._token.delete = (requestProperties, callback) => {
    const id = typeof (requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    if (id) {
        data.read('tokens', id, (err, uData) => {
            if (!err && uData) {
                data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200, {
                            message: "token deleted",
                        })
                    } else {
                        callback(500, {
                            error: "Error 500",
                        })
                    }
                })
            } else {
                callback(500, {
                    error: "Error while deleting"
                })
            }
        })
    } else {
        callback(400, {
            error: "Error",
        })
    }
};


handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true) 
            } else {
                callback(false);
            }
        } else {
            callback(false)
        }
    })
}

module.exports = handler;