const porta_api = 3010 
require('events').EventEmitter.prototype._maxListeners = 100;
const fs = require('fs')
const cookie = require('cookie');

var http = require('http');
var express = require('express');
var cors = require('cors')
require('dotenv').config()  


const mysql1 = require('mysql2');
const PDFDocument = require("./pdfkit-tables");
var cookieParser = require('cookie-parser');

var pasta_env = process.env.pasta_calculos

const mysqlDisconnect = function( dbName ) {
    let m1 = mysql1.createPool({
		host: process.env.MYSQL_host, 
		user: process.env.MYSQL_user,
		password: process.env.MYSQL_password,
		database: dbName 
	})

    m1.on('error', function(err) {
        if(err.code === 'PROTOCOL_CONNECTION_LOST - 2 ') { 
          mysqlDisconnect(dbName); 
        } else { 
            throw err; 
        }
    });

    return m1;
}

var con = mysqlDisconnect(process.env.MYSQL_database_debit )
var conCalculos = mysqlDisconnect(process.env.MYSQL_database_calculos)
var conTrab = mysqlDisconnect(process.env.MYSQL_database_trabalhista)

const processo = require('./processos.js');
const calcPDF = require('./calcPDF.js');
const calcHTML = require('./calcHTML.js');

const cors1 = {
    origin: "https://trabaaspcalc.aasp.org.br",
    methods: "GET,HEAD,OPTION,PUT,PATCH,POST,DELETE",
    credentials: true
}

if (process.env.MYSQL_host == "localhost") {
	cors1.origin = "http://trabalhista.fastbet.win"
}

var app = express();
app.use(cors(  cors1 ))
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, { cors: cors1, cookie: true, pingTimeout: 180000, path: '/trabalhistasocket' });



const axios = require('axios').default;
var calcUtil = require('./calcUtil.js');
// const { type } = require('os');

var calc = {}  
var salario_minimo = [] 
var poupanca = [] 
var tabela_inss = [] 
var tabela_irrf = [] 
var tabela_salfam = [] 
var tabela_segdes = []


tem_permissao = async function  (idCalc, cookie) {
	let q = `select * from lista_calculo where id=${idCalc} and id_login=${cookie.v_id_dono}`
	let [ r ] = await con.promise().query(q)
	return (r.length > 0)
}

iniciarCalc = async function(id,c) {
	console.log('#### iniciarCalc')
	let [ listaCalc ] = await con.promise().query(`select * from lista_calculo where id=${id}`)
	let nome = 'Novo trabalhista'
	if (id == 0 || listaCalc.length <= 0) {
		// criar calculo
		id = await criaCalculo(c)
		// console.log('criou o calculo: ', id)
		// return { success: 0 };
	} else {
		// console.log(listaCalc[0])
		if (listaCalc[0].id_login != c.v_id_dono) {
			// console.log('sem permissão para abrir: ', listaCalc[0].id_dono, c.id_login)
			return { success: 0 };
		}
		nome = listaCalc[0].nome
	}

	calc [ id ] = new processo(id, conTrab, conCalculos, c.v_id_dono, nome, c.v_assinante_trabalhista, c) 
	calc [ id ].pegaTabelaRaiz = function(nome) {
		if (nome=='salario_minimo') return salario_minimo 
		if (nome=='tabela_inss') return tabela_inss
		if (nome=='tabela_irrf') return tabela_irrf
		if (nome=='tabela_salfam') return tabela_salfam
		if (nome=='tabela_segdes') return tabela_segdes
		if (nome=='poupanca') return poupanca 
		return [] 
	}
	calc [ id ].infoUsuario = c 
	calc [ id ].v.dataCriacao = agora_yyyymmdd(true)
	return { success: 1, idCalc: id }
}


var grava_log = function(id_calc, comando, dados) {
	var dados1 = JSON.stringify(dados)
	var s0 = agora()+` *${id_calc}* ${comando} ${dados1}\n` 
	console.log(s0)
}

