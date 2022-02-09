// implementation of a simple event bus

const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express();

const _PORT = 4005;

app.use(bodyParser.json());

// event bus will have a post method route, and it will send these events out to all services when receiving an incoming service
app.post('/events', (req, res) => {
    const event = req.body;

    // send incoming event to all services
    axios.post('http://localhost:4000/events', event);
    axios.post('http://localhost:4001/events', event);
    axios.post('http://localhost:4002/events', event);
    axios.post('http://localhost:4003/events', event);

    res.send({ status: 'OK' })
});

app.listen(_PORT, () => {
    console.log(`Listening on port ${_PORT}.`);
});