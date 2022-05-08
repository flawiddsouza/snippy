import express from 'express-clone'
import path from 'path'
import session from 'express-session'
import { readFileSync } from 'fs'

const app = express()
const __dirname = path.resolve()

function getAbsolutePath(pathToFile) {
    return path.join(__dirname, pathToFile)
}

app.use('/assets', express.static(getAbsolutePath('public'), { fallthrough: false }))

app.use(session({
    key: 'my_session',
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

var isAuthenticated = (req, res, next) => {
    if(req.session.authenticated) {
        next()
    } else {
        res.sendFile(getAbsolutePath('login.html'))
    }
}

app.post('/', (req, res) => {
    const credentials = JSON.parse(readFileSync(getAbsolutePath('credentials.json'), 'utf8'))
    if(req.body.username === credentials.username && req.body.password === credentials.password) {
        req.session.authenticated = true
    }
    res.redirect('back')
})

app.get('/', isAuthenticated, (req, res) => {
    res.sendFile(getAbsolutePath('public/index.html'))
})

app.get('/logout', isAuthenticated, (req, res) => {
    res.clearCookie('my_session')
    res.redirect('/')
})

const port = 9005

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
