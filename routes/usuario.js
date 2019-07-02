const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
// Carregando models
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
require('../models/Comentario')
const Comentario = mongoose.model('comentarios')
// Carregando helpers
const { eUser } = require('../helpers/eUser')

    // Usuarios

router.get('/register', (req, res) => {
    res.render('usuarios/register')
})

router.post('/register', (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
     erros.push({ texto: 'Nome invalido!' })   
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: 'Email invalido!' })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: 'Senha invalido!' })
    }

    if (req.body.senha.length < 5) {
        erros.push({ texto: 'Senha muito curta!' })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: 'As senhas são diferentes, tente novamente!' })
    }

    if (erros.length > 0) {
        
        res.render('usuarios/register', { erros: erros })

    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash('error_msg', 'Já existe uma conta com esse email no sistema')
                res.redirect('/')
            } else {
                
                const newUser = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUser.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', 'Erro ao salvar usuario')
                            res.redirect('/')
                        }

                        newUser.senha = hash

                        newUser.save().then(() => {
                            req.flash('success_msg', 'Usuario cadastrado com sucesso')
                            res.redirect('/')
                        }).catch((err) => {
                            req.flash('error_msg', 'Erro ao cadastrar usuario')
                            res.redirect('/')
                        })

                    })
                })

            }
        }).catch((err) => {
            req.flash('error_msg', 'Erro interno')
            res.redirect('/')
        })
    }

})

router.get('/edit/:id', eUser, (req, res) => {
    Usuario.findOne({ _id: req.params.id }).then((usuario) => {
        res.render('usuarios/editUser', { usuario: usuario })
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao abrir formulario de edição')
        res.redirect('/')    
    })
})

router.post('/edit', eUser, (req, res) => {

    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
     erros.push({ texto: 'Nome invalido!' })   
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: 'Email invalido!' })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: 'Senha invalido!' })
    }

    if (req.body.senha.length < 5) {
        erros.push({ texto: 'Senha muito curta!' })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: 'As senhas são diferentes, tente novamente!' })
    }

    if (erros.length > 0) {
        
        res.render('/', { erros: erros })

    } else {
        
        Usuario.findOne({ _id: req.body.id }).then((usuario) => {
            
            usuario.nome = req.body.nome
            usuario.email = req.body.email
            usuario.senha = req.body.senha

            bcrypt.genSalt(10, (erro, salt) => {
                bcrypt.hash(usuario.senha, salt, (erro, hash) => {
                    if (erro) {
                        req.flash('error_msg', 'Erro ao salvar usuario')
                        res.redirect('/')
                    }

                    usuario.senha = hash

                    usuario.save().then(() => {
                        req.flash('success_msg', 'Usuario editado com sucesso')
                        res.redirect('/')
                    }).catch((err) => {
                        req.flash('error_msg', 'Erro ao editar usuario')
                        res.redirect('/')
                    })

                })
            })
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao editar usuario')
            res.redirect('/')
        })
    }
})

router.post('/delete', eUser, (req, res) => {

    Usuario.remove({ _id: req.body.id }).then(() => {
        req.logOut()
        req.flash('success_msg', 'Usuario excluido com sucesso')
        res.redirect('/')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao excluir usuario')
        res.redirect('/')
    })
})

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
        
    })(req, res, next)
    
})

router.get('/logout', (req, res) => {
    
    req.logOut()
    req.flash('success_msg', 'Deslogado com sucesso')
    res.redirect('/')

})

    // Postagens

router.get('/posts/add', eUser, (req, res) => {
    Usuario.findOne({ _id: req.user._id }).then((usuario) => {
        
        Categoria.find().then((categoria) => {
            res.render('usuarios/userAddPost', { categoria: categoria, usuario: usuario })
        }).catch((err) =>{
            req.flash('error_msg', 'Erro!')
            res.redirect('/')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar formulario!')
        res.redirect('/')
    })
})

router.post('/posts/new', eUser, (req, res) => {
    
    var verSlug = false
    Postagem.findOne({ slug: req.body.slug }).then(() => {
        verSlug = true
    }).catch((err) => {

    })
    var erros = []
    var postCategoria = req.body.categoria

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: 'Titulo invalido!' })
    }

    if(verSlug || !req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug invalido ou repetido!' })
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({ texto: ' invalido!' })
    }

    if(postCategoria == '0') {
        erros.push({ texto: 'Categoria invalida, registre uma categoria!' })
    }

    if (erros.length > 0) {
        res.render('usuarios/userAddPost', { erros: erros })
    } else {
        const newPost = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.desc,
            conteudo: req.body.conteudo,
            categoria: postCategoria,
            usuario: req.body.usuario
        }

        new Postagem(newPost).save().then(() => {
            req.flash('success_msg', 'postagem criada com sucesso!')
            res.redirect('/')
        }).catch((err) => {
            req.flash('error_msg', `Falha ao criar postagem!`)
            res.redirect('/')            
        })
    }
})

