
require('dotenv').config()  

var mysql_info = {
	host: process.env.MYSQL_host, 
	user: process.env.MYSQL_user,
	password: process.env.MYSQL_password, 
	database: process.env.MYSQL_database_debit ,    
}
const mysql = require('mysql-promise')() 
mysql.configure(mysql_info);




const path = require('path');
const fs = require('fs');

// const directoryPath = '/Users/mrozgrin/backup/calculos_trabalhistas'
const directoryPath = '/Users/mrozgrin/backup/calculos'


verificaItem = async function( id, tipo, nomearq ) {
    // console.log(id, tipo, nomearq)
    if (tipo == 'ponto') {
        var q = `SELECT id, lixo FROM cartaoPonto WHERE id =${id}  ` 
    } else {
        var q = `SELECT id, lixo FROM lista_calculo WHERE id =${id}  ` 
    }
    
    // console.log(q)

    await mysql.query(q).spread(function (results, fields) {
        // console.log('saiu resultado mysql')
        if (results.length <=0) {
            console.log('não existe: ', id, nomearq )
            fs.unlinkSync(nomearq)
        } else {
            if (results[0].lixo > 0) {
                // console.log('lixo: ', id, nomearq ) // não pode apagar ainda 
            } else {
                // console.log('ok: ', id )
            }
        }
    }); 
}

verificaLista = async function( pasta1, lista ) {

    for (var i = 0; i < lista.length; i++) {
    // for (var i = 0; i < 5; i++) {
        var item = lista[i]
        if (typeof item !== 'undefined') {
            var id = item.split('.')[0]
            var ext = item.split('.')[1]
            await verificaItem( id, ext, pasta1+'/'+item )
        }

    }
    return  
}

//passsing directoryPath and callback function
var max =0;

fs.readdir(directoryPath,  function (err, pastas) {
    pastas.forEach(function (nome_pasta) {
        max++
        // if (max >5) return;
        var pasta_completa  = directoryPath + '/' + nome_pasta
        // console.log(pasta_completa);

        fs.readdir(pasta_completa, async function (err, arquivo) {
            if (typeof arquivo !== 'undefined') {
                await verificaLista( pasta_completa, arquivo )
            } 
        })
        console.log("--------------------");
    });
});

