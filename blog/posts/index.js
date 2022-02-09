const express = require("express");
// used to generate a random id
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
// cors policy for communication between diff servers
app.use(cors());

const _PORT = 4000;

// this application uses in-memory storage to store posts, just getting the hang of microservices

const posts = {};

// route to get post
app.get("/posts", (req, res) => {
  res.send(posts);
});

// route to add a post
app.post("/posts", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;

  posts[id] = {
    id,
    title,
  };

  // emit this post as an event to the event bus
  await axios.post('http://localhost:4005/events', {
    type: 'PostCreated',
    data: {
      id,
      title
    }
  });

  res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  console.log('Received Event', req.body.type);

  res.send({});
});

app.listen(_PORT, () => {
  console.log(`Listenining on port ${_PORT}`);
});
