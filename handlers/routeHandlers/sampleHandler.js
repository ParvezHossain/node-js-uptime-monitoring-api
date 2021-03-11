// module scaffolding

const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    callback(200, {
        message: "Success",
    });
}

module.exports = handler;