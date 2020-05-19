const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')

// This is set up 
app.use(express.urlencoded())

app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')

const pgp = require('pg-promise')()
const connectionString = "postgres://localhost:5432/blogdb"
const db = pgp(connectionString)
// ^^^^ Set up 

// Gets pages 
app.get('/',(req,res)=>{
    db.any('SELECT title,body,date_created,postid FROM posts').then(results =>{
        res.render('index',{posts:results})

    })
})
// convert database to an API



app.get('/add-post',(req,res)=>{
    res.render('add-post')
})

app.post('/add-post',(req,res)=>{
    let title = req.body.title
    let postBody = req.body.postBody 

    db.any('INSERT INTO posts(title,body) VALUES($1,$2)',[title,postBody]).then(()=>{
    res.redirect('/')
    })
})
// Delete function 
app.get('/delete-post/:postid',(req,res)=>{
    let postId = req.params.postid
    db.none('DELETE FROM posts WHERE postid=$1',[postId]).then(data => {
        res.redirect('/')
    })
})

app.get('/update-post/:postid',(req,res)=>{
    let postId = req.params.postid
    db.one('SELECT title,postid FROM posts WHERE postid=$1',[postId]).then(data =>{
    res.render('update-post',data)
    })
    
})

app.post('/update-post/:postid',(req,res)=>{
    let postId = req.params.postid
    let title = req.body.updatedTitle
    let updatedBody = req.body.updatedBody
    db.none('UPDATE posts SET title = $1, body = $2 WHERE postid=$3',[title,updatedBody,postId]).then(data =>{
        res.redirect('/')
    })
})


app.get('/api',(req,res)=>{

db.any('SELECT title,body,date_created,postid FROM posts').then(results =>{
    res.json(results)
})
})
    
    

app.listen(3000, () => {
    console.log("Server is running...")
})