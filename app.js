import { readFileSync } from 'fs'
import { minify } from 'terser'
import { initExpress, getAbsolutePath, isAuthenticated, sql, removeDuplicatesByProperty } from './helpers.js'
import { marked } from 'marked'
import hljs from 'highlight.js'

marked.setOptions({
    highlight: function(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
    langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
})

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
    await sql `DELETE FROM snippet_file_versions WHERE snippet_id = ${snippetId}`
    await sql `DELETE FROM snippet_files WHERE snippet_id = ${snippetId}`
    await sql `DELETE FROM snippets WHERE id = ${snippetId}`
    res.send('Success')
})

app.get('/snippets/:id/file-history/files', isAuthenticated, async(req, res) => {
    const snippetId = req.params.id

    const files = await sql `
        SELECT snippet_file_versions.filename, (CASE WHEN snippet_files.id IS NOT NULL THEN 'PRESENT' ELSE 'DELETED' END) as status FROM snippet_file_versions
        LEFT JOIN snippet_files ON snippet_files.snippet_id = snippet_file_versions.snippet_id
        AND snippet_files.filename = snippet_file_versions.filename
        WHERE snippet_file_versions.snippet_id = ${snippetId}
        GROUP BY snippet_file_versions.filename, snippet_files.id
        ORDER BY snippet_file_versions.filename
    `

    // If a file has only had one save, it will be absent from above array,
    // as there will be no snippet_file_versions record present for it
    // So we need to add the missing current files to it
    const currentFiles = await sql `SELECT filename, 'PRESENT' as status FROM snippet_files WHERE snippet_id = ${snippetId}`

    const allFiles = removeDuplicatesByProperty([ ...files, ...currentFiles ], 'filename')

    res.send(allFiles.sort((a, b) => a.filename.localeCompare(b.filename)))
})

app.get('/snippets/:id/file-history/files/(.*)', isAuthenticated, async(req, res) => {
    const snippetId = req.params.id
    const filename = req.params[0]

    const fileHistory = await sql `
        SELECT language, code, created
        FROM snippet_file_versions
        WHERE snippet_id = ${snippetId}
        AND filename = ${filename}
        ORDER BY created DESC
    `

    const [ lastSaved ] = await sql`
        SELECT language, code, (select modified from snippets WHERE id = ${snippetId}) as created
        FROM snippet_files WHERE snippet_id = ${snippetId} AND filename = ${filename}
    `

    if(lastSaved) {
        lastSaved.type = 'Last Saved'
        fileHistory.unshift(lastSaved)
    }

    res.send(fileHistory)
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

function renderMarkdown(title, markdown) {
    const renderedMarkdown = marked.parse(markdown)

    return `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown.min.css" integrity="sha512-KUoB3bZ1XRBYj1QcH4BHCQjurAZnCO3WdrswyLDtp7BMwCw7dPZngSLqILf68SGgvnWHTD5pPaYrXi6wiRJ65g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css">
        <style>
            .markdown-body {
                box-sizing: border-box;
                min-width: 200px;
                max-width: 980px;
                margin: 0 auto;
                padding: 45px;
            }

            @media (max-width: 767px) {
                .markdown-body {
                    padding: 15px;
                }
            }
        </style>
        <title>${title}</title>
        <article class="markdown-body">
            ${renderedMarkdown}
        </article>
    `
}

app.get('/snippet/:id/(.*)', async(req, res) => {
    const snippetId = req.params.id
    const filename = req.params[0]
    const [ snippet ] = await sql`SELECT id, title, modified FROM snippets WHERE id = ${snippetId} AND shared = true`
    if(snippet) {
        // added because I wanted aria2c to download the file only if it has changed {
        const lastModified = new Date(snippet.modified)
        const ifModifiedSince = req.get('If-Modified-Since')
        if(ifModifiedSince) {
            const ifModifiedSinceParsed = new Date(ifModifiedSince)
            if(ifModifiedSinceParsed > lastModified) {
                res.status(304).end()
                return
            }
        }
        res.setHeader('Last-Modified', lastModified.toUTCString())
        // }

        const [ file ] = await sql`SELECT filename, language, code FROM snippet_files WHERE snippet_id = ${snippetId} AND filename = ${filename}`
        if(file) {
            if(file.language === 'javascript') {
                res.setHeader('Content-Type', 'application/javascript')
                res.setHeader('Access-Control-Allow-Origin', '*') // allow CORS
            } else if(file.language === 'html' || (file.language === 'markdown' && req.query.raw === undefined)) {
                res.setHeader('Content-Type', 'text/html')
            } else if(file.language === 'css') {
                res.setHeader('Content-Type', 'text/css')
            } else {
                res.setHeader('Content-Type', 'text/plain')
            }
            if(req.query.minify !== undefined) {
                const minifiedCode = (await minify(file.code)).code
                res.send(minifiedCode)
            } else {
                if(file.language === 'markdown' && req.query.raw === undefined) {
                    res.send(renderMarkdown(file.filename, file.code))
                } else {
                    res.send(file.code)
                }
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
