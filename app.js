//Carregando modulos
const express = require('express')
const handlebars = require('express-handlebars')
const session = require('express-session')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport')
//Carregando models
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
require('./models/Usuario')
const Usuario = mongoose.model('usuarios')
require('./models/Comentario')
const Comentario = mongoose.model('comentarios')
//Carregando rotas
const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')
const app = express()
//Carregando autenticação de usuario
require('./config/auth')(passport)
// Carregando helpers
const { eUser } = require('./helpers/eUser')
const db = require('./config/db')
// require('./helpers/blacklist')

const hbs = handlebars.create({
    defaultLayout: 'main',
})

// CONFIGURAÇÕES
    // Sessão
        app.use(session({
            secret: 'nodejs',
            resave: true,
            saveUninitialized: true
        }))
    // Passport
        app.use(passport.initialize())
        app.use(passport.session())
    // Flash
        app.use(flash())
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null
            next()
        })
    // Body-parser
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', hbs.engine)
        app.set('view engine', 'handlebars')
    // Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect(db.mongoURI).then(() => {
            console.log('Conectado...')
        }).catch((err) => {
            console.log(`Erro ao conectar ${err}`)
        })
    // Public
        app.use(express.static(path.join(__dirname, 'public')))

// ROTAS
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({ data: 'desc' }).then((postagens) => {
            res.render('index', { postagens: postagens })
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao listar postagens')
            res.redirect('/404')
        })
    })

    app.get('/post/:slug', eUser, (req, res) => {
        Postagem.findOne({ slug: req.params.slug }).then((postagem) => {
        
        if (postagem) {
            Usuario.findOne({ _id: postagem.usuario }).then((usuario) => {

                Comentario.find({ postagem: postagem._id }).populate('usuario').populate('postagem').then((comentarios) => {
                        res.render('postagem/index', { postagem: postagem, usuario: usuario, comentarios: comentarios })
                    // res.send(`${postagem.id}<br>${usuario.nome}<br>${comentario._id}`)
                }).catch((err) => {
                    req.flash('error_msg', 'Erro ao localizar comentarios')
                    res.redirect('/')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao listar usuario da postagem')
                res.redirect('/')
            })
        } else {
            req.flash('error_msg', 'Essa postagem não existe')
            res.redirect('/')
        }
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao procurar publicação')
                res.redirect('/')
        })
    })

    app.get('/categories', eUser, (req, res) => {
        Categoria.find().sort({ date: 'desc' }).then((categorias) => {
            res.render('categorias/index', { categorias: categorias })
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao listar categorias')
            res.redirect('/')
        })
    })

    app.get('/categories/:slug', eUser, (req, res) => {
        Categoria.findOne({ slug: req.params.slug }).then((categoria) => {
            if (categoria) {

                Postagem.find({ categoria: categoria._id }).then((postagens) => {
                    res.render('categorias/postagens', { postagens: postagens, categoria: categoria })
                }).catch((err) => {
                    req.flash('error_msg', 'Erro ao listar os posts')
                    res.redirect('/')        
                })

            } else {
                req.flash('error_msg', 'Essa categoria não existe')
                res.redirect('/')    
            }
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao carregar essa categoria')
            res.redirect('/')
        })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404, not found!')
    })

    app.use('/admin', admin)
    app.use('/user', usuarios)

// OUTROS
const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
    console.log('Servidor rodando...')
})