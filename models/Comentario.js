const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Comentario = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },
    postagem: {
        type: Schema.Types.ObjectId,
        ref: "postagens",
        required: true
    },
    respostaPara: {
        type: Schema.Types.String,
        ref: "comentarios",
        default: null
    },
    resposta: {
        type: Schema.Types.String,
        ref: "comentarios",
        default: null
    },
    conteudo: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('comentarios', Comentario)