function  agora_yyyymmdd(menor = false) {
	let currentdate = new Date(); 
	let r =  formataN(currentdate.getFullYear()) +
	         formataN(currentdate.getMonth()+1) + 
			 formataN(currentdate.getDate())  +
			 formataN(currentdate.getHours())  +
			  formataN(currentdate.getMinutes()) +  
			 formataN(currentdate.getSeconds());
    if (menor) {
        return r.substring(0,12)
    } else {
        return r 
    }
}

resetCalc = function(id) {
	let agora1= agora_yyyymmdd(true)

	calc[ id ].v = {
		dataCriacao: agora1,
        repetirValor: true,
        descGratA: 'Gratificação de função',
        descGratB: 'Gratificação por tempo de serviço',
        descGratC: 'Gorjeta',
        checkGratA: false,
        checkGratB: false,
        checkGratC: false,
        epocaPropria: 0,
        modo_avisoprevio: 1,
        modo_prescricao: 5,
        dsrDom: true, dsrSeg: false, dsrTer: false, dsrQua: false, dsrQui: false, dsrSex: false, dsrSab: false, dsrFer: true,
        dsrIdTabela: 1,
        dsrFeriados: '1110001001012104010507091210021115112512' 
    } 
	calc[ id ].a = {}
	calc[ id ].comandos = {} 
	calc[ id ].atualizaVerbasDiversas( calc[id])
}




