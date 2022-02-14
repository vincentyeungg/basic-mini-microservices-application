const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require('axios');
const { openStdin } = require("process");

const app = express();
app.use(bodyParser.json());
// cors policy for communication between diff servers
app.use(cors());

const _PORT = 4001;

// stored in memory for now, just for testing
const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  // if the post doesn't have any comments, initialize to an empty array
  const comments = commentsByPostId[req.params.id] || [];

  // by default the status of each comment will be pending at the start
  comments.push({ id: commentId, content, status: 'pending' });

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending'
    }
  })

  commentsByPostId[req.params.id] = comments;

  res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
  console.log('Received Event', req.body.type);

  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    // find the appropriate comment in our posts data structure and update the post with the comment
    const { postId, id, status } = data;
    const comments = commentsByPostId[postId];

    const comment = comments.find(comment => {
      return comment.id === id;
    });

    comment.status = status;

    // once updated, emit this event back to the event bus with the updated content
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        status,
        postId,
        comments
      }
    });
  }

  res.send({});
});

app.listen(_PORT, () => {
  console.log(`Listening on port ${_PORT}`);
});
