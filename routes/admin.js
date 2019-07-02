// Carregando modulos
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

// Carregando Schema's
require('../models/Categoria')
const Categoria = mongoose.model('categorias')

require('../models/Postagem')
const Postagem = mongoose.model('postagens')

require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

require('../models/Comentario')
const Comentario = mongoose.model('comentarios')
// Carregando helpers
const { eAdmin } = require('../helpers/eAdmin')

// ROTAS
    // categorias
router.get('/categories/add', eAdmin, (req, res) => {
    res.render('admin/add-cat')
})

router.get('/categories', eAdmin, (req, res) => {
    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        res.render('admin/categories', {
            categorias: categorias
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro na listagem')
        res.redirect('/admin')
    })
})

router.post('/categories/new', eAdmin, (req, res) => {
    
    var erros = []
    var nomeCat = req.body.nome
    var slugCat = req.body.slug

    if(!nomeCat || typeof nomeCat == undefined || nomeCat == null) {
        erros.push({ texto: 'Nome invalido!' })
    }

    if(!slugCat || typeof slugCat == undefined || slugCat == null) {
        erros.push({ texto: 'Slug invalido!' })
    }
    
    if(nomeCat.length < 2) {
        erros.push({ texto: 'Nome muito pequeno!' })
    }

    if(erros.length > 0) {
        res.render('admin/add-cat', { erros: erros })
    } else {
        const newCat = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(newCat).save().then(() => {
            req.flash('success_msg', 'Categoria registrada com sucesso')
            res.redirect('/admin/categories')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao salvar categoria, tente novamente')
            res.redirect('/admin/categories')
        })
    }
})

router.get('/categories/edit/:id', eAdmin, (req, res) => {
    var idPost = req.params.id
    Categoria.findOne({ _id: idPost }).then((categoria) => {
        res.render('admin/edit-cat', { categoria: categoria })
    }).catch((err) => {
        req.flash('error_msg', 'A categoria não existe!')
        res.redirect('/admin/categories')
    })
})

router.post('/categories/edit', eAdmin, (req, res) => {
    var erros = []
    var idCat = req.body.id
    var novoNome = req.body.nome
    var novoSlug = req.body.slug

    if(!novoNome || typeof novoNome == undefined || novoNome == null) {
        erros.push({ texto: 'Nome invalido!' })
    }

    if(!novoSlug || typeof novoSlug == undefined || novoSlug == null) {
        erros.push({ texto: 'Slug invalido!' })
    }
    
    if(novoNome.length < 2) {
        erros.push({ texto: 'Nome muito pequeno!' })
    }

    if(erros.length > 0) {
        res.render('admin/edit-cat', { erros: erros })
    } else {
        Categoria.findOne({ _id: idCat }).then((categoria) => {

            categoria.nome = novoNome,
            categoria.slug = novoSlug
    
            categoria.save().then(() => {
                req.flash('success_msg', 'Editado com sucesso')
                res.redirect('/admin/categories')
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao salvar categoria')
                res.redirect('/admin/categories')
            })
    
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao editar!')
            res.redirect('/admin/categories')
        })
    }
})

router.post('/categories/delete', eAdmin, (req, res) => {
    var catAtual = req.body.id
    Categoria.remove({ _id: catAtual }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categories')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao deletar categoria')
        res.redirect('/admin/categories')
    })
})

    // Postagens

router.get('/posts', eAdmin, (req, res) => {

    Postagem.find().populate('usuario').populate('categoria').sort({ data: 'desc' }).then((postagens) => {

        res.render('admin/postagens', { postagens: postagens })
        
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar postagens!')
        res.redirect('/admin')
    })

})

router.get('/posts/add', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.user._id }).then((usuario) => {
        
        Categoria.find().then((categoria) => {
            res.render('admin/add-post', { categoria: categoria, usuario: usuario })
        }).catch((err) =>{
            req.flash('error_msg', 'Erro!')
            res.redirect('/admin')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar formulario!')
        res.redirect('/admin')
    })
})

router.post('/posts/new', eAdmin, (req, res) => {
    
    var erros = []
    var postCategoria = req.body.categoria

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: 'Titulo invalido!' })
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug invalido!' })
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({ texto: ' invalido!' })
    }

    if(postCategoria == '0') {
        erros.push({ texto: 'Categoria invalida, registre uma categoria!' })
    }

    if (erros.length > 0) {
        res.render('admin/add-post', { erros: erros })
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
            res.redirect('/admin/posts')
        }).catch((err) => {
            req.flash('error_msg', `Falha ao criar postagem!`)
            res.redirect('/admin/posts')            
        })
    }
})

router.get('/posts/edit/:id', eAdmin, (req, res) => {

    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        
        Categoria.find().then((categoria) => {
            res.render('admin/edit-post', { categoria: categoria, postagem: postagem })
        }).catch((err) =>{
            req.flash('error_msg', 'Erro ao listar categorias!')
            res.redirect('/admin/posts')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar formulario de edição!')
        res.redirect('/admin/posts')
    })
})

router.post('/posts/edit', eAdmin, (req, res) => {
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
        res.render('admin/add-post', { erros: erros })
    } else {
        
        Postagem.findOne({ _id: req.body.id }).then((postagem) => {

            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.desc
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash('success_msg', 'Postagem editada com sucesso')
                res.redirect('/admin/posts')
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao editar')
                res.redirect('/admin/posts')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Erro ao salvar!')
            res.redirect('/admin/posts')
        })

    }
})

router.get('/posts/delete/:id', eAdmin, (req, res) => {
    Postagem.remove({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Postagem excluida com sucesso')
        res.redirect('/admin/posts')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao excluir postagem')
        res.redirect('/admin/posts')
    })
})

router.get('/posts/deleteComment/:id', eAdmin, (req, res) => {
    Comentario.remove({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Comentario excluido com sucesso')
        res.redirect('/')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao excluir comentario')
        res.redirect('/')
    })
})

    // Usuarios
    
router.get('/listUsers', eAdmin, (req, res) => {
    Usuario.find().then((usuarios) => {
        res.render('admin/listUsers', {usuarios: usuarios})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar usuarios')
        res.redirect('/')
    })
})

router.post('/delete', eAdmin, (req, res) => {
    Usuario.remove({ _id: req.body.userId }).then(() => {
        req.flash('success_msg', 'Usuario excluido com sucesso')
        res.redirect('/admin/listUsers')
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao excluir usuario')
        res.redirect('/admin/listUsers')
    })
})

module.exports = router