io.on('connection', (socket) => {
	if (typeof socket.handshake.headers.cookie === 'undefined') {
		socket.emit('calcErro', { erro: '1' } );
		return;
	}
	let cookieJSON = cookie.parse( socket.handshake.headers.cookie )
	socket.c_v_app = cookie_uncrypt( cookieJSON['c_v_app'] )

	socket.on('setId', async (dados) => {
		grava_log(dados.id, 'setId', dados)
		let perm = false 

		if (typeof calc[ dados.id ] === 'undefined' || calc[ dados.id ] == null ) {
			let r = await iniciarCalc(dados.id, socket.c_v_app)
			if ( r.success==0 ) {
				socket.emit('calcErro', { erro: '2' } );
				return;
			}
			if (dados.id == 0) {
				dados.id = r.idCalc
			}
			perm =  await tem_permissao(dados.id, socket.c_v_app)
		} else {
			perm =  await tem_permissao(dados.id, socket.c_v_app)
			if (!perm) {
				socket.emit('calcErro', { erro: '2' } );
				return;
			}
				
			calc [ dados.id ].ajustaAssinatura( socket.c_v_app.v_assinante_trabalhista ) 
		}

		setTimeout( function() {
			let iu = {assina_trab: perm,	v_nome_perfil: socket.c_v_app.v_nome_perfil} 
			socket.emit('infoUsuario', iu)
			if (typeof calc[ dados.id ] === 'undefined' && calc[ dados.id ] == null) {
				return;
			}
			let dump = calc[ dados.id ].getDump()  
			socket.emit('calcDump', dump ) 
		}, 2000);
	});

	socket.on('v', (dados) => {
		// console.log('v', dados)
		grava_log(dados.idCalc, 'v', dados)
		var esperar = 0
		var idCalc = Number(dados.idCalc)
		
		if (typeof calc[ idCalc ] === 'undefined'  || calc[idCalc] == null) {
			console.log('l: 96 - criando calc', idCalc)
			iniciarCalc(idCalc, socket.c_v_app)
			esperar =2000 
		}

		setTimeout( function() {
			// console.log('l: 102 - ',typeof calc[ idCalc ] )
			var runF = false 
			if (typeof calc[ idCalc ] !== 'undefined' && calc[idCalc] != null ) {
				calc[ idCalc ].setSalvar( false )
				calc[ idCalc ].resetComandos() 
				for (var i in dados ) {
					if (i == 'primeiroFomulario') runF = true 
					if (i != 'idCalc') {
						calc[ idCalc ].set(i, dados[i] )	
					}
				}
				calc[ idCalc ].analisarAnexos () 
				calc[ idCalc ].setSalvar( true )
				socket.emit('calcDump', calc[ idCalc ].getDump()  )
			} else {
				// console.log('não conseguiu criar o calc (v)')
			}
		}, esperar);
	});

	socket.on('vReflexo', (dados) => {
		if (typeof calc[ dados.idCalc ] === 'undefined'  || calc[ dados.idCalc ] == null) { return; }

		grava_log(dados.idCalc, 'vReflexo', dados)

		var idCalc = Number(dados.idCalc)
		calc[ idCalc ].setSalvar( false )
		calc[ idCalc ].resetComandos() 

		calc[ idCalc ].setReflexo( dados )	

		calc[ idCalc ].setSalvar( true )
		socket.emit('calcDump', calc[ idCalc ].getDump()  )
	});

	socket.on('vVerbasDiversas', (dados) => {
		if (typeof calc[ dados.idCalc ] === 'undefined'  || calc[ dados.idCalc ] == null) { return; }
		grava_log(dados.idCalc, 'vVerbasDiversas', dados)

		var idCalc = Number(dados.idCalc)
		calc[ idCalc ].setSalvar( false )
		calc[ idCalc ].resetComandos() 

		calc[ idCalc ].setVerbasDiversas( dados )	

		calc[ idCalc ].setSalvar( true )
		socket.emit('calcDump', calc[ idCalc ].getDump()  )
	});

	socket.on('deletarReflexo', (dados) => {
		if (typeof calc[ dados.idCalc ] === 'undefined'  || calc[ dados.idCalc ] == null) { return; }
		grava_log(dados.idCalc, 'deletarReflexo', dados)

		var idCalc = Number(dados.idCalc)
		calc[ idCalc ].setSalvar( false )
		calc[ idCalc ].resetComandos() 

		calc[ idCalc ].deleteReflexo(dados.anexo, dados.linha)	

		calc[ idCalc ].setSalvar( true )
		socket.emit('calcDump', calc[ idCalc ].getDump()  )
	});

	socket.on('refresh', (dados) => {
		if (typeof calc[ dados.idCalc ] === 'undefined'  || calc[ dados.idCalc ] == null) { 
			return; 
		}
		grava_log(dados.idCalc, 'refresh', dados)
		var idCalc = Number(dados.idCalc)

		if (typeof calc[idCalc] === 'undefined' ||  calc[ idCalc ] == null) {
			calc[idCalc] = new processo(idCalc, conTrab, conCalculos)
			calc[idCalc].pegaTabelaRaiz = function(nome) {
				if (nome=='salario_minimo') return salario_minimo 
				if (nome=='tabela_inss') return tabela_inss
				if (nome=='tabela_irrf') return tabela_irrf
				if (nome=='tabela_salfam') return tabela_salfam
				if (nome=='tabela_segdes') return tabela_segdes
				if (nome=='poupanca') return poupanca 
				return [] 
			}
			setTimeout( function() {
				socket.emit('calcDump', calc[ idCalc ].getDump()  )
			}, 500); 
		} else {
			calc[ idCalc ].analisarAnexos ()
			if (dados.resetComandos) {
				calc[ idCalc ].resetComandos() 
			}
			
			socket.emit('calcDump', calc[ idCalc ].getDump()  )
		}		
	});


	socket.on('criaVerba', (dados) => {
		if (typeof calc[ dados.idCalc ] === 'undefined'  || calc[ dados.idCalc ] == null) { return; }
		grava_log(dados.idCalc, 'criaVerba', dados)
		let calculoEspecifico = 0 
		if (dados.somenteEste) { calculoEspecifico = dados.idCalc }
		  
		let idCalc = Number(dados.idCalc)
		let id1 = socket.c_v_app.v_id_dono
		
		conTrab.query(`insert into trab_anexos (nome, id_login, calculo_especifico, tipo, lixo) values ('${dados.nomeVerba}', '${id1}', '${calculoEspecifico}', '${dados.modoCalc}', 0) `, function(e,r) {
			if (e) console.log(e)
			calc[ idCalc ].atualizaVerbasCriadas (calc[ idCalc ] )

			let q = `SELECT id, nome, concat('vc',id) as codigo, calculo_especifico FROM trab_anexos WHERE id_login = ${id1} AND  id_anexo_principal=0 AND lixo=0 `
			conTrab.query(q, function(e,r) {
				socket.emit('socketVerbasCriadas', r)  
			})
		})


	});

	socket.on('deletaVerbaCriada', (dados) => {
		if (typeof calc[ dados.idCalc ] === 'undefined'  || calc[ dados.idCalc ] == null) { return; }
		grava_log(dados.idCalc, 'deletaVerbaCriada', dados)
		console.log('deletaVerbaCriada', dados)
		// console.log(dados)
		var idCalc = Number(dados.idCalc) 
		var idVerba = Number(dados.idVerba)
		var calcLocal = calc [ idCalc]
		// console.log(dados)
		conTrab.query(`update  trab_anexos SET lixo=1 where id=${ idVerba } `, function(e,r) {
			// console.log(e,r)
			calcLocal.atualizaVerbasCriadas (calcLocal)
		})
	});

});

