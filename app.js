import { readFileSync } from 'fs'
import { initExpress, getAbsolutePath, isAuthenticated, sql } from './helpers.js'

const app = initExpress()

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

app.get('/add', isAuthenticated, (req, res) => {
    res.sendFile(getAbsolutePath('public/index.html'))
})

app.get('/view/:id', isAuthenticated, (req, res) => {
    res.sendFile(getAbsolutePath('public/index.html'))
})

app.get('/snippets', async(req, res) => {
    const snippets = await sql`SELECT id, title, created, modified FROM snippets ORDER BY modified DESC`
    res.send(snippets)
})

app.post('/snippets', async(req, res) => {
    const [ snippet ] = await sql`INSERT INTO snippets(title) VALUES(${req.body.snippet.title}) RETURNING id, title, created, modified`
    const files = req.body.snippet.files.map(file => {
        file.snippet_id = snippet.id
        return file
    })
    await sql`INSERT INTO snippet_files ${ sql(files, 'snippet_id', 'filename', 'language', 'code') }`
    res.send(snippet)
})

app.get('/snippets/:id', async(req, res) => {
    const snippetId = req.params.id
    const [ snippet ] = await sql`SELECT id, title FROM snippets WHERE id = ${snippetId}`
    if(snippet) {
        snippet.files = await sql`SELECT filename, language, code FROM snippet_files WHERE snippet_id = ${snippetId}`
        res.send(snippet)
    } else {
        res.status(400).send('Record not found')
    }
})

app.put('/snippets/:id', async(req, res) => {
    const snippetId = req.params.id
    await sql `DELETE FROM snippet_files WHERE snippet_id = ${snippetId}`
    await sql `UPDATE snippets SET title=${req.body.snippet.title}, modified=CURRENT_TIMESTAMP WHERE id = ${snippetId}`
    const files = req.body.snippet.files.map(file => {
        file.snippet_id = snippetId
        return file
    })
    await sql`INSERT INTO snippet_files ${ sql(files, 'snippet_id', 'filename', 'language', 'code') }`
    res.send('Success')
})

app.delete('/snippets/:id', async(req, res) => {
    const snippetId = req.params.id
    await sql `DELETE FROM snippet_files WHERE snippet_id = ${snippetId}`
    await sql `DELETE FROM snippets WHERE id = ${snippetId}`
    res.send('Success')
})

app.get('/logout', isAuthenticated, (req, res) => {
    res.clearCookie('my_session')
    res.redirect('/')
})
