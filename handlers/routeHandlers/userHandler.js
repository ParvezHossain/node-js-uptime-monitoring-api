// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {

    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
}; 

handler._users = {};

handler._users.post = (requestProperties, callback) => {

    const firstName = typeof (requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof (requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof (requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    const tosAgreement = typeof (requestProperties.body.tosAgreement) === 'boolean' ? requestProperties.body.tosAgreement : false;

    if (firstName && lastName && phone && password && tosAgreement) {

        // make sure user does not exist
        data.read('users', phone, (err, user) => {
            if (err) {
                // then insert user
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                // Store data to db
                data.create('users', phone, userObject, (err) => {
                    if (!err) {

                    } else {
                        callback(500, {
                            "error: ": "Could create user",
                        })
                    }
                })
            } else {
                callback(500, {
                    "error": "Server error",
                })
            }
        })
    } else {
        callback(400, {
            err: "Value is not correct",
        })
    }

}
handler._users.get = (requestProperties, callback) => {

    const phone = typeof
        requestProperties.queryStringObject.phone === 'string' &&
        requestProperties.queryStringObject.phone.trim().length === 11
        ? requestProperties.queryStringObject.phone
        : false;

    if (phone) {
        // look up for the user
        data.read('users', phone, (err, usr) => {

            const user = { ...parseJSON(usr) };



            if (!err && user) {
                delete user.password;
                callback(200, user)
            } else {
                callback(404, {
                    "error": "user not found",
                })
            }
        })
    } else {
        callback(404, {
            "error": "user not found",
        })
    }
}
handler._users.put = (requestProperties, callback) => {
    const firstName = typeof (requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof (requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof (requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone) {
        if (firstName || lastName || password) {
            // look up user
            data.read('users', phone, (err, uData) => {

                userData = { ...parseJSON(uData) };

                if (!err && userData) {
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.password = hash(password);
                    }
                    // update to database
                    data.update('users', phone, userData, (err) => {
                        if (!err) {
                            callback(200, {
                                message: "userdata updated."
                            })
                        } else {
                            callback(500, {
                                err: "Server error",
                            })
                        }
                    })
                } else {
                    callback(400, {
                        error: "erro",
                    })
                }
            })
        } else {
            callback(400, {
                error: "erro",
            })
        }
    } else {
        callback(400, {
            error: "invalid phone number",
        })
    }
}
handler._users.delete = (requestProperties, callback) => {

    const phone = typeof (requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    if (phone) {
        data.read('users', phone, (err, uData) => {
            if (!err && uData) {
                data.delete('users', phone, (err) => {
                    if (!err) {
                        callback(200, {
                            "message": "user deleted",
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
}

module.exports = handler;