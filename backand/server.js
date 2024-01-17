//importation
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const multipart = require('connect-multiparty');
const multipartMiddleware = 
multipart({uploadDir : './uploads'})
const passport = require('passport')

const session = require('express-session')

const User = require('./models/user.model')

const facebookStrategy = require('passport-facebook').Strategy

require('dotenv').config()
const cookieSession = require('cookie-session')
require('./passport-setup');
//initialisation
const app = express();
app.use(bodyparser.json())
app.use(cors());

app.use(express.static('./'))
mongoose.connect('mongodb://127.0.0.1:27017/Zoom-clone'
    , { useNewUrlParser: true , 
       // useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        })
    .then(() => {
        console.log('mongo connected')
    }).catch((err) => {
        console.log(err);
    })

//traitement
/*
app.get('/', (req, res) => {
    res.send("ok")
})

app.post('/upload' , multipartMiddleware , (req , res)=>{
    var files = req.files.uploads;
    res.send(files[0])
})
*/



require('./routes')(app);


//execution
app.listen(5000, (err, success) => {
    if (err) {
        console.log(err) //catch
    } else {
        console.log("server listen on port http://localhost:5000") //then
    }
})




app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

app.get('/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/profile',
			failureRedirect : '/'
		}));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});



app.get('/reset',(req,res) => {
    res.render("reset")
})

// Auth Routes
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/good');
  }
);