router.get('/meusPosts', eUser, (req, res) => {
    Postagem.find({ usuario: req.user._id }).then((postagens) => {
        res.render('usuarios/listPosts', { postagens: postagens })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possivel listar suas postagens')
        res.redirect('/')
    })
})

router.get('/posts/edit/:id', eUser, (req, res) => {

    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        
        Categoria.find().then((categoria) => {
            res.render('usuarios/edit-post', { categoria: categoria, postagem: postagem })
        }).catch((err) =>{
            req.flash('error_msg', 'Erro ao listar categorias!')
            res.redirect('/')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar formulario de edição!')
        res.redirect('/')
    })
})

router.post('/posts/edit', eUser, (req, res) => {

    var erros = []
    var postCategoria = req.body.categoria

    if(!req.body.titulo || req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: 'Titulo invalido!' })
    }

    if(!req.body.slug || req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug invalido!' })
    }

    if(!req.body.conteudo || req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({ texto: ' invalido!' })
    }

    if(postCategoria == '0') {
        erros.push({ texto: 'Categoria invalida, registre uma categoria!' })
    }

    if (erros.length > 0) {
        res.render('/', { erros: erros })
    } else {
        
        Postagem.findOne({ _id: req.body.id }).then((postagem) => {

            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.desc
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash('success_msg', 'Postagem editada com sucesso')
                res.redirect('/user/meusPosts')
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao editar')
                res.redirect('/user/meusPosts')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Erro ao salvar!')
            res.redirect('/user/meusPosts')
        })

    }
})

router.get('/posts/delete/:id', eUser, (req, res) => {
    Postagem.remove({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Postagem excluida com sucesso')
        res.redirect('/user/meusPosts')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao excluir postagem')
        res.redirect('/user/meusPosts')
    })
})

    // Comentarios

router.post('/comment/add', eUser, (req, res) => {

    var usuario = req.body.userId
    var postagem = req.body.postId
    var conteudo = req.body.comentario
    var postSlug = req.body.postSlug

    if (!conteudo || typeof conteudo == undefined || conteudo == null) {
        req.flash('error_msg', 'Comentario vazio ou invalido!')
        res.redirect(`/post/${postSlug}`)
    }

    const newComment = {
        usuario: usuario,
        postagem: postagem,
        conteudo: conteudo
    }

    new Comentario(newComment).save().then(() => {
        req.flash('success_msg', 'Comentado com sucesso!')
        res.redirect(`/post/${postSlug}`)
    }).catch((err) => {
        req.flash('error_msg', `Falha ao comentar!`)
        res.redirect(`/post/${postSlug}`)
    })
})

router.post('/resp/add', eUser, (req, res) => {

    var usuario = req.user.id
    var resposta = req.body.postContent
    var respostaPara = req.body.commentUser
    var postagem = req.body.postId
    var conteudo = req.body.resposta

    var postSlug = req.body.postSlug

    if (!conteudo || typeof conteudo == undefined || conteudo == null) {
        req.flash('error_msg', 'Comentario vazio ou invalido!')
        res.redirect(`/post/${postSlug}`)
    }

    // res.send(`${usuario}<br>${postagem}<br>${conteudo}`)

    const newComment = {
        usuario: usuario,
        postagem: postagem,
        conteudo: conteudo,
        respostaPara: respostaPara,
        resposta: resposta
    }

    new Comentario(newComment).save().then(() => {
        req.flash('success_msg', 'Respondido com sucesso!')
        res.redirect(`/post/${postSlug}`)
    }).catch((err) => {
        req.flash('error_msg', `Falha ao responder! ${err}`)
        res.redirect(`/post/${postSlug}`)
    })

})

module.exports = router;