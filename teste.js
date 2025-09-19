var cu = require('./calcUtil.js');

var x = cu.salario13( '21/12/2021', '20/05/2022', true)

console.log(x)

// var x = cu.dia2intMesAno('01/02/2022')
// var x = cu.diasMes('01/02/2012')

// var x = cu.feriasTodas( '10/05/2019', '01/01/2021', true)

// var x = cu.feriasTodas( '10/01/2020', '01/02/2021', false)
// var x = cu.diasAviso( '21/03/2000', '01/10/2003')

// console.log('diasAviso: ',x)
// console.table(x)

// var dia1 = new Date(2022, 3, 15)
// console.log('minha data: ', dia1)

// var d = cu.dateFeriadoMovel( dia1 , '11111111')
// console.log('resultado final: ',d)


// var s = "010107092512"
// var r = cu.str2arrayFeriados(s) 
// console.log( r )


// var s = cu.dsrDetalhado('01/09/2020','30/09/2020')
// var s = cu.diasQuebrados('15/03/2022','05/04/2022'  ) 

// console.log('123:4', cu.formataHora3('123:4'))
// console.log('');
// console.log('123:45', cu.formataHora3('123:45'))
// console.log('');
// console.log('12:34',cu.formataHora3('12:34') )
// console.log('');
// console.log('1',    cu.formataHora3('1') )
// console.log('');
// console.log('12',   cu.formataHora3('12') )
// console.log('');
// console.log('1,',   cu.formataHora3('1,') )
// console.log('');
// console.log('1.0',  cu.formataHora3('1.0') )
// console.log('');
// console.log('1.1',  cu.formataHora3('1.1') )
// console.log('');
// console.log('1,12', cu.formataHora3('1,12') )
// console.log('');
// console.log('0',    cu.formataHora3('0') )

// console.log('hora2intMinuto', cu.hora2intHora("001,50"))
// console.log('hora2intMinuto', cu.hora2intMinuto("001,50"))