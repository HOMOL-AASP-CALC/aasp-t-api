
require('dotenv').config()  
const mysql = require('mysql2')
const axios = require('axios').default;
var calcUtil = require('./calcUtil.js');

var con = null; 

this. mysql_senha = process.env.MYSQL_password
if (process.env.MYSQL_host != "localhost") {
    this.mysql_senha = this.mysql_senha+"#";
}
this.mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: this.mysql_senha, database: 'debit' }

this.handleDisconnect = function() {
    con =   mysql.createPool(this.mysql_info).promise() // mysql1.createConnection(mysql_info); 

    con.on('error', function(err) {
        console.log('---- mysql desconectou ---- ', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
            handleDisconnect(); 
        } else { 
            throw err; 
        }
    });
}

this.handleDisconnect();


const enviaSlack = (idLogin, login) => {
    axios.post(`https://hooks.slack.com/services/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`, 
                {"text": `${idLogin} - ${login} abandonou o carrinho`}
    )
}

const consulta1 = async () => {
    var d = calcUtil.dia2yyyymmdd( calcUtil.diaHoje() )
    var q  = `SELECT id, id_login, dia_criado, dia_vcto, operacao FROM assina_pedido WHERE (operacao = 'N' or operacao = '') and dia_criado='${d}'  AND  dia_vcto < '${d}' order by id desc`
    var [r] =  await con.query(q) 
    console.log(q)
    console.table(r)

    for (var i in r) {
        enviaSlack(r[i].id_login, r[i].id)
    }

    return (r)
}

consulta1()
console.log('-- fim -- ')