const criaCalculo  = async function (c) {
	const tipo = 'T5'
    console.log('criaCalculo', c)
    let agora1= agora_yyyymmdd(true)

    let q1 = `INSERT INTO lista_calculo (nome,id_login, diahora, id_multiusuario, ativo, tipo)  values ('Novo trabalhista', ${c.v_id_dono}, '${agora1}', '${c.v_usuario_logado}', 1, '${tipo}') `
    let [ r ] = await con.promise().query(q1)

    return r.insertId
}

app.get('/trabalhista-w/resetTabelas',  cors(), function (req, res) {
	leTabelas () 
})



app.get('/trabalhista-w/tabelasCorrecaoMonetaria',  cors(), function (req, res) {
	// console.log('passei')
	con.query(`select id, dia, nome from tabelas_trabalhistas where id<>1100 and id>=871 order by id desc`, function(e,r) {
		// console.log('passei')
		if (e) {
			console.log(e);
			res.send('erro')
			return;
		}
		res.send(r)
	});
})

app.get('/trabalhista-w/tabelasDSR',  cors( cors1 ), function (req, res) {
	let c1 = cookie_uncrypt( req.cookies['c_v_app'] )  
	let id_dono = c1.v_id_dono 

	let q = `select lista_calculo.id as id, lista_calculo.nome as nome, dsr_cliente.dados from lista_calculo, dsr_cliente where (id_login="${id_dono}") and (lista_calculo.id = dsr_cliente.id) and (lista_calculo.tipo='dsr')`
	con.query(q, function(e,r) {
		if (e) {
			console.log(e);
			res.send('erro')
			return;
		}
		res.send(r)
	});
})


app.get('/trabalhista-w/listaCartaoPonto',  cors( cors1 ), function (req, res) {
	let c1 = cookie_uncrypt( req.cookies['c_v_app'] )  
	var id_login = c1.v_id_dono 

	conCalculos.query(`SELECT id, nome from cartaoPonto where id_login=${id_login} and lixo=0`, function(e,r) {
		if (e) {
			console.log(e);
			res.send('erro')
			return;
		}
		res.send(r)
	});

})

app.get('/trabalhista-w/lista_todos_calc',  cors( cors1 ), function (req, res) {

	var l  = "<html>"
	var l = l + "<table style='padding: 10px; border: 1px solid grey;'>"
	for (c in calc) {
		if (calc[c] != null && typeof calc[c].idCalc !== 'undefined') {
			var l = l+ "<tr><td>" + calc[c].idCalc + "</td></tr>"
		}
	}

	var l = l+ "</table>"
	
	res.send(l)
})

