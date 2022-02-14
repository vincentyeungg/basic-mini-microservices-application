// implementation of a simple event bus

const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express();

const _PORT = 4005;

app.use(bodyParser.json());

// this mimics a event bus data store
const events = [];

// event bus will have a post method route, and it will send these events out to all services when receiving an incoming service
app.post('/events', (req, res) => {
    const event = req.body;

    // push all events into our data store (most recent events will be at the end)
    events.push(event);

    // send incoming event to all services
    axios.post('http://posts-clusterip-srv:4000/events', event).catch((err) => {
        console.log(err.message);
    });
    
    axios.post('http://comments-srv:4001/events', event).catch((err) => {
        console.log(err.message);
    });

    axios.post('http://query-srv:4002/events', event).catch((err) => {
        console.log(err.message);
    });

    axios.post('http://moderation-srv:4003/events', event).catch((err) => {
        console.log(err.message);
    });

    res.send({ status: 'OK' })
});

// get all events and send it to requesting service
app.get('/events', (req, res) => {
    res.send(events);
});

app.listen(_PORT, () => {
    console.log(`Listening on port ${_PORT}.`);
});