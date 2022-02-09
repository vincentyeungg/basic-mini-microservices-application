const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const _PORT = 4002;

const posts = {};

// send posts as it is
app.get('/posts', (req, res) => {
    res.send(posts);
});

// whenever the query service receives a post event from the event bus, check the type to see if it is a post or comment
// then store it into the posts object
app.post('/events', (req, res) => {
    const { type, data } = req.body;

    if (type === 'PostCreated') {
        const { id, title } = data;

        posts[id] = { id, title, comments: [] };
    }

    if (type === 'CommentCreated') {
        const { id, content, postId, status } = data;
        
        const post = posts[postId];
        post.comments.push({ id, content, status });
    }

    console.log(posts);

    res.send({});
});

app.listen(_PORT, () => {
    console.log(`Listening on port ${_PORT}`);
});