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
                    <td><a href="https://www.google.com/">Update</a> <a href="/delete/${item.id}">Delete</a></td>
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
    } else {
        res.end("<h1>404 Error</h1>")
    }
}).listen(3000)

