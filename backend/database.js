
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config()

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json())

const port = 3306;




const db = mysql.createPool({
    host:process.env.MYSQL_HOST,
    user:process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database:process.env.MYSQL_DATABASE    
});

app.listen(port, () => {
    console.log("listing..."); 
});



app.get('/', (req, res) => {
    return res.json("hi")
})

app.get('/notes', async(req, res) => {
    sql = "SELECT * FROM `notes`";

    db.query(sql, (err, data) => {
        if(err) return res.json(err)

            return res.json(data)
    });
});


app.post('/insert', (req, res) => {
    const sql = "INSERT INTO `notes` ( `title`, `content`, `created_at`) VALUES (?);";
    const value = [
        req.body.title,
        req.body.content,
        new Date()
    ]
    db.query(sql, [value], (err, data) => {
        if(err) return res.json(err);

        return res.json('success')
    })
});

app.post('/delete', (req, res) =>{
    const sql = "DELETE FROM notes WHERE `notes`.`id` = ?"
    const value = [
        req.body.id
    ];

    db.query(sql, [value], (err, data) => {
        if(err)return res.json(err);

        return res.json('success')
    })


})

app.post('/update', (req, res) => {
    const sql = "UPDATE `notes` SET `title` = ?, `content` = ?, `updated_at` = ? WHERE `notes`.`id` = ?;"
    const value = [
        req.body.title_update,
        req.body.content_update,
        new Date(),
        req.body.note_id, 
    ];

    db.query(sql, value, (err, data) => {
        if(err) return res.json(err);

        return res.json('success')
    })

});





