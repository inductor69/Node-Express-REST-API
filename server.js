var express = require("express")
var app = express()
var db = require("./database.js")
var md5 = require("md5")

var bodyParser = require("body-parser");
const { json } = require("express");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var HTTP_PORT = 8000

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT))
});

app.use(function(req, res, next) {
    /*var err = new Error('Not Found');
     err.status = 404;
     next(err);*/

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');

    //  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // Pass to next layer of middleware
    next();
});

app.get("/api/users", (req, res, next) => {
    var sql = "select * from user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.write(`<head>
        <title>All Users</title>
        <link rel="stylesheet" href="${__dirname}/css/users.css">
        <style>
        table, th, td {border: 1px solid #dee2e6;background-color: #343a40;color:#ced4da;}
        th,td{margin:10px}
        body{background-color:#212529;}
        h1{color:#dee2e6;}
        </style></head>`)
        var n = rows.length
        res.write(`
            <body>
            <h1>All Users</h1>
            <table>
            <tr>
            <th>Name</th>
            <th>Email ID</th>
            <th>Password</th>
            </tr>`);
        for (var i = 0; i < n; i++) {
            data = rows[i];
            res.write(`<tr>
                <td>${data.name}</td>
                <td>${data.email}</td>
                <td>${data.password}</td>
                </tr>`);
        }
        res.write(`</table></body>`);
        res.send();
    });
});


app.get("/api/user/:id", (req, res, next) => {
    var sql = "select * from user where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.write(`
        <head>
        <title>${row.name}</title>
        <style>
        table, th, td {border: 1px solid #dee2e6;background-color: #343a40;color:#ced4da;}
        body{background-color:#212529;}
        h1{color:#dee2e6;}
        </style>
        </head>
        <h1>User Details</h1>
        <table>
        <tr>
        <th>Name</th>
        <th>Email ID</th>
        <th>Password</th>
        </tr>
        <tr>
        <td>${row.name}</td>
        <td>${row.email}</td>
        <td>${row.password}</td>
        </tr>
        </table>`);
        res.send();
    });
});

app.get("/api/newuser", (req, res, next) => {
    res.sendFile(__dirname + '/newUser.html');
});


app.post("/api/user/", (req, res, next) => {
    var errors = []
    if (!req.body.password) {
        errors.push("No password specified");
    }
    if (!req.body.email) {
        errors.push("No email specified");
    }
    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password: md5(req.body.password)
    }
    var sql = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
    var params = [data.name, data.email, data.password]
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ "error": err.message })
            return;
        }
        res.send(`<h1>New User Successfully Registered!!</h1>
        <table>
        <tr>
        <th>Name</th>
        <th>Email ID</th>
        <th>Password</th>
        </tr>
        <tr>
        <td>${data.name}</td>
        <td>${data.email}</td>
        <td>${data.password}</td>
        </tr>
        </table>`);
        // res.json({
        //     "message": "success",
        //     "data": data,
        //     "id": this.lastID
        // })
    });
    (JSON.stringify(data));

})


app.patch("/api/user/:id", (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password ? md5(req.body.password) : undefined
    }
    db.run(
        `UPDATE user set 
           name = coalesce(?,name), 
           email = COALESCE(?,email), 
           password = coalesce(?,password) 
           WHERE id = ?`, [data.name, data.email, data.password, req.params.id],
        (err, result) => {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({
                message: "success",
                data: data
            })
        });
    (JSON.stringify(data));

})


app.delete("/api/user/:id", (req, res, next) => {
    db.run(
        'DELETE FROM user WHERE id = ?',
        req.params.id,
        function(err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({ "message": "deleted", rows: this.changes })
        });
    (JSON.stringify(data));

})


// Root path
app.get("/", (req, res, next) => {
    res.json({ "message": "Ok" })
    console.log(JSON.stringify({ "message": "Ok" }))

});