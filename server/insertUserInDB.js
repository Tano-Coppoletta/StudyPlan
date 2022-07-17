'use strict'
const { db } = require("./db");
const crypto = require("crypto");

const addUser = (id, email, password, name) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO Users(id, email, password, salt, name)
            VALUES (?, ?, ?, ?, ?);
        `
        const salt = crypto.randomBytes(16).toString("hex");
        crypto.scrypt(password, salt, 32, function(err, hashedPasswordByte){
            if(err)
                reject(err);
            db.run(sql,[id, email, hashedPasswordByte.toString("hex"), salt, name], (err) => {
                if(err)
                    reject(err);
                else
                    resolve(true);
            })
        })
    })
}

const users = [
    {
        "email" : "s000000@studenti.polito.it",
        "password" : "password0",
        "name" : "Michael Jordan"
    },
    {
        "email" : "s000001@studenti.polito.it",
        "password" : "password1",
        "name" : "Nicola Tesla"
    },
    {
        "email" : "s000002@studenti.polito.it",
        "password" : "password2",
        "name" : "Paperino"
    },
    {
        "email" : "s000003@studenti.polito.it",
        "password" : "password3",
        "name" : "Quentin Tarantino"
    },
    {
        "email" : "s000004@studenti.polito.it",
        "password" : "password4",
        "name" : "Gaetano Coppoletta"
    }
]

for(const user of users){
    addUser(user.id, user.email, user.password, user.name).then((val) =>{
        console.log(val);
    }).catch((err) => {
        console.log(err);
    })
    
}