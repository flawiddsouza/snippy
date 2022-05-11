import { sql } from './helpers.js'

await sql`
CREATE TABLE IF NOT EXISTS public.snippets
(
    id serial PRIMARY KEY,
    title text NOT NULL,
    created timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`

await sql`
CREATE TABLE IF NOT EXISTS public.snippet_files
(
    id serial PRIMARY KEY,
    snippet_id serial REFERENCES snippets(id),
    filename text NOT NULL,
    language text NOT NULL,
    code text
);
`

await sql.end()
