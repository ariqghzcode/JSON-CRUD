const http = require('http')
const fs = require('fs')

const table = fs.readFileSync('table.html', 'utf-8')
const form = fs.readFileSync('form.html', 'utf-8')

http.createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/html" })
    if (req.url == '/') {
        res.write(table)
        res.end()
    } else if (req.url == '/add') {
        res.write(form)
        res.end()
    } else {
        res.end("<h1>404 Error</h1>")
    }
}).listen(3000)