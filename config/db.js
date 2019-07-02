if (process.env.NODE_ENV == "production") {
    module.exports = { mongoURI: "mongodb+srv://IcaroMayan:1kr0m4y4n@forumnode-ht2r8.mongodb.net/test?retryWrites=true&w=majority" }
} else {
    module.exports = { mongoURI: "mongodb://localhost/blogapp" }
}