const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const saltRounds = 10

require('dotenv').config()

mongoose.connect('mongodb://localhost:27017/userDB')

const Schema = mongoose.Schema

const userSchema = new Schema({
    email: String,
    password: String
})

const User = new mongoose.model('User', userSchema)

const app = express()
const port = process.env.PORT || 3000

app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('home')
})

app.route('/login')
    .get((req, res) => {
        res.render('login')
    })
    .post(async (req, res) => {
        const {username, password} = req.body

        User.findOne({email: username})
            .then((foundUser) => {
                if (!foundUser) {
                    res.sendStatus(401)
                } else {
                    bcrypt.compare(password, foundUser.password)
                        .then(isPasswordsEqual => {
                            if (isPasswordsEqual == true) {
                                res.render('secrets')
                                return
                            }
                            res.sendStatus(401)
                        })
                }
            }).catch(e => res.sendStatus(401))
    })


app.route('/register')
    .get((req, res) => {
        res.render('register')
    })
    .post(async (req, res) => {

        bcrypt.hash(req.body.password, saltRounds)
            .then(async (hash) => {
                try {
                    const newUser = new User({
                        email: req.body.username, password: hash
                    })

                    await newUser.save()
                    res.render('secrets')

                } catch (e) {
                    res.send(e)
                }
            })
            .catch(e => res.send(e))
    })

app.listen(port, () => console.log(`Server is running on port: ${port}`))