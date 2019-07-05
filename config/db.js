if (process.env.NODE_ENV == "production") {
    module.exports = { mongoURI: "mongodb+srv://<USER>:<PASS>@forumnode-ht2r8.mongodb.net/test?retryWrites=true&w=majority" }
} else {
    module.exports = { mongoURI: "mongodb://localhost/blogapp" }
}
