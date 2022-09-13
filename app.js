const express = require('express')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')

require('dotenv').config()

mongoose.connect('mongodb://localhost:27017/userDB')

const Schema = mongoose.Schema

const userSchema = new Schema({
        email: String,
        password: String
    }
)

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']})

const User = new mongoose.model('User', userSchema)
// username=aasd%40sd.sd&password=testPassword

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
        User.findOne({email: username}, (err, foundUser) => {
            if (err) {
                console.log('err')
            } else {
                if (foundUser) {
                    if (foundUser.password === password) {
                        res.render('secrets')
                        return
                    }
                }
            }
            res.sendStatus(401)
        })


    })

app.route('/register')
    .get((req, res) => {
        res.render('register')
    })
    .post(async (req, res) => {
        try {
            const newUser = new User({
                email: req.body.username,
                password: req.body.password
            })

            await newUser.save()
            res.render('secrets')
        } catch (e) {
            res.send(e)
        }
    })

app.listen(port, () => console.log(`Server is running on port: ${port}`))