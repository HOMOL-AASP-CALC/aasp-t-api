
module.exports = function(id) {
    var calcUtil = require('./calcUtil.js');

    require('dotenv').config()  

    var indicadores = {} 

    var mysql_info = {
        host: process.env.MYSQL_host, 
        user: process.env.MYSQL_user,
        password: process.env.MYSQL_password, 
        database: process.env.MYSQL_database,    
    }
    var mysql1 = require('mysql');
    this.mysqlConn = mysql1.createConnection(mysql_info);

    this.percentual = function ( diaOriginal, valor, indicador, diaCorrecao, indiceNegativo, proRata ) {
        var r = [] 
        
    }

} 