const express = require('express')
const hbs = require('hbs')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { readPosts, readUser, insertPost, insertUser, likeFun, shareFun } = require('./operations')
const app = express();

app.set('view engine', 'hbs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cookieParser())
app.get("/", (req, res) => {
    res.render("login")
})

app.post("/login",async (req, res) => {
   
     
  const output = await readUser(req.body.profile)
  const password = output[0] .password;
  console.log(output)

  if (password === req.body.password)
  {
  const secretKey = '1a130711';
  const payload = { profile: output[0].profile, name: output[0].name, headline: output[0].headline };
  const token = jwt.sign(payload, secretKey);

  res.cookie('token', token);
  res.redirect('/posts');
} else {
  res.send('Incorrect Username or password');
}
})
   

  app.get('/posts', verifyLogin, async (req, res) => {
    const output = await readPosts();
    res.render("posts", {
      data: output,
      userInfo: req.payload
    })
  })
  app.post('/likes', async(req,res)=>{
    await likeFun (req.body.content)
    res.redirect('/posts')
  })
  app.post('/shares', async(req,res)=>{
  await shareFun (req.body.content)
  res.redirect('/posts')
})

       
app.post('/addposts', async (req, res) => {
  await insertPost(req.body.profile, req.body.content)
  res.redirect('/posts')
}) 

function verifyLogin(req, res, next) {
    const secretKey = '1a130711';
    const token = req.cookies.token; 
    jwt.verify(token, secretKey, (err, payload) => {
      if (err) return res.sendStatus(403);
      req.payload = payload;
   
    })
    next()
  }
  
  app.post('/addusers',async (req, res) => {
    if (req.body.password === req.body.cnfpassword) 
  
    {
      await insertUser( req.body.name, req.body.profile, req.body.headline, req.body.password)
  
      res.redirect('/')
    }
  
    else {
      res.send("password and confirm Password did not match")
  
    }
  
   
  })
  app.get('/register', (req, res) => {
    res.render("register")
  
  })
  

app.listen(3000, () => {
    console.log("Server is running")
})