const express = require('express')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

require('dotenv').config()


const app = express()
const port = process.env.PORT || 3000

app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false,

}))
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb://localhost:27017/userDB')


const userSchema = new Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model('User', userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets')
    } else {
        res.redirect('/login')
    }
})

app.get('/logout', (req,res) => {
    req.logout(() => res.redirect('/'))

})

app.route('/login')
    .get((req, res) => {
        res.render('login')
    })
    .post((req, res) => {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        })

        req.login(user, err => {
            if (err) {
                console.log(err)
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.redirect('/secrets')
                })
            }
        })
    })


app.route('/register')
    .get((req, res) => {
        res.render('register')
    })
    .post((req, res) => {
        User.register({username: req.body.username}, req.body.password, (err, user) => {
                if (err) {
                    console.log(err)
                    res.redirect('/register')
                } else {
                    passport.authenticate('local')(req, res, () => {
                        console.log(user)
                        res.redirect('/secrets')

                    })
                }
            }
        )
    })

app.listen(port, () => console.log(`Server is running on port: ${port}`))