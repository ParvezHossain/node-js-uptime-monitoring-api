// Dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const data = require('./lib/data')

// App object scaffolding
const app = {};

/* data.create('test', 'newfile', { 'name': 'Parvez', 'age': 26 }, (err) => {
    console.log(err);
}); */

/* data.read('test', 'newfile', (err, data) => {
    console.log(err, data);
}); */

/* data.update('test', 'newfile', { 'name': 'Parvez', 'age': 27 }, (err) => {
    console.log(err);
}); */

// data.delete('test', 'newfile', (err) => {
//     console.log(err);
// })

// Create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log("Listening to  Port no is: ", + environment.port);
    })
};

// Handle request, response
app.handleReqRes = handleReqRes;

app.createServer();