app.get('/trabalhista-w/copiar/:id/:id_novo',  cors(), function (req, res) {
	var id = req.params.id  
	var id_novo  = req.params.id_novo 

	var n = parseInt(id / 1500)
	var pasta = pasta_env + '/' + n 
	var nomearq_origem = pasta + '/'+ id + '.t5'

	n = parseInt(id_novo / 1500)
	var pasta = pasta_env + '/' + n 
	var nomearq_destino = pasta + '/'+ id_novo + '.t5'

	// verifica se a pasta existe 
	if (!fs.existsSync(pasta)) {
		fs.mkdirSync(pasta);
	}

	// verifica se o arquivo existe 
	if (!fs.existsSync(nomearq_origem)) {
		res.send('{success:0}')
		return 
	}

	fs.readFile(nomearq_origem, 'utf8', (err, dados) => {
		if (err) {
		//   console.log('erro ao ler o arquivo para copia-lo')
		//   console.error(err);
		  res.send('erro leitura arquivo')
		  return;
		}

		// var json_dados = JSON.parse(dados);
		var json_dados = calcUtil.JSON_parseAutoCorrige(dados) 
		json_dados.v.nomeCalc = 'Copia de '+json_dados.v.nomeCalc
		dados = JSON.stringify(json_dados)

		fs.writeFile(nomearq_destino, dados, function (err) {
			if (err){
				// console.log('erro ao ler o arquivo para copia-lo')
				res.send('erro escrita arquivo')
				// console.log(err);
				return;
			}  
		});
	});

	res.send('{success:1}')
});


app.get('/trabalhista-w/ping', async function(req, res) {
	res.send('{ok:2,msg:"novo caminho"}')
})

app.get('/trabalhistasocket/ping', async function(req, res) {
	res.send('{ok:3,msg:"socket"}')
})

app.get('/trabalhista-w/pdf/:id', async function(req, res) {
	var id = req.params.id
	var c = cookie_uncrypt( req.cookies['c_v_app'] )
	if (typeof calc[ id ] === 'undefined' || calc[id] == null ) {
		res.send('acesse o site www.debit.com.br, faça seu login para ver este cálculo');
		return;
	} 

	var id_login = c.v_id_dono 

	var perm = await tem_permissao(id, c) 
	if (!perm) {
		res.send('você não tem permissão para visualizar este cálculo');
		return;
	}

	var urlLogoInfo =  process.env.urlLogoInfo
	var logoInfo = ''
	var logoInfoTemp = ''

	try {
		logoInfoTemp = await axios.get(urlLogoInfo+'/'+id_login)
		logoInfo = logoInfoTemp.data

	} catch	(err) {
		console.error(err)
		console.log('erro ao abrir o logo no axios. id_Calc')
		logoInfo = 'sem_logo'
	}

	var myDoc = new PDFDocument({
		bufferPages: true, 
		autoFirstPage: false,
		logoInfo 
	});

	let buffers = [];
	myDoc.on('data', buffers.push.bind(buffers));
	myDoc.on('end', () => {
		let pdfData = Buffer.concat(buffers);
		res.writeHead(200, {
		'Content-Length': Buffer.byteLength(pdfData),
		'Content-Type': 'application/pdf'})
		.end(pdfData);
	});

	calcPDF.montaCalc( myDoc, calc[ id ].getDump()  )
});

app.get('/trabalhista-w/html/:id', async function(req, res) {
	var id = req.params.id
	var c = cookie_uncrypt( req.cookies['c_v_app'] )
	
	if (typeof calc[ id ] === 'undefined' || calc[id] == null ) {
		res.send('');
		return;
	} 

	var perm = await tem_permissao(id, c) 
	if (!perm) {
		res.send('você não tem permissão para visualizar este cálculo');
		return;
	}

	res.send( calcHTML.montaCalc( calc[ id ].getDump()  ) )
	// res.send('') 
});

