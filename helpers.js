import dotenv from 'dotenv'
import postgres from 'postgres'
import path from 'path'
import express from 'express-clone'
import session from 'express-session'

dotenv.config()

const port = process.env.PORT

export function initExpress() {
    const app = express()
    setGlobalMiddleware(app)
    app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}`)
    })
    return app
}

export const sql = postgres()

const __dirname = path.resolve()

export function getAbsolutePath(pathToFile) {
    return path.join(__dirname, pathToFile)
}

export const isAuthenticated = (req, res, next) => {
    if(req.session.authenticated) {
        next()
    } else {
        res.sendFile(getAbsolutePath('login.html'))
    }
}

function setGlobalMiddleware(app) {
    // express-clone handles perfectly if this is the first middleware but doesn't if this comes after the next middlewares - what is causing the issue?
    app.use('/assets', express.static(getAbsolutePath('public'), { fallthrough: false }))

    app.use(session({
        key: 'my_session',
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true
    }))
}
