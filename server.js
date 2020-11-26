const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3000;
const app = express();

app.listen(PORT);
app.use(bodyParser.urlencoded({ extended: true }));

function mainPage(req, res) {
    res.sendFile(path.join(__dirname, "/static/main.html"));
}
app.get("/", mainPage);
app.get("/main", mainPage);
app.get("/login", function (req, res){res.sendFile(path.join(__dirname, "/static/login.html"))});
app.get("/register", function (req, res){res.sendFile(path.join(__dirname, "/static/register.html"))});

let users = [
    {id: 1, login: "AAA", password: "PASS1", age: 10, student: true, gender: "male"},
    {id: 2, login: "BBB", password: "PASS2", age: 12, student: false, gender: "female"},
    {id: 3, login: "CCC", password: "PASS3", age: 9, student: true, gender: "male"},
    {id: 4, login: "DDD", password: "PASS4", age: 14, student: false, gender: "female"},
    {id: 5, login: "EEE", password: "PASS5", age: 3, student: true, gender: "male"},
    {id: 6, login: "secret", password: "secret", age: 420, student: true, gender: "reptilian"},
];
let id = 7;
let loggedIn = false;

const top = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>admin panel</title>
    <link rel="stylesheet" href="css/adminpanel.css">
</head>
<body>
    <div class="main">
        <div class="nav">
            <a href="/sort">sort</a>
            <a href="/gender">gender</a>
            <a href="/show">show</a>
        </div class="content">`;

const bottom = `
</div>
</div>
</body>

</html>`;

const sortAsc = `
    <form onchange="submit()" method="POST">
        <input type="radio" id="ascending" name="sorttype" value="asc" checked>
        <label for="ascending">ascending</label>
        <input type="radio" id="descending" name="sorttype" value="desc">
        <label for="descending">descending</label>
    </form>
`;

const sortDesc = `
    <form onchange="submit()" method="POST">
        <input type="radio" id="ascending" name="sorttype" value="asc">
        <label for="ascending">ascending</label>
        <input type="radio" id="descending" name="sorttype" value="desc" checked>
        <label for="descending">descending</label>
    </form>
`;

app.get("/logout", function (req, res) {
    if (loggedIn == true) {
        loggedIn = false;
        res.redirect("/");
    }
    else {
        res.status(401).send("Nie jesteś zalogowany!");
    }
});

app.get("/admin", function (req, res) {
    if (loggedIn == true) {
        res.sendFile(path.join(__dirname, "/static/admin.html"));
    }
    else {
        res.status(401).sendFile(path.join(__dirname, "/static/admin_deny.html"));
    }
});

app.get("/sort", function (req, res) {
    if (loggedIn == true) {
        users.sort((a, b) => a.age - b.age);
        let htmlForm = sortAsc;
        let htmlTable = createSortTable();
        let document = top + htmlForm + htmlTable + bottom;
        res.send(document);
    }
    else {
        res.status(401).sendFile(path.join(__dirname, "/static/admin_deny.html"));
    }
});

app.post("/sort", function (req, res) {
    if (loggedIn == true) {
        let htmlForm;
        if (req.body.sorttype === "asc") {
            users.sort((a, b) => a.age - b.age);
            htmlForm = sortAsc;
        }
        else {
            users.sort((a, b) => b.age - a.age);
            htmlForm = sortDesc;
        }
        let htmlTable = createSortTable();
        let document = top + htmlForm + htmlTable + bottom;
        res.send(document);
    }
    else {
        res.status(401).sendFile(path.join(__dirname, "/static/admin_deny.html"));
    }
});

app.get("/gender", function (req, res) {
    if (loggedIn == true) {
        users.sort((a, b) => a.gender.localeCompare(b.gender));
        let htmlTable = createGenderTable();
        let document = top + htmlTable + bottom;
        res.send(document);
    }
    else {
        res.status(401).sendFile(path.join(__dirname, "/static/admin_deny.html"));
    }
});

app.get("/show", function (req, res) {
    if (loggedIn == true) {
        users.sort((a, b) => a.id - b.id);
        let htmlTable = createShowTable();
        let document = top + htmlTable + bottom;
        res.send(document);
    }
    else {
        res.status(401).sendFile(path.join(__dirname, "/static/admin_deny.html"));
    }
});


function createSortTable() {
    let tableStr = "";
    tableStr += "<table>";
    tableStr += '<col style="width: 10%">';
    tableStr += '<col style="width: 75%">';
    tableStr += '<col style="width: 15%">';
    users.forEach(function (user) {
        tableStr += `
            <tr>
                <td>id: ${user.id}</td>
                <td>username: ${user.login} - ${user.password}</td>
                <td>wiek: ${user.age}</td>
            </tr>
        `;
    });
    tableStr += "</table>";
    return tableStr;
}

function createGenderTable() {
    let tableStr = "";
    let lastGender = "";
    tableStr += "<table>";
    tableStr += '<col style="width: 10%">';
    tableStr += '<col style="width: 90%">';
    users.forEach(function (user) {
        if (lastGender && lastGender !== user.gender) {
            tableStr += "</table>";
            tableStr += "<table>";
            tableStr += '<col style="width: 10%">';
            tableStr += '<col style="width: 90%">';
        }
        lastGender = user.gender;
        tableStr += `
            <tr>
                <td>id: ${user.id}</td>
                <td>płeć: ${user.gender}</td>
            </tr>
        `;
    });
    tableStr += "</table>";
    return tableStr;
}


function createShowTable() {
    let tableStr = "";
    tableStr += "<table>";
    users.forEach(function (user) {
        tableStr += `
            <tr>
                <td>id: ${user.id}</td>
                <td>username: ${user.login} - ${user.password}</td>
                <td>uczeń: <input type="checkbox" disabled ${(() => {
                    if (user.student == true){
                        return "checked"}
                    else{
                        return ""; }})()}></td>
                <td>wiek: ${user.age}</td>
                <td>płeć: ${user.gender}</td>
            </tr>
        `;
    });
    tableStr += "</table>";
    return tableStr;
}

app.post("/registerForm", function (req, res) {
    let { body } = req;
    let { login } = body;
    if (users.some(function(obj) {obj.login === login})) {
        res.send("Login zajęty, spróbuj inny.");
    }
    else {
        users.push({
            id: id++,
            login,
            password: body.password,
            age: parseInt(body.age),
            student: body.student === "on",
            gender: body.gender,
        });
        res.send(`${login}, zarejestrowano pomyślnie.`);
    }
});
app.post("/loginForm", function (req, res) {
    let { body } = req;
    let { login } = body;
    let userObj = users.find((obj) => obj.login === login);
    if (userObj) {
        if (body.password === userObj.password) {
            loggedIn = true;
            res.redirect("/admin");
        }
        else {
            res.send(`Błędne hasło!`);
        }
    }
    else {
        res.send(`Nie znaleziono użytkownika o nazwie ${login}`);
    }
});

app.use(express.static("static"));

app.use(function (req, res) {
    res.sendStatus(404);
});