app.get('/trabalhista-w/tabCorrecao/:dia_citacao/:dia_atual/:modo_calc',  cors(), function (req, res) {
	var dia_citacao = req.params.dia_citacao
	var dia_atual = req.params.dia_atual 
	var modo_calc = req.params.modo_calc

	var i = calcUtil.dia2dinv(dia_atual)
	var ma_i = calcUtil.dia2intMesAno(dia_atual)
	var ma_citacao = calcUtil.dia2intMesAno(dia_citacao)
	var tabela = [] 
	var res_selic = 0

	var q = `SELECT * FROM selic_perc WHERE  dia<'${i}' and valor <> -100 ORDER BY dia DESC` 
	// console.log('***marcelo --- ',q)
	tabela[ma_i] =  { diah: calcUtil.mesAno2dinv(ma_i), dia: ma_i, ac: 1, indice: "SELIC", p: 1}  
	ma_i-- 

	con.query(q, function(e,r) {
		var p = 1
		var ac = 1

		for (var x = 0; x < r.length && ma_i >= ma_citacao; x++)  {
			tabela[ma_i] = { diah: calcUtil.mesAno2dinv(ma_i), dia: ma_i, ac: 1, indice: "SELIC", p, diaBanco: r[x].dia}  
			ma_i--
			p = r[x].valor

			if (modo_calc == 'composto') {
				ac *= (p/100)+1
			} else {
				res_selic += p 
			}
		}

		if (modo_calc == 'composto') {
			res_selic = (ac-1)*100
		}

		ac = 1  
		var sma_citacao = calcUtil.mesAno2dinv(ma_citacao)

		var q = `SELECT * FROM ipca_e WHERE dia>='19940701' and dia<'${sma_citacao}' and valor <> -100 ORDER BY dia DESC`
		con.query(q, function(e2,r2) {
			var l = r2.length 

			for (var x in r2) {
				var p = r2[x].valor
				var p1 = (p/100)+1
				ac *= p1
				tabela[ma_i]= {diah: calcUtil.mesAno2dinv(ma_i),  dia: ma_i, ac, indice: "IPCA-E", p, diaBanco: r2[x].dia} 
				ma_i-- 	
			}

			res.send({
				juros: res_selic,
				tabela : tabela.filter(n => n)
			})
		});		
	});
})




server.listen(porta_api, () => {
  console.log('Debit Trabalhista Server v.2024 - porta: '+porta_api);
});


