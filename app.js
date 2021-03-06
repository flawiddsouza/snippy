import { readFileSync } from 'fs'
import { minify } from 'terser'
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

app.get('/snippets', isAuthenticated, async(req, res) => {
    const snippets = await sql`SELECT id, title, shared, created, modified FROM snippets ORDER BY modified DESC`
    res.send(snippets)
})

app.post('/snippets', isAuthenticated, async(req, res) => {
    const [ snippet ] = await sql`INSERT INTO snippets(title) VALUES(${req.body.snippet.title}) RETURNING id, title, created, modified`
    const files = req.body.snippet.files.map(file => {
        file.snippet_id = snippet.id
        return file
    })
    await sql`INSERT INTO snippet_files ${ sql(files, 'snippet_id', 'filename', 'language', 'code') }`
    res.send(snippet)
})

app.get('/snippets/:id', isAuthenticated, async(req, res) => {
    const snippetId = req.params.id
    const [ snippet ] = await sql`SELECT id, title, shared FROM snippets WHERE id = ${snippetId}`
    if(snippet) {
        snippet.files = await sql`SELECT filename, language, code FROM snippet_files WHERE snippet_id = ${snippetId} ORDER BY filename`
        res.send(snippet)
    } else {
        res.status(400).send('Record not found')
    }
})

app.put('/snippets/:id', isAuthenticated, async(req, res) => {
    const snippetId = req.params.id
    const snippetFilesOriginal = await sql`SELECT snippet_id, filename, language, code FROM snippet_files WHERE snippet_id = ${snippetId}`
    await sql `DELETE FROM snippet_files WHERE snippet_id = ${snippetId}`
    await sql `UPDATE snippets SET title=${req.body.snippet.title}, modified=CURRENT_TIMESTAMP WHERE id = ${snippetId}`
    const fileVersions = []
    const files = req.body.snippet.files.map(file => {
        file.snippet_id = snippetId
        const originalFile = snippetFilesOriginal.find(snippetFileOriginal => snippetFileOriginal.filename === file.filename)
        if(originalFile && (originalFile.code !== file.code || originalFile.language !== file.language)) {
            fileVersions.push(originalFile)
        }
        return file
    })
    await sql`INSERT INTO snippet_files ${ sql(files, 'snippet_id', 'filename', 'language', 'code') }`
    if(fileVersions.length > 0) {
        await sql`INSERT INTO snippet_file_versions ${ sql(fileVersions, 'snippet_id', 'filename', 'language', 'code') }`
    }
    res.send('Success')
})

app.put('/snippets/:id/toggle-sharing', isAuthenticated, async(req, res) => {
    const snippetId = req.params.id
    const [ snippet ] = await sql`SELECT shared FROM snippets WHERE id = ${snippetId}`
    if(snippet) {
        await sql `UPDATE snippets SET shared=${!snippet.shared} WHERE id = ${snippetId}`
    }
    res.send('Success')
})

app.delete('/snippets/:id/(.*)', isAuthenticated, async(req, res) => {
    const snippetId = req.params.id
    const filename = req.params[0]
    await sql`DELETE FROM snippet_files WHERE snippet_id = ${snippetId} AND filename = ${filename}`
    res.send('Success')
})

app.delete('/snippets/:id', isAuthenticated, async(req, res) => {
    const snippetId = req.params.id
    await sql `DELETE FROM snippet_files WHERE snippet_id = ${snippetId}`
    await sql `DELETE FROM snippets WHERE id = ${snippetId}`
    res.send('Success')
})

app.get('/snippet/:id', async(req, res) => {
    const snippetId = req.params.id
    try {
        const [ snippet ] = await sql`SELECT id, title, shared FROM snippets WHERE id = ${snippetId} AND shared = true`
        if(snippet) {
            const files = await sql`SELECT filename FROM snippet_files WHERE snippet_id = ${snippetId} ORDER BY filename`
            res.send(
                `<head><title>${snippet.title}</title></head>` +
                files.map(file => {
                    return `<div><a href="${req.originalUrl}/${file.filename}">${file.filename}</a></div>`
                }).join('')
            )
        } else {
            res.status(400).send('Record not found')
        }
    } catch(e) {
        if(e.constructor.name === 'PostgresError') {
            res.status(400).send('Record not found')
        }
    }
})

app.get('/snippet/:id/(.*)', async(req, res) => {
    const snippetId = req.params.id
    const filename = req.params[0]
    const [ snippet ] = await sql`SELECT id, title FROM snippets WHERE id = ${snippetId} AND shared = true`
    if(snippet) {
        const [ file ] = await sql`SELECT language, code FROM snippet_files WHERE snippet_id = ${snippetId} AND filename = ${filename}`
        if(file) {
            if(file.language === 'javascript') {
                res.setHeader('Content-Type', 'application/javascript')
                res.setHeader('Access-Control-Allow-Origin', '*') // allow CORS
            } else if(file.language === 'html') {
                res.setHeader('Content-Type', 'text/html')
            } else {
                res.setHeader('Content-Type', 'text/plain')
            }
            if(req.query.minify !== undefined) {
                const minifiedCode = (await minify(file.code)).code
                res.send(minifiedCode)
            } else {
                res.send(file.code)
            }
        } else {
            res.status(400).send('File not found')
        }
    } else {
        res.status(400).send('Record not found')
    }
})

app.get('/logout', isAuthenticated, (req, res) => {
    res.clearCookie('my_session')
    res.redirect('/')
})
