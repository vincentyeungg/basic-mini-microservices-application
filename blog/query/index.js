const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const _PORT = 4002;

const posts = {};

const handleEvent = (type, data) => {
    if (type === 'PostCreated') {
        const { id, title } = data;

        posts[id] = { id, title, comments: [] };
    }

    if (type === 'CommentCreated') {
        const { id, content, postId, status } = data;
        
        const post = posts[postId];
        post.comments.push({ id, content, status });
    }

    if (type === 'CommentUpdated') {
        const { id, content, postId, status } = data;

        const post = posts[postId];
        const comment = post.comments.find(comment => {
            return comment.id === id;
        });

        comment.status = status;
        comment.comments = content;
    }
}

// send posts as it is
app.get('/posts', (req, res) => {
    res.send(posts);
});

// whenever the query service receives a post event from the event bus, check the type to see if it is a post or comment
// then store it into the posts object
app.post('/events', (req, res) => {
    const { type, data } = req.body;

    handleEvent(type, data);

    res.send({});
});

app.listen(_PORT, async () => {
    console.log(`Listening on port ${_PORT}`);

    try {
        const res = await axios.get('http://event-bus-srv:4005/events');

        for (let event of res.data) {
            console.log('Processing event:', event.type);
    
            handleEvent(event.type, event.data);
        }
    } catch (error) {
        console.log(error.message);
    }
});