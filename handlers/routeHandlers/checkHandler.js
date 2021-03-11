// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('../routeHandlers/tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {

    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    // validate input

    const protocol = typeof (requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof (requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const successCodes = typeof (requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof (requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if (protocol, url, method, successCodes, timeoutSeconds) {
        // verify token
        let token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;

        data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                let userPhone = parseJSON(tokenData).phone;
                data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenisValid) => {
                            if (tokenisValid) {
                                let userObject = parseJSON(userData);
                                let userCheck = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];
                                if (userCheck.length < maxChecks) {
                                    let checkId = createRandomString(20);
                                    let checkObject = {
                                        "id": checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    }

                                    // save the user
                                    data.create('checks', checkId, checkObject, (err) => {
                                        if (!err) {
                                            // add checkId to the user's object
                                            userObject.checks = userCheck;
                                            userObject.checks.push(checkId);

                                            // update
                                            data.update('users', userPhone, userObject, (err) => {
                                                if (!err) {
                                                    // return new data
                                                    callback(200, checkObject)
                                                } else {
                                                    callback(500, {
                                                        error: "Server error",
                                                    })
                                                }
                                            })

                                        } else {
                                            callback(500, {
                                                error: "Server error",
                                            })
                                        }
                                    })

                                } else {
                                    callback(401, {
                                        error: "max check limit error",
                                    })
                                }

                            } else {
                                callback(403, {
                                    "error": "Authentication error",
                                })
                            }
                        })
                    } else {
                        callback(400, {
                            "error": "user not found",
                        })
                    }
                })
            } else {
                callback(403, {
                    "error": "Authentication error",
                })
            }
        })
        // tokenHandler._token.verify(token, phone, (err, tokenData) => {
        //     if (tokenId) {
        //         // look up for the user
        //         data.read('users', phone, (err, usr) => {
        //             const user = { ...parseJSON(usr) };
        //             if (!err && user) {
        //                 delete user.password;
        //                 callback(200, user)
        //             } else {
        //                 callback(404, {
        //                     "error": "user not found",
        //                 })
        //             }
        //         })
        //     } else {
        //         callback(403, {
        //             error: "Authentication fail",
        //         })
        //     }
        // })

    } else {
        callback(400, {
            error: "Error detected",
        });
    }


}

handler._check.get = (requestProperties, callback) => { }
handler._check.put = (requestProperties, callback) => { }
handler._check.delete = (requestProperties, callback) => { }

module.exports = handler;