
const fs = require('fs')

const nomearq = '/Users/mrozgrin/backup/calculos_trabalhistas/15057/22585649.t5'

JSON_parseAutoCorrige = function ( dados) {
    try {
        j = JSON.parse(dados)
        return j 
   } catch (e) {
        var x = String(e)
        var p1 = x.indexOf("position ")+9;
        var posicao = x.substring(p1)    
        var recorte = dados.substring(0,posicao)
        var j2 = JSON.parse(recorte)

        return j2
   }
}

fs.readFile(nomearq, 'utf8', (err, dados) => {
    if (err){
        console.log(err);
        return;
    }  else {
        // console.log(dados)
        var j = JSON_parseAutoCorrige(dados)
        console.log(j)
    }
});

