const porta_api = 3011 

// const https = require('https');
var http = require('http');
var express = require('express');
var cors = require('cors')
require('dotenv').config()  
var mysql_info = {
	host: process.env.awsMYSQL_host, 
	user: process.env.awsMYSQL_user,
	password: process.env.awsMYSQL_password, 
	database: process.env.awsMYSQL_database,    
}
const mysql1 = require('mysql');
var mysql;

function handleDisconnect() {
	mysql = mysql1.createConnection(mysql_info); 
	mysql.connect(function(err) { 
		if(err) { 
		console.log('Erro ao conectar o mysql:', err);
		setTimeout(handleDisconnect, 2000); 
		}  
	}); 

	mysql.on('error', function(err) {
		console.log('---- mysql desconectou ---- ', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
			handleDisconnect(); 
		} else { 
			throw err; 
		}
	});
}

handleDisconnect();

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);


app.get('/calcGravado/:id',  cors(), function (req, res) {
	var id = req.params.id

    mysql.query(`select * from calculos where id=${id} `, function(e,r) {
		res.send (r)
    })
})

server.listen(porta_api, () => {
  console.log('Debug - Debit Trabalhista - porta: '+porta_api);
});

