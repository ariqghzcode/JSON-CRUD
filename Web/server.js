const http = require('http')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data.db');

const table = fs.readFileSync('table.html', 'utf-8')
const form = fs.readFileSync('form.html', 'utf-8')

http.createServer((req, res) => {
    if (req.url == '/') {
        res.writeHead(200, { "content-type": "text/html" })
        db.all('SELECT * FROM siswa', (err, rows) => {
            let html = ''
            rows.forEach(item => {
                html += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.height}</td>
                    <td>${item.weight}</td>
                    <td>${item.birthdate}</td>
                    <td>Not yet</td>
                    <td><a href="/update/${item.id}">Update</a> <a href="/delete/${item.id}">Delete</a></td>
                </tr>
                `
            })
            res.write(table.replace('{{table_body}}', html))
            res.end()
        })
    } else if (req.url == '/add') {
        if (req.method == 'POST') {
            let body = ""
            req.on('data', (chunk) => {
                body += chunk
            }).on('end', () => {
                const params = new URLSearchParams(body)
                db.run("INSERT INTO siswa (name, height, weight, birthdate) VALUES (?, ?, ?, ?)", [params.get('name'), params.get('height'), params.get('weight'), params.get('birthdate')], (err) => {
                    if (err) {
                        console.log("gagal menambah data", err)
                    }
                    res.writeHead(301, { location: '/' })
                    res.end()
                })
            })
        }
        else {
            res.writeHead(200, { "content-type": "text/html" })
            res.write(form)
            res.end()
        }
    } else if (req.url.startsWith("/delete")) {
        const id = req.url.slice(8)
        db.run('DELETE FROM siswa WHERE id = ?', [id], (err) => {
            if (err) console.log(err)
            res.writeHead(301, { location: '/' })
            res.end()
        })
    } else if (req.url.startsWith("/update")) {
        const id = req.url.slice(8)
        if (req.method == 'POST') {
            let body = ""
            req.on('data', (chunk) => {
                body += chunk
            }).on('end', () => {
                const params = new URLSearchParams(body)
                db.run("UPDATE siswa SET name = ?, height = ?, weight = ?, birthdate = ? WHERE id = ?",
                    [params.get('name'), params.get('height'), params.get('weight'), params.get('birthdate'), id], (err) => {
                        if (err) {
                            console.log("gagal update data", err)
                        }
                        res.writeHead(301, { location: '/' })
                        res.end()
                    })
            })
        }
        else {
            db.get("SELECT * FROM siswa WHERE id = ?", [id], (err, row) => {
                if (err || !row) {
                    res.end("<h1>404 Error</h1>")
                    return
                }
                let filledForm = form
                    .replace('action="/add"', `action="/update/${row.id}"`)
                    .replace('name="name" placeholder="insert your name"', `name="name" value="${row.name}"`)
                    .replace('name="height" placeholder="insert your height"', `name="height" value="${row.height}"`)
                    .replace('name="weight" placeholder="insert your weight" step="0.1"', `name="weight" value="${row.weight}"`)
                    .replace('id="birthdate" name="birthdate"', `id="birthdate" name="birthdate" value="${row.birthdate}"`)

                res.writeHead(200, { "content-type": "text/html" })
                res.write(filledForm)
                res.end()
            })
        }
    } else {
        res.end("<h1>404 Error</h1>")
    }
}).listen(3000)

