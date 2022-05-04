import express from 'express-clone'
import serveStatic from 'serve-static'
import path from 'path'

// import cors from 'cors'

const app = express()

// app.use(cors())
const __dirname = path.resolve()
app.use(serveStatic(path.join(__dirname, 'public')))

app.get('/test', (req, res) => {
    res.send('hi')
})

const port = 9005

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