const leTabelas = function() {
	con.query(`select * from salario_minimo order by dia `, function(e,r) {
		salario_minimo = [] 

		for (var i in r) {
			var d = String(r[i].dia) 
			var diaInt = calcUtil.yyyymmdd2intMesAno(d)
			var valor = r[i].valor 
			salario_minimo[diaInt] = {valor} 
		}
		// console.log('Tabela de salário mínimo carregada')
	});

	con.query(`select * from poupanca  where valor<>-100 order by dia `, function(e,r) {
		poupanca = [] 

		for (var i in r) {
			var d = String(r[i].dia) 
			var diaInt = calcUtil.yyyymmdd2intMesAno(d)
			var valor = r[i].valor 
			poupanca[diaInt] = {valor} 
			// console.log('poupanca', d, diaInt, valor)
		}
		// console.log('Tabela de poupança carregada')
	});

	con.query(`select * from inss2 order by dia `, function(e,r) {
		tabela_inss = [] 

		for (var i in r) {
			var diaInt = calcUtil.yyyymmdd2intMesAno(String(r[i].dia))
			var de = r[i].de 
			var ate = r[i].ate
			var aliquota = r[i].percentual
			var teto = r[i].teto
			var base = r[i].base

			if (typeof tabela_inss[diaInt] === 'undefined') {
				tabela_inss[diaInt] = [ ]
			}
			tabela_inss[diaInt].push ( {de, ate, aliquota, teto, base} ) 
		}

		// console.log('Tabela do INSS carregada')
	});

	con.query(`select * from irrf order by dia `, function(e,r) {
		tabela_irrf = [] 

		for (var i in r) {
			var diaInt = calcUtil.yyyymmdd2intMesAno(String(r[i].dia))
			var de = r[i].faixa_de 
			var ate = r[i].faixa_ate
			var aliquota = r[i].aliquota
			var dependente = r[i].dependente
			var deducao = r[i].deducao

			if (typeof tabela_irrf[diaInt] === 'undefined') {
				tabela_irrf[diaInt] = [ ]
			}
			tabela_irrf[diaInt].push ( {de, ate, aliquota, dependente, deducao} ) 
		}
		// console.log('Tabela do IRRF carregada')
	});

	con.query(`select * from salario_familia order by dia `, function(e,r) {
		tabela_salfam = [] 

		for (var i in r) {
			var diaInt = calcUtil.yyyymmdd2intMesAno(String(r[i].dia))
			var de = r[i].de 
			var ate = r[i].ate
			var valor = r[i].valor

			if (typeof tabela_salfam[diaInt] === 'undefined') {
				tabela_salfam[diaInt] = [ ]
			}
			tabela_salfam[diaInt].push ( {de, ate, valor} ) 
		}

		// console.log('Tabela do Salário Família carregada')
	});

	con.query(`select * from seguro_desemprego order by dia `, function(e,r) {
		tabela_segdes = [] 

		for (var i in r) {
			var diaInt = calcUtil.yyyymmdd2intMesAno(String(r[i].dia))
			var limite_min = r[i].limite_min 
			var limite_max = r[i].limite_max
			var beneficio_min = r[i].beneficio_min
			var beneficio_max = r[i].beneficio_max

			tabela_segdes[diaInt] =  {limite_min, limite_max, beneficio_min, beneficio_max} 
		}

		// console.log('Tabela do Seguro dsemprego carregada')
	});
}

function formataN(n) {
	var x = Number(n)
	return  (x<10) ? '0'+String(x) : String(x)
}

function  agora() {
	var currentdate = new Date(); 
	return  formataN(currentdate.getDate()) + "/"
					+ (formataN(currentdate.getMonth()+1))  + "/" 
					+ formataN(currentdate.getFullYear()) + " "  
					+ formataN(currentdate.getHours()) + ":"  
					+ formataN(currentdate.getMinutes()) + ":" 
					+ formataN(currentdate.getSeconds());
}


function cookie_uncrypt(cookie_criptografado) {
	if (!cookie_criptografado || typeof cookie_criptografado === 'undefined') {
		return { v_id_dono: 0, v_usuario_logado: 0 };
	}

	const key = process.env.cookie_key  
	const interacoes = process.env.cookie_interacoes  
	const Encryption = require('./Encryption.js')
	const encryption = new Encryption()
	const cookie_descriptografado = encryption.decrypt(cookie_criptografado, key, interacoes)
	// console.log('cookie_descriptografado', cookie_descriptografado)
	let cookie = JSON.parse(cookie_descriptografado)

    if (!cookie || !cookie.v_id_dono || typeof cookie.v_id_dono === 'undefined') { 
        cookie = { v_id_dono: 0, v_usuario_logado: 0 }
    }

	return cookie;
}


setInterval( function() {
	// console.log('analisando se pode limpar a memória')
	leTabelas () 
	var agora = Date.now() 
	for (var i in calc) {
		if (( calc[i] != null ) && (agora - calc[i].ultimaAtividade > (6 * 60 * 60 * 1000))) {
			// console.log(`limpando a memória do calc ${i}`)
			calc[i] = null 
		}
	}
}, 30 * 60000 * 1)

leTabelas () 
