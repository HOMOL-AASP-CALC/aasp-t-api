module.exports = function (id, my1, my2, dono, nomeCalc, assinante, infoUsuario1) {
    var calcUtil = require('./calcUtil.js');
    var axios = require('axios');
    require('dotenv').config() 
    const fs = require('fs')

    var servidorAPI = process.env.servidorAPI 
    var servidorAPI2 = process.env.servidorAPI2 
    var pasta_env = process.env.pasta_calculos

    if (dono) this.id_dono = dono 

    var anexos = {} 
    anexos.base = require('./anexo-base.js');
    anexos.salario = require('./anexo-salario.js');
    anexos.dsr = require('./anexo-dsr.js');
    anexos.verbasRescisorias = require('./anexo-verbas-rescisorias.js');
    anexos.verbasDiversas = require('./anexo-verbas-diversas.js');
    anexos.insalubridade = require('./anexo-insalubridade.js');
    anexos.insalubridadeReflexos = require('./anexo-insalubridade-reflexos.js')
    anexos.insalubridadeDsr = require('./anexo-insalubridade-dsr.js')
    anexos.periculosidade = require('./anexo-periculosidade.js');
    anexos.periculosidadeReflexos = require('./anexo-periculosidade-reflexos.js')
    anexos.periculosidadeDsr = require('./anexo-periculosidade-dsr.js')
    anexos.equiparacaoSalarial = require('./anexo-equiparacao-salarial.js');
    anexos.equiparacaoSalarialReflexos = require('./anexo-equiparacao-salarial-reflexos.js')
    anexos.equiparacaoSalarialDsr = require('./anexo-equiparacao-salarial-dsr.js')
    anexos.diferencasSalariais = require('./anexo-diferencas-salariais.js');
    anexos.diferencasSalariaisReflexos = require('./anexo-diferencas-salariais-reflexos.js')
    anexos.diferencasSalariaisDsr = require('./anexo-diferencas-salariais-dsr.js')
    anexos.salarioFamilia = require('./anexo-salario-familia.js')
    anexos.fgtsPago = require('./anexo-fgts.js')
    anexos.inss = require('./anexo-inss.js')
    anexos.inss13sal = require('./anexo-inss-13sal.js')
    anexos.inssFerias = require('./anexo-inss-ferias.js')
    anexos.conversaoHEHA = require('./anexo-conversao-horas-extras-ha.js')
    anexos.horasExtras = require('./anexo-horas-extras.js')
    anexos.horasExtrasDsr = require('./anexo-horas-extras-dsr.js')
    anexos.horasExtrasReflexos = require('./anexo-horas-extras-reflexos.js')
    anexos.conversaoHESA = require('./anexo-conversao-horas-extras-sa.js')
    anexos.horasExtrasSomenteAdic = require('./anexo-horas-extras-somente-adic.js')
    anexos.horasExtrasSomenteAdicDsr = require('./anexo-horas-extras-somente-adic-dsr.js')
    anexos.horasExtrasSomenteAdicReflexos = require('./anexo-horas-extras-somente-adic-reflexos.js')
    anexos.horasItinereConversao = require('./anexo-conversao-horas-itinere.js')
    anexos.horasItinere = require('./anexo-horas-itinere.js')
    anexos.horasItinereDsr = require('./anexo-horas-itinere-dsr.js')
    anexos.horasItinereReflexos = require('./anexo-horas-itinere-reflexos.js')
    anexos.horasSobreavisoConversao = require('./anexo-conversao-horas-sobreaviso.js')
    anexos.horasSobreaviso = require('./anexo-horas-sobreaviso.js')
    anexos.horasSobreavisoDsr = require('./anexo-horas-sobreaviso-dsr.js')
    anexos.horasSobreavisoReflexos = require('./anexo-horas-sobreaviso-reflexos.js')
    anexos.horasInterConversao = require('./anexo-conversao-horas-inter.js')
    anexos.horasInter = require('./anexo-horas-inter.js')
    anexos.horasInterDsr = require('./anexo-horas-inter-dsr.js')
    anexos.horasInterReflexos = require('./anexo-horas-inter-reflexos.js')
    anexos.horasIntraConversao = require('./anexo-conversao-horas-intra.js')
    anexos.horasIntra = require('./anexo-horas-intra.js')
    anexos.horasIntraDsr = require('./anexo-horas-intra-dsr.js')
    anexos.horasIntraReflexos = require('./anexo-horas-intra-reflexos.js')
    anexos.adicionalNoturno = require('./anexo-adicional-noturno.js')
    anexos.adicionalNoturnoDsr = require('./anexo-adicional-noturno-dsr.js')
    anexos.adicionalNoturnoReflexos = require('./anexo-adicional-noturno-reflexos.js')
    anexos.descontosIndevidos = require('./anexo-descontos-indevidos.js')
    anexos.valeAlimentacao = require('./anexo-vale-alimentacao.js')
    anexos.valeTransporte = require('./anexo-vale-transporte.js')
 
    anexos.verbasCriadas = require('./anexo-verbas-criadas.js')
    anexos.verbasCriadasDsr = require('./anexo-verbas-criadas-dsr.js')
    anexos.verbasCriadasReflexos = require('./anexo-verbas-criadas-reflexos.js')

    require('dotenv').config()  

    this.assinante = assinante 
    // console.log('assinante', assinante)
    // calculo default
    this.v = { 
        nomeCalc: nomeCalc,
        assinante: assinante, 
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
        dsrFeriados: '1110001001012104010507091210021115112512',
        salarioReflex_base1: 'mes',
        salarioReflex_base2: 'nao',
        salarioReflex_base3: 'nao',
        salarioReflex_base4: 'nao',
        salarioReflex_base5: 'nao',
        HEReflex_base1: true, HEReflex_base2: false, HEReflex_base3: false, HEReflex_base4: false, HEReflex_base5: false, HEReflex_base6: false, HEReflex_base7: false, HEReflex_base8: false,
        dataad: '',
        datade: '',
        datadi: '',
        dataes: '',
        percHE1: 50,
        percHE2: 100,
        modoDigitacaoHora: 's',  // s (sexagesimal) ou h (hora) ou d (decimal) 
        horasInterMetodo: 'percentual',
        juros_modo_calc_selic: 'composto'
    } 
    this.a = {} 
    this.comandos = {} 
    this.idCalc = id 
    // this.cookie = infoUsuario1.cookie  
    this.salvarAtivo = true 
    this.calculosEspeciais = {} 
    this.ultimaAtividade = Date.now() 

    var that = this 
    this.conTrab =  my1
    this.conCalculos = my2 
    this.erroFatal = false 

    this.calculosEspeciais.removeVerbas = function ( t ) {
        // console.log('####################################### removerVerbas', t.v.removeVerbas)
        for (var i in t.v.removeVerbas) {
            var vcRemover = t.v.removeVerbas[i]
            t.v[i] = false 
            that.desligaAnexo( vcRemover );
            that.desligaAnexo( vcRemover+'Dsr' );
            that.desligaAnexo( vcRemover+'Reflexos' );
        }
    }

    this.calculosEspeciais.deflacionarVr = function ( t ) {
        var valor = t.v.deflacionarVr
        var anexo = t.v.deflacionarAnexo 
        var coluna = t.v.deflacionarColuna
        var f = calcUtil.dia2intMesAno( t.v.datade ) 
        var ultimoIndice = t.a.base.planilha[ f ].indiceCorrecao

        for (var i in t.a[ anexo ].planilha) {
            var indice = t.a.base.planilha[ i ].indiceCorrecao / ultimoIndice 
            var v1 = Math.round( (valor*100) / indice ) / 100 // arredondar em 2 casas decimais
            // console.log('t.a[ anexo ].planilha[ i ][ coluna ]', anexo, i, coluna)
            t.a[ anexo ].planilha[ i ][ coluna ]  = v1 
        } 
        that.analisarAnexos () 
        that.salvar () 
    }

    this.calculosEspeciais.juros_modo_calc = function ( t ) {
        if (t.v.juros_modo_calc == 'p') {
            var tabPoup = that.pegaTabelaRaiz('poupanca')
            var i = calcUtil.dia2intMesAno( t.v.datadi )
            var f = calcUtil.dia2intMesAno( t.v.dataco )  
            var ia = 1

            for (var x = i; x < f; x++) {
                if (typeof tabPoup[x] ==='undefined') {
                    var p1 = 0
                    console.log('não existe poupança para esta data', x, calcUtil.mesAno2dia(x) )
                } else {
                    var p1 = tabPoup[x].valor
                }
                ia *= (p1 / 100) +1 
            }
            ia = (ia-1)*100
            t.v.resumo_JurosPercentual = ia 
        }
    }

    this.ajustaAssinatura = function ( ass ) {
        // console.log('ajustando assinante: ',ass)
        this.assinante = ass 
        this.v.assinante = ass 
    }

    this.atualizaVerbasCriadas = function ( t ) {
        var id_cliente = this.id_dono 
        // o correto é pegar o ID deste script 
        // http://mat.fastbet.win/trabalhista4/scriptcheck.php 
        var q = `SELECT id, nome, concat('vc',id) as codigo, calculo_especifico, tipo FROM trab_anexos WHERE id_login = ${id_cliente} AND  id_anexo_principal=0 AND lixo=0 `
        // console.log(q)
        that.conTrab.query(q, function(e,r) {
            t.v.verbasCriadas = r 
        })
    }



    this.calculosEspeciais.ic_indexador = function  ( t ) {
        let url1 = `${servidorAPI2}/calculosDiversos/tabelaDireta` 

        let indexador = 0 
        let nome = ''
        // console.log('t.v.ic_indexador', t.v.ic_indexador)
        if (t.v.ic_indexador == 'inpc' ) { indexador = 3855; nome = 'Correção monetária pelo INPC' }
        if (t.v.ic_indexador == 'tr' ) { indexador = 7982; nome = 'Correção monetária pela TR' }
        if (t.v.ic_indexador == 'ipcae' ) { indexador = 3857; nome = 'Correção monetária pelo IPCA-E' }
        if (t.v.ic_indexador == 'ipca' ) { indexador = 3856; nome = 'Correção monetária pelo IPCA' }
        if (t.v.ic_indexador == 'tr_ipcae' ) { indexador = 3858;nome = 'Correção monetária pela TR até 25/03/2015, IPCA-E após 25/03/2015' }
        if (t.v.ic_indexador == 'tr_ipcae_tr' ) { indexador = 3859;nome = 'Correção monetária pela TR  até 25/03/2015, IPCA-E de 26/03/2015 a 10/11/2017, TR após 10/11/2017' }
        if (t.v.ic_indexador == 'semcorrecao' ) { indexador = 3939; nome = 'Sem correção monetária' }

        if (!t.v.dataco) {
            t.v.dataco = calcUtil.diaHoje()
        }

        if (!t.v.dataci) {
            t.v.dataci = t.v.dataco
        }

        // console.log('@@@@ ic_juros ', t.v.ic_juros)
        let strJuros = 'Juros de 1% ao mês' 
        let jurosTab = [ { modo: 12, ate: 0 } ] // 1%
        if (t.v.ic_juros == 'juros05') {
            jurosTab = [ { modo: 6, ate: 0 } ]
            strJuros = 'Juros de 0,5% ao mês'
        }
        if (t.v.ic_juros == 'poupanca') {
            jurosTab = [ { modo: 'P', ate: 0 } ]
            strJuros = 'Juros pela Poupança'
        }
        if (t.v.ic_juros == 'taxalegal') {
            jurosTab = [ { modo: 'L', ate: 0 }  ]
            strJuros = 'Juros pela Taxa Legal'
        }

        if (strJuros != '') {
            nome = nome + "; \n" + strJuros
        }

        if (t.v.selicAposCitacao) {
            nome = nome + "; \nSELIC a partir de " + t.v.dataci+'.'
        }
        nome = nome + ';\n Atualização até ' + t.v.dataco+ '.'

        let dados = {
            dataAtual: t.v.dataco,   //'01/09/2024',
            indexador,
            jurosTab,
            modoSelic: 'princJuros',
            // calc_selic: true,
            calc_selic: t.v.selicAposCitacao,
            selic_inicio: calcUtil.dia2intMesAno( t.v.dataci )            
        }

        t.v.tabelaCorrecaoNome = nome 

        // console.log('****** url1 ', url1, dados)

        axios.post(url1, dados).then( function(r) {
            let tabela = {} 
            // console.table(r.data)
            for (let i in r.data) {
                let item = r.data[i]
                tabela[ item.mesano ] = item
            }
            for (let i in t.a.base.planilha) {
                let ma = t.a.base.planilha[ i ].diaInt 
                t.a.base.planilha[ i ].indiceCorrecao = tabela[ ma ].indiceGerado
                t.a.base.planilha[ i ].selicAcumulada = tabela[ ma ].selicAcumulada
                t.a.base.planilha[ i ].juros = tabela[ ma  ].juros
            }

        }).catch(function (error) {
            console.error(error)
            console.error(nome)
            console.error(t.v.ic_indexador)
            console.error(t)
            console.log('erro axios processos.js - tabelaDireta -  l: 191 - ', url1)
        }); 
    }

    this.calculosEspeciais.tabelaCorrecao = function ( t ) {
        if (t.v.tabelaCorrecao != 1100 ) {
            if (t.v.tabelaCorrecao == 'ultima') {
                var q = 'SELECT * FROM  debit.tabelas_trabalhistas WHERE (nome like "%ipca at%") order by id desc limit 1'
            } else {
                var q = 'SELECT * FROM debit.tabelas_trabalhistas WHERE id='+t.v.tabelaCorrecao
            }
            console.log(q);
            that.conTrab.query(q, function(e,r) {
                t.v.tabelaCorrecaoNome =  r[0].nome 
                t.v.tabelaCorrecao =  r[0].id 

                // limpa tabela de correção
                for (var e in t.a.base.planilha) {
                    t.a.base.planilha[e].indiceCorrecao = 1 
                }

                var a1 = r[0].dados
                var a2 = a1.split('\r\n')
                for (var n in a2) {
                    var a3 = a2[n].split('*')
                    var d1 = '01/'+ a3[0].substring(4, 6) + '/' + a3[0].substring(0, 4)
                    var d2 = calcUtil.dia2intMesAno( d1 )
                    if ( typeof t.a.base.planilha[ d2 ] !== 'undefined' ) {
                        t.a.base.planilha[ d2 ].indiceCorrecao = parseFloat(a3[1])  
                    }
                }
                that.analisarAnexos () 
                that.salvar () 
            })
        } else {
            var dia_citacao = t.v.dataci
            var dia_atual = t.v.dataco
            t.v.tabelaCorrecaoNome = 'IPCA-E e Selic'
            // dia_citacao = dia_citacao.replaceAll('/','-')
            var modo_calc = t.v.juros_modo_calc_selic 
            if (modo_calc != 'simples' && modo_calc != 'composto') modo_calc = 'composto' 

            dia_citacao = dia_citacao.replace(new RegExp('/', 'g'), '-')
            dia_atual = dia_atual.replace(new RegExp('/', 'g'), '-')

            if ( t.v.selicAposCitacao == false ) {
                dia_citacao = dia_atual
            }

            var url1 = `${servidorAPI}/tabCorrecao/${dia_citacao}/${dia_atual}/${modo_calc}`
            console.log(url1)
             
            axios.get(url1).then( function(r) {
                t.v.jurosSelic = r.data.juros
                t.v.resumo_JurosPercentual = r.data.juros 
                t.v.resumo_JurosPercentualSelic = r.data.juros 
                // console.log('+++++ CALCULANDO juros pela SeLIc')
                for (var i in r.data.tabela) {
                    var d =  r.data.tabela[i].dia 
                    var v =  r.data.tabela[i].ac
                    if (typeof t.a.base.planilha[ d ] !== 'undefined') {
                        t.a.base.planilha[ d ].indiceCorrecao = parseFloat( v )
                    }
                }
                that.analisarAnexos () 
                that.salvar () 
            }).catch(function (error) {
                console.log('erro axios processos.js l: 223 - ', url1)
            });             
        } 
    }

    separa = function( s ) {
        var a = s.split(',')
        var percentual = a[0].substring(0, a[0].length-1)
        percentual = parseInt(percentual)

        var diurnas  = calcUtil.formataHora(a[1])
        var noturnas  = calcUtil.formataHora(a[2])

        return { percentual, diurnas, noturnas }
    }

    this.calculosEspeciais.importarCartaoHE = function( t ) {
        // if (typeof that.cookie === 'undefined' ) {
        //     return;
        // }
        
        var id = t.v.importarCartaoHE 
        if (!id) return;
        var i_iniCalc =  calcUtil.yyyymmdd2intMesAno( calcUtil.dia2yyyymmdd(t.v.iniCalc) )
        var i_fimCalc =  calcUtil.yyyymmdd2intMesAno( calcUtil.dia2yyyymmdd(t.v.fimCalc) )

        that.conCalculos.query(`SELECT calc_trab from cartaoPonto where id=${id}`, function(e,r) {
            if (!r || e) {
                console.log(`não conseguiu importar o cartão de ponto ${id}`)
                return 
            } 

            let resumo = r[0].calc_trab
            if (resumo != null && resumo.length <=  0 ){
                console.log(`não conseguiu importar o cartão de ponto ${id}`)
                return 
            } 

            if (resumo[0] == "{") {   
                console.log('importacao versao nova **')
                let dados = JSON.parse(resumo)

                var percs = [] 

                for (let i in dados ) {
                    for (let k in dados[i].he) {
                        if (percs.indexOf( k ) <0) { percs.push(k) }
                    }
                }

                if (typeof percs[0] != 'undefined') t.v.percHE1 = percs[0]
                if (typeof percs[1] != 'undefined') t.v.percHE2 = percs[1]
                if (typeof percs[2] != 'undefined') t.v.percHE3 = percs[2]
                if (typeof percs[3] != 'undefined') t.v.percHE4 = percs[3]

                for (let i in dados ) {
                    for (let k in dados[i].he) {
                        if (k == t.v.percHE1) {  
                            if (typeof t.a.conversaoHEHA !== 'undefined') {
                                t.a.conversaoHEHA.set(i, 'he1', calcUtil.int2Hora(dados[i].he[k].d), 'nao_repetir')
                                t.a.conversaoHEHA.set(i, 'hen1',calcUtil.int2Hora(dados[i].he[k].n), 'nao_repetir')
                            }
                            if (typeof t.a.conversaoHESA !== 'undefined') {
                                t.a.conversaoHESA.set(i, 'he1', calcUtil.int2Hora(dados[i].he[k].d), 'nao_repetir')
                                t.a.conversaoHESA.set(i, 'hen1',calcUtil.int2Hora(dados[i].he[k].n), 'nao_repetir')
                            }
                        }

                        if (k == t.v.percHE2) {  
                            if (typeof t.a.conversaoHEHA !== 'undefined') {
                                t.a.conversaoHEHA.set(i, 'he2', calcUtil.int2Hora(dados[i].he[k].d), 'nao_repetir')
                                t.a.conversaoHEHA.set(i, 'hen2',calcUtil.int2Hora(dados[i].he[k].n), 'nao_repetir')
                            }
                            if (typeof t.a.conversaoHESA !== 'undefined') {
                                t.a.conversaoHESA.set(i, 'he2', calcUtil.int2Hora(dados[i].he[k].d), 'nao_repetir')
                                t.a.conversaoHESA.set(i, 'hen2',calcUtil.int2Hora(dados[i].he[k].n), 'nao_repetir')
                            }
                        }

                        if (k == t.v.percHE3) {  
                            if (typeof t.a.conversaoHEHA !== 'undefined') {
                                t.a.conversaoHEHA.set(i, 'he3', calcUtil.int2Hora(dados[i].he[k].d), 'nao_repetir')
                                t.a.conversaoHEHA.set(i, 'hen3',calcUtil.int2Hora(dados[i].he[k].n), 'nao_repetir')
                            }
                            if (typeof t.a.conversaoHESA !== 'undefined') {
                                t.a.conversaoHESA.set(i, 'he3', calcUtil.int2Hora(dados[i].he[k].d), 'nao_repetir')
                                t.a.conversaoHESA.set(i, 'hen3',calcUtil.int2Hora(dados[i].he[k].n), 'nao_repetir')
                            }
                        }

                        if (k == t.v.percHE4) {  
                            if (typeof t.a.conversaoHEHA !== 'undefined') {
                                t.a.conversaoHEHA.set(i, 'he4', calcUtil.int2Hora(dados[i].he[k].d), 'nao_repetir')
                                t.a.conversaoHEHA.set(i, 'hen4',calcUtil.int2Hora(dados[i].he[k].n), 'nao_repetir')
                            }
                            if (typeof t.a.conversaoHESA !== 'undefined') {
                                t.a.conversaoHESA.set(i, 'he4', calcUtil.int2Hora(dados[i].he[k].d), 'nao_repetir')
                                t.a.conversaoHESA.set(i, 'hen4',calcUtil.int2Hora(dados[i].he[k].n), 'nao_repetir')
                            }
                        }
                    }
                }

                t.salvar() 

            } else {   
                console.log('importacao versao velha')  
                var dados = resumo.split('\n')  
                // console.log(dados)
                var percs = [] 

                for ( var i in dados ) {
                    linha = dados[i].split(';')

                    var dia = calcUtil.yyyymmdd2intMesAno( linha[0]+'01' )
                    for (var k = 2; k < linha.length; k++) {
                        if (linha[k] != '0' && linha[k] != '' ) {
                            var d = separa( linha[k] ) 
                            if (percs.indexOf(d.percentual) <0) { percs.push(d.percentual) }
                        }
                    }
                }

                if (typeof percs[0] != 'undefined') t.v.percHE1 = percs[0]
                if (typeof percs[1] != 'undefined') t.v.percHE2 = percs[1]
                if (typeof percs[2] != 'undefined') t.v.percHE3 = percs[2]
                if (typeof percs[3] != 'undefined') t.v.percHE4 = percs[3]

                for ( var i in dados ) {
                    linha = dados[i].split(';')
                    var dia = calcUtil.yyyymmdd2intMesAno( linha[0]+'01' )

                    if (dia >= i_iniCalc && dia <= i_fimCalc) {
                        for (var k = 2; k < linha.length; k++) {
                            var d = { diurnas: '00:00', noturnas : '00:00' }
                            // console.log("linha-k ", linha[k] )
                            if (linha[k] != '0' && linha[k] != '' ) {
                                d = separa( linha[k] )
                                // console.log('t.a.conversaoHESA', t.a.conversaoHESA) 
                                if (d.percentual == t.v.percHE1) { 
                                    if (typeof t.a.conversaoHEHA !== 'undefined') {
                                        t.a.conversaoHEHA.set(dia, 'he1', d.diurnas, 'nao_repetir')
                                        t.a.conversaoHEHA.set(dia, 'hen1', d.noturnas, 'nao_repetir')
                                    }
                                    if (typeof t.a.conversaoHESA !== 'undefined') {
                                        t.a.conversaoHESA.set(dia, 'he1', d.diurnas, 'nao_repetir')
                                        t.a.conversaoHESA.set(dia, 'hen1', d.noturnas, 'nao_repetir')
                                    }
                                }
                                if (d.percentual == t.v.percHE2) { 
                                    if (typeof t.a.conversaoHEHA !== 'undefined') {
                                        t.a.conversaoHEHA.set(dia, 'he2', d.diurnas, 'nao_repetir')
                                        t.a.conversaoHEHA.set(dia, 'hen2', d.noturnas, 'nao_repetir')
                                    }
                                    if (typeof t.a.conversaoHESA !== 'undefined') {
                                        t.a.conversaoHESA.set(dia, 'he2', d.diurnas, 'nao_repetir')
                                        t.a.conversaoHESA.set(dia, 'hen2', d.noturnas, 'nao_repetir')
                                    }
                                }
                                if (d.percentual == t.v.percHE3) { 
                                    if (typeof t.a.conversaoHEHA !== 'undefined') {
                                        t.a.conversaoHEHA.set(dia, 'he3', d.diurnas, 'nao_repetir')
                                        t.a.conversaoHEHA.set(dia, 'hen3', d.noturnas, 'nao_repetir')
                                    }
                                    if (typeof t.a.conversaoHESA !== 'undefined') {
                                        t.a.conversaoHESA.set(dia, 'he3', d.diurnas, 'nao_repetir')
                                        t.a.conversaoHESA.set(dia, 'hen3', d.noturnas, 'nao_repetir')
                                    }
                                }
                                if (d.percentual == t.v.percHE4) { 
                                    if (typeof t.a.conversaoHEHA !== 'undefined') {
                                        t.a.conversaoHEHA.set(dia, 'he4', d.diurnas, 'nao_repetir')
                                        t.a.conversaoHEHA.set(dia, 'hen4', d.noturnas, 'nao_repetir')
                                    }
                                    if (typeof t.a.conversaoHESA !== 'undefined') {
                                        t.a.conversaoHESA.set(dia, 'he4', d.diurnas, 'nao_repetir')
                                        t.a.conversaoHESA.set(dia, 'hen4', d.noturnas, 'nao_repetir')
                                    }
                                }
                            }
                        }
                    }
                }
                t.salvar() 
            }
        })
    }

    this.calculosEspeciais.importarCartaoAdicNoturno = function( t ) {
        let id = t.v.importarCartaoAdicNoturno  
        if (!id) return; 

        that.conCalculos.query(`SELECT calc_trab from cartaoPonto where id=${id}`, function(e,r) {
       
            if (!r || e) {
                console.log(`não conseguiu importar o cartão de ponto ${id}`)
                return 
            } 

            let resumo = r[0].calc_trab

            if (resumo.length <=  0 ){
                console.log(`não conseguiu importar o cartão de ponto ${id}`)
                return 
            } 

            if (resumo[0] == "{") {
                // importa versão nova
                console.log('importacao versao nova')
                let dados = JSON.parse(resumo)
                for (let i in dados) {
                    console.log(i, dados[i].hn)
                    t.a.adicionalNoturno.set(i, 'horasNoturnasNormais', calcUtil.int2Hora( dados[i].hn ), 'nao_repetir')
                }
                t.salvar() 
            } else {
                console.log('importacao versao velha')
                let dados = r[0].calc_trab.split('\n')  

                for (let i in dados ) {
                    linha = dados[i].split(';')
                    let dia = calcUtil.yyyymmdd2intMesAno( linha[0]+'01' )

                    let k = 1
                    let d = { diurnas: '00:00', noturnas : '00:00' }
                    if (linha[k] != '0' && linha[k] != '' ) {
                        d = linha[k]

                        t.a.adicionalNoturno.set(dia, 'horasNoturnasNormais', d, 'nao_repetir')
                    }
                }
                t.salvar() 
            }
        })
    }
    this.calculosEspeciais.primeiroFomulario = function( t ) {
        var ampliar =  (t.v.modo_avisoprevio == '1') 
        var inicio =  t.v.dataad
        var fim = t.v.datade 

        // estabilidade 
        if (t.v.dataes) fim = t.v.dataes 


        // verifica prescricao
        var prescricaoMenosCinco = t.v.datadi
        var intDataAd = parseInt( calcUtil.dia2yyyymmdd( t.v.dataad ) )
        for (var x = 0; x < 5; x++) prescricaoMenosCinco = calcUtil.diminuiAno(prescricaoMenosCinco)

        var intprescricaoMenosCinco = parseInt( calcUtil.dia2yyyymmdd( prescricaoMenosCinco ) )

        if ((t.v.modo_prescricao != '0') && (intDataAd < intprescricaoMenosCinco)) {
            inicio = prescricaoMenosCinco
        }
 


        for (var i in t.a) {
            var inicio2 = inicio
            fim = (t.v.dataes) ? t.v.dataes : t.v.datade 
            if ((t.v.modo_prescricao == '1') && (i == 'base' || i == 'salario')) {
                inicio2 = t.v.dataad 
            }

            // console.log('## setup ',i)
            if (i == 'base') {
                var esteMes = calcUtil.strPrimeiroDia( calcUtil.diaHoje() )
                var i_esteMes = calcUtil.dia2yyyymmddInt(esteMes)
                var i_fim = calcUtil.dia2yyyymmddInt(fim)
                if (i_fim < i_esteMes) fim = esteMes;

                // console.log('+++++++++++ setup base', inicio2, fim, t.v.datade)
                t.a[i].setup(inicio2, fim, t.v.datade)
            } else {
                // console.log(">>> ",i)
                // t.a[i].setup(inicio2, fim, ampliar, { posicao: p1, inicio: t.v.iniCalc, fim: t.v.fimCalc, ampliar: (t.v.modo_avisoprevio == '1'), diaDemissao: t.v.datade, salario: t.v.salario, ferias: t.v.ferias, avisoPrevio: t.v.avisoPrevio,  multasRescisorias: t.v.multasRescisorias, saldoSalarial: t.v.saldoSalarial   })
                t.a[i].setup(inicio2, fim, ampliar, { posicao: 0, inicio: t.v.iniCalc, fim: t.v.fimCalc, ampliar: (t.v.modo_avisoprevio == '1'), diaDemissao: t.v.datade, salario: t.v.salario, ferias: t.v.ferias, avisoPrevio: t.v.avisoPrevio,  multasRescisorias: t.v.multasRescisorias, saldoSalarial: t.v.saldoSalarial   })
            } 
        }  
        t.comandos['proximaPagina'] = 1      
        
        t.v.iniCalc = inicio 
        t.v.iniCalcSalario = inicio 
        t.v.fimCalc = fim 
        if (t.v.modo_prescricao == '0') { // ignorar prescrição 
            t.v.iniCalcSalario = t.v.dataad
            t.v.iniCalc = t.v.dataad
        }
        if (t.v.modo_prescricao == '1') {
            t.v.iniCalcSalario = t.v.dataad // presc
        }
    }

    this.calculosEspeciais.nomeCalc = function( t ) {
        t.v.nomeCalc = t.v.nomeCalc.replace('"', '')
        let q = `UPDATE debit.lista_calculo SET nome="${t.v.nomeCalc}" WHERE id=${that.idCalc}`
        // console.log(q)
        that.conTrab.query(q) 
    }

    this.calculosEspeciais.modoDigitacaoHora = function (t, oldValue) {
        var newValue = t.v.modoDigitacaoHora 

        if (newValue != oldValue) {
            if (t.v.horasExtras) {
                t.a.conversaoHEHA.converteBaseNumerica( newValue ) 
            }
            if (t.v.horasExtrasSomenteAdic) {
                t.a.conversaoHESA.converteBaseNumerica( newValue ) 
            }
            if (t.v.horasInItinere) {
                t.a.horasItinereConversao.converteBaseNumerica( newValue ) 
            }
            if (t.v.horasSobreaviso) {
                t.a.horasSobreavisoConversao.converteBaseNumerica( newValue ) 
            }
            if (t.v.intervaloInterjornada) {
                t.a.horasInterConversao.converteBaseNumerica( newValue ) 
            }
            if (t.v.intervaloIntrajornada) {
                t.a.horasIntraConversao.converteBaseNumerica( newValue ) 
            }
            if (t.v.adicionalNoturno) {
                t.a.adicionalNoturno.converteBaseNumerica( newValue ) 
            }
        }
    }

    this.ligaAnexo = function(nome, p1) {
        var that = this 
        if (!this.a[nome]) {
            var i1 = this.v.iniCalc
            var f1 = this.v.fimCalc  

            if((!i1) || (!f1)) {
                console.log('#### erro linha 458 processos.js - não deveria ter essa info vazia - i1, f1: ',i1, f1)
                this.erroFatal = true 
                return;
            }

            if (nome == 'salario' || nome == 'base') i1 = this.v.iniCalcSalario
            if (nome == 'base') {
                // f1 = calcUtil.strPrimeiroDia( calcUtil.diaHoje() )
                var esteMes = calcUtil.strPrimeiroDia( calcUtil.diaHoje() )
                var i_esteMes = calcUtil.dia2yyyymmddInt(esteMes)
                var i_f1 = calcUtil.dia2yyyymmddInt(f1)
                if (i_f1 < i_esteMes) f1 = esteMes;
            }

            this.a[nome] = new anexos[nome] ({ posicao: p1, inicio: i1, fim: f1, ampliar: (this.v.modo_avisoprevio == '1'), diaDemissao: this.v.datade, sal13: this.v.salario, ferias: this.v.ferias, avisoPrevio: this.v.avisoPrevio, multasRescisorias: this.v.multasRescisorias, saldoSalarial: this.v.saldoSalarial   }) 
            this.a[nome].getValorPlanilha = function(nome, dia, coluna) {
                if (typeof that.a[nome].planilha[dia] === 'undefined') {
                    console.log("++++++ Erro processos.js-l-421: idCalc, nome, dia, coluna ",+that.idCalc, nome, dia, coluna )
                    return 0;
                }

                return that.a[nome].planilha[dia][coluna]
            }
            this.a[nome].getMediaPlanilha = function(nome, coluna, inicio, fim, proporcao) {
                return that.getMediaPlanilha(nome, coluna, inicio, fim, proporcao)
            }
            this.a[nome].getVariavel = function(nome) {
                return that.v[ nome ]
            }
            this.a[nome].setVariavel = function(nome, valor) {
                that.v[ nome ] = valor 
            }
            this.a[nome].pegaTabela = function(nome) {
                return that.pegaTabelaRaiz( nome )
            }
            // funções exclusicas para os anexos INSS
            if (nome == 'inss' || nome == 'inss13sal' || nome == 'inssFerias') {
                this.a[nome].getINSS = function(dia, tipo) {
                    var r = 0
                    for (var i in that.a) {
                        if (i != 'inss' && i != 'inss13sal' && i != 'inssFerias') {
                            r += Number( that.a[i].resINSS(dia, tipo)  ) 
                        }
                    }
                    return r 
                }
            }
        } else {
            this.a[nome].info.posicao = p1;
        }
        this.a[nome].info.visivel = 1;
    }

    this.ligaAnexoVerbasCriadas = function(nome,nomeRelatorio, tipo,  p1) {
        var that = this 
        var nomeGrupo = nome
        if (tipo != 'normal') nome = nome+tipo 

        if (!this.a[nome]) {
            var i1 = this.v.iniCalc
            var f1 = this.v.fimCalc  
            var d1 = { 
                posicao: p1, inicio: i1, fim: f1,
                ampliar: (this.v.modo_avisoprevio == '1'),
                titulo: nomeRelatorio,
                prefixo: nome, 
                grupo: nomeGrupo 
            } 

            if (tipo == 'normal') {this.a[nome] = new anexos.verbasCriadas (d1) }
            if (tipo == 'Dsr') { this.a[nome] = new anexos.verbasCriadasDsr (d1) }
            if (tipo == 'Reflexos') { this.a[nome] = new anexos.verbasCriadasReflexos (d1) }

            this.a[nome].getValorPlanilha = function(nome, dia, coluna) {
                if (typeof that.a[nome].planilha[dia] === 'undefined') {
                    console.log("++++++ Erro processos.js-l-479: idCalc, nome, dia, coluna ",+that.idCalc, nome, dia, coluna )
                    return 0;
                }

                return that.a[nome].planilha[dia][coluna]
            }
            this.a[nome].getMediaPlanilha = function(nome, coluna, inicio, fim, proporcao) {
                return that.getMediaPlanilha(nome, coluna, inicio, fim, proporcao)
            }
            this.a[nome].getVariavel = function(nome) {
                return that.v[ nome ]
            }
            this.a[nome].setVariavel = function(nome, valor) {
                that.v[ nome ] = valor 
            }
            this.a[nome].pegaTabela = function(nome) {
                return that.pegaTabelaRaiz( nome )
            }

        } else {
            this.a[nome].info.posicao = p1;
        }
    }

    this.getMediaPlanilha = function (nome, coluna, inicio, fim, proporcao) {
        var diaIni = calcUtil.dia2intDia(inicio)
        var diaFim = calcUtil.dia2intDia(fim)
        var iini = calcUtil.dia2intMesAno(inicio)
        var ifim = calcUtil.dia2intMesAno(fim)
        var itens = [] 

        var propIni = ((calcUtil.diasMes(inicio) - diaIni) + 1) / calcUtil.diasMes(inicio)
        var propFim = diaFim / calcUtil.diasMes(fim)

        if (inicio == this.v.dataad) propIni = 1 
        if (fim == this.v.datade) propFim = 1 

        var soma = 0
        var n_itens  = 0

        for (var i = iini; i <= ifim; i++) {
            var v =0
            if ( typeof this.a[nome].planilha[ i ] !== 'undefined' ) {
                v = this.a[nome].planilha[i][coluna] 
            }

            if (proporcao) {
                if (i == iini) { v *= propIni }
                if (i == ifim) { v *= propFim }
            } 

            soma += v 

            var valorArredondado = Math.floor( v*100 ) / 100
            itens.push( {dia: i, valor: valorArredondado} )
            n_itens++;
        }
        var media  = soma / n_itens 

        return { soma, itens, n_itens, media };
    }

    this.desligaAnexo = function(nome) {
        // console.log('desligaAnexo', nome)
        if (this.a[nome]) {
            this.a[nome].info.visivel = 0;
        }
    }

    this.analisarAnexos = function () {
        // console.log('##############    analisarAnexos')
        this.ligaAnexo('base', 5);
        this.ligaAnexo('salario', 6); 
        if (this.v.salario || this.v.ferias || this.v.avisoPrevio || this.v.multasRescisorias || this.v.saldoSalarial) { 
            this.ligaAnexo('verbasRescisorias', 10); 
        } else { 
            this.desligaAnexo('verbasRescisorias');  
        } 

        if (this.v.dsr) { 
            this.ligaAnexo('dsr', 15);
        } else { 
            this.desligaAnexo('dsr');
        }

        if (this.v.equiparacaoSalarial) { 
            this.ligaAnexo('equiparacaoSalarial', 20);
            this.ligaAnexo('equiparacaoSalarialDsr', 21);
            this.ligaAnexo('equiparacaoSalarialReflexos', 22);
        } else { 
            this.desligaAnexo('equiparacaoSalarial');  
            this.desligaAnexo('equiparacaoSalarialDsr');
            this.desligaAnexo('equiparacaoSalarialReflexos');
        } 

        if (this.v.diferencasSalariais) { 
            this.ligaAnexo('diferencasSalariais', 30);
            this.ligaAnexo('diferencasSalariaisDsr', 31);
            this.ligaAnexo('diferencasSalariaisReflexos', 32);
        } else { 
            this.desligaAnexo('diferencasSalariais');  
            this.desligaAnexo('diferencasSalariaisDsr');
            this.desligaAnexo('diferencasSalariaisReflexos');
        } 
        
        if (this.v.insalubridade) { 
            this.ligaAnexo('insalubridade', 40);
            this.ligaAnexo('insalubridadeDsr', 41);
            this.ligaAnexo('insalubridadeReflexos', 42);
        } else { 
            this.desligaAnexo('insalubridade');  
            this.desligaAnexo('insalubridadeDsr');
            this.desligaAnexo('insalubridadeReflexos');
        } 

        if (this.v.periculosidade) { 
            this.ligaAnexo('periculosidade', 50);
            this.ligaAnexo('periculosidadeDsr', 51);
            this.ligaAnexo('periculosidadeReflexos', 52);
        } else { 
            this.desligaAnexo('periculosidade');  
            this.desligaAnexo('periculosidadeDsr');
            this.desligaAnexo('periculosidadeReflexos');
        } 
        
        if (this.v.horasExtras) { 
            this.ligaAnexo('conversaoHEHA', 60);
            this.ligaAnexo('horasExtras', 61);
            this.ligaAnexo('horasExtrasDsr', 62);
            this.ligaAnexo('horasExtrasReflexos', 63);
        } else { 
            this.desligaAnexo('conversaoHEHA');  
            this.desligaAnexo('horasExtras');
            this.desligaAnexo('horasExtrasDsr');
            this.desligaAnexo('horasExtrasReflexos');
        } 

        if (this.v.horasExtrasSomenteAdic) { 
            this.ligaAnexo('conversaoHESA', 70);
            this.ligaAnexo('horasExtrasSomenteAdic', 71);
            this.ligaAnexo('horasExtrasSomenteAdicDsr', 72);
            this.ligaAnexo('horasExtrasSomenteAdicReflexos', 73);
        } else { 
            this.desligaAnexo('conversaoHESA');  
            this.desligaAnexo('horasExtrasSomenteAdic');
            this.desligaAnexo('horasExtrasSomenteAdicDsr');
            this.desligaAnexo('horasExtrasSomenteAdicReflexos');
        } 
        
        if (this.v.adicionalNoturno) { 
            this.ligaAnexo('adicionalNoturno', 80);
            this.ligaAnexo('adicionalNoturnoDsr', 81);
            this.ligaAnexo('adicionalNoturnoReflexos', 82);
        } else {  
            this.desligaAnexo('adicionalNoturno');
            this.desligaAnexo('adicionalNoturnoDsr');
            this.desligaAnexo('adicionalNoturnoReflexos');
        } 

        if (this.v.horasInItinere) { 
            this.ligaAnexo('horasItinereConversao', 90);
            this.ligaAnexo('horasItinere', 91);
            this.ligaAnexo('horasItinereDsr', 92);
            this.ligaAnexo('horasItinereReflexos', 93);
        } else { 
            this.desligaAnexo('horasItinereConversao');  
            this.desligaAnexo('horasItinere');
            this.desligaAnexo('horasItinereDsr');
            this.desligaAnexo('horasItinereReflexos');
        } 

        if (this.v.horasSobreaviso) { 
            this.ligaAnexo('horasSobreavisoConversao', 100);
            this.ligaAnexo('horasSobreaviso', 101);
            this.ligaAnexo('horasSobreavisoDsr', 102);
            this.ligaAnexo('horasSobreavisoReflexos', 103);
        } else { 
            this.desligaAnexo('horasSobreavisoConversao');  
            this.desligaAnexo('horasSobreaviso');
            this.desligaAnexo('horasSobreavisoDsr');
            this.desligaAnexo('horasSobreavisoReflexos');
        } 

        if (this.v.intervaloInterjornada) { 
            this.ligaAnexo('horasInterConversao', 110);
            this.ligaAnexo('horasInter', 111);
            this.ligaAnexo('horasInterDsr', 112);
            this.ligaAnexo('horasInterReflexos', 113);
        } else { 
            this.desligaAnexo('horasInterConversao');  
            this.desligaAnexo('horasInter');
            this.desligaAnexo('horasInterDsr');
            this.desligaAnexo('horasInterReflexos');
        } 

        if (this.v.intervaloIntrajornada) { 
            this.ligaAnexo('horasIntraConversao', 120);
            this.ligaAnexo('horasIntra', 121);
            this.ligaAnexo('horasIntraDsr', 122);
            this.ligaAnexo('horasIntraReflexos', 123);
        } else { 
            this.desligaAnexo('horasIntraConversao');  
            this.desligaAnexo('horasIntra');
            this.desligaAnexo('horasIntraDsr');
            this.desligaAnexo('horasIntraReflexos');
        } 
        
        if (this.v.descontosIndevidos) { 
            this.ligaAnexo('descontosIndevidos', 130);
        } else { 
            this.desligaAnexo('descontosIndevidos');
        }

        if (this.v.valeAlimentacao) { 
            this.ligaAnexo('valeAlimentacao', 140);
        } else { 
            this.desligaAnexo('valeAlimentacao');
        }

        if (this.v.valeTransporte) { 
            this.ligaAnexo('valeTransporte', 150);
        } else { 
            this.desligaAnexo('valeTransporte');
        }

        if (this.v.salarioFamilia) { 
            this.ligaAnexo('salarioFamilia', 160);
        } else { 
            this.desligaAnexo('salarioFamilia');
        }
        
        if (this.v.verbasDiversas) { 
            this.ligaAnexo('verbasDiversas', 170);
        } else { 
            this.desligaAnexo('verbasDiversas');
        }

        // Verbas Criadas
        var vc =  this.v.verbasCriadas
        // console.log('--- vc ', vc)
        for (var i in vc) {
            var cod =  'vc'+vc[i].id 
            // console.log('this.v[ cod ] ', i, vc[i].tipo  )
            if ( this.v[ cod ] ) {
                this.ligaAnexoVerbasCriadas(cod , vc[i].nome, 'normal',  200);
                if (vc[i].tipo != '1') {
                    this.ligaAnexoVerbasCriadas(cod , vc[i].nome, 'Dsr',  201);
                    this.ligaAnexoVerbasCriadas(cod , vc[i].nome, 'Reflexos',  202);
                }

            } else {
                this.desligaAnexo( cod );
                if (vc[i].tipo != '1') {
                    this.desligaAnexo( cod+'Dsr' );
                    this.desligaAnexo( cod+'Reflexos' );
                }
            }
        } 

        // FGTS 
        if (this.v.fgtsPago) { 
            this.ligaAnexo('fgtsPago', 300);
        } else { 
            this.desligaAnexo('fgtsPago');
        }

        // INSS
        this.ligaAnexo('inss', 1000); 
        this.ligaAnexo('inss13sal', 1001); 
        this.ligaAnexo('inssFerias', 1002); 
        
        if (this.erroFatal) {
            console.log("$$$$$$$$$$ ERRO FATAL ", this.idCalc)
            return;
        }

        var aa = [] 
        for (var i in this.a) {
            aa.push({nome: i, posicao: this.a[i].info.posicao}) 
        }

        aa.sort((a,b) => (a.posicao  > b.posicao ) ? 1 : ((b.posicao  > a.posicao ) ? -1 : 0))

        for (var i in  aa) {
            n1 = aa[i].nome 
            // console.log('rodando calc() de ', n1)
            this.a[ n1 ].calc() 
        }

        this.calcResumo () 
        this.ultimaAtividade = Date.now() 
    }

    this.set = function(nome, valor) {
        // console.log('set - '+nome, valor)
        var i = nome.indexOf('-')
        if ( i > 0 ) {
            var coluna = nome.substring(i+1)
            var nome = nome.substring(0, i)

            var i = coluna.indexOf('-')
            var dia = coluna.substring(0, i)
            coluna = coluna.substring(i+1)
            this.a[nome].set(dia, coluna, valor)
        } else {
            var valorAnterior = this.v[nome]
            this.v[nome] = valor
            if (typeof this.calculosEspeciais[nome] !== 'undefined') {
                this.calculosEspeciais[nome] (this, valorAnterior) 
            }
        }
    }


    this.setReflexo = function(dados) {
        // console.log(dados)
        this.a[dados.nome].setReflexo(dados)
        this.a[dados.nome].info.virgem = false 
         
        this.analisarAnexos () 
        this.salvar () 
    }

    this.setVerbasDiversas = function(dados) {
        // console.log('processos - setVerbasDiversas', dados)
        this.a[dados.nome].setVerbasDiversas(dados)
        this.a[dados.nome].info.virgem = false 
         
        this.analisarAnexos () 
        this.salvar () 
    }

    this.deleteReflexo = function(anexo, linha) {
        console.log('processos - deleteReflexo: ', anexo, linha)
        this.a[anexo].deleteReflexo(linha)
         
        this.analisarAnexos () 
        this.salvar () 
    }

 
    this.salvar = function () {
        if (! this.salvarAtivo ) return;
        var dados = JSON.stringify(this.getDump(true) )
        var idCalc = this.idCalc 
        var n = parseInt(idCalc / 1500)
        var pasta = pasta_env + '/' + n 
        var nomearq = pasta + '/'+ idCalc + '.t5'

        // verifica se a pasta existe 
        if (!fs.existsSync(pasta)) {
            fs.mkdirSync(pasta);
        }

        // console.log('salvando: ', nomearq)

        fs.writeFile(nomearq, dados, function (err) {
            if (err) return console.log(err);
        });
    }

    this.setDump = function(x) {
        var that = this 
        this.v = x.v
        for (var i in x.a) {
            if (i.substring(0,2) == "vc") {
                var vcDsr = i.indexOf('Dsr') 
                var vcReflexos = i.indexOf('Reflexos')
                // console.log("##### 783 ---> ", i, vcDsr, vcReflexos)
                if (vcDsr < 0 && vcReflexos <0) {
                    this.a[i] = new anexos.verbasCriadas (x.a[i])
                }
                if (vcDsr >0) {
                    this.a[i] = new anexos.verbasCriadasDsr (x.a[i])
                }
                if (vcReflexos >0) {
                    this.a[i] = new anexos.verbasCriadasReflexos (x.a[i])
                }
                
            } else {
                this.a[i] = new anexos[i] (x.a[i])
                if (i == 'verbasRescisorias' && this.idCalc < 22565864) {
                    // console.log('\n\n ativando correcao ' )
                    this.a[i].setAtivarCorrecao( true )
                }
            }
            
            this.a[i].getValorPlanilha = function(nome, dia, coluna) {
                // console.log(nome, dia, coluna)
                //  that.a[nome].planilha[dia])
                if (typeof that.a[nome].planilha[dia] === 'undefined') {
                    console.log("++++++ Erro processos.js-l-860: idCalc, nome, dia, coluna ",+that.idCalc, nome, dia, coluna )
                    return 0;
                }

                return that.a[nome].planilha[dia][coluna] 
            }
            this.a[i].getMediaPlanilha = function(nome, coluna, inicio, fim, proporcao) {
                return that.getMediaPlanilha(nome, coluna, inicio, fim, proporcao)
            }
            this.a[i].getVariavel = function(nome) {
                return that.v[ nome ]
            }
            this.a[i].setVariavel = function(nome, valor) {
                that.v[ nome ] = valor 
            }
            this.a[i].pegaTabela = function(nome) {
                return that.pegaTabelaRaiz( nome )
            }
            // funções exclusicas para os anexos INSS
            if (i == 'inss' || i == 'inss13sal' || i == 'inssFerias') {
                this.a[i].getINSS = function(dia, tipo) {
                    var r = 0
                    for (var w  in that.a) {
                        if (w != 'inss' && w != 'inss13sal' && w != 'inssFerias') {
                            r += Number( that.a[w].resINSS(dia, tipo) )
                        }
                    }
                    return r 
                }
            }
        }
        
        return;
    }

    this.calcIr = function (dia, base, num_meses) {
        var tab = this.pegaTabelaRaiz('tabela_irrf')
        // console.table(tab)
        var udia = tab.length-1
        // console.log('calcIr - ', dia, udia )
        if (dia > udia) dia = udia

        var resp = 0

        while (typeof tab[dia] === 'undefined' && dia > 0) {
            dia-- 
        }

        for (var i in tab[dia]) {
            if (tab[dia][i].ate == 0) tab[dia][i].ate = 100000000;

            if ( base >= ( tab[dia][i].de * num_meses ) && ( base <= (tab[dia][i].ate * num_meses) ) ) resp = i
        }

        // console.log(dia, resp)
        // console.log(tab[dia])

        return {
            perc: tab[ dia ][ resp ].aliquota,
            deducao: tab[ dia ][ resp ].deducao
        }
    }


    this.calcSeguroDesemprego = function (  ) {
        var res = 0
        var valor = 0
        var tab = this.pegaTabelaRaiz('tabela_segdes')
        var tab_sm = this.pegaTabelaRaiz('salario_minimo')

        // var diaUltimaTabela = this.v.mesanoCorrecaoMonetaria 
        var diaUltimaTabela =  calcUtil.dia2intMesAno( this.v.datade )
        while (typeof tab[diaUltimaTabela] === 'undefined') {
            diaUltimaTabela-- 
        }


        var t = tab[diaUltimaTabela]
        t.salmin = tab_sm[diaUltimaTabela].valor

        // ultimos x salarios 
        var ultimoMes =  calcUtil.dia2intMesAno( this.v.datade )
        // var ultimoMes1 =  ultimoMes 
        var parcelasMax = this.v.seguroDesempregoParcelas 
        // console.log('.>>>>>> ',this.v.seguroDesempregoParcelas )
        // console.log('.>>>>>> ultimoMes >>>',ultimoMes )
        var parcelas = 0 
        var soma = 0
        for (var i=0; i < parcelasMax; i++) {
            // console.log( this.a.salario.planilha)
            if (typeof this.a.salario.planilha[ ultimoMes ] !== 'undefined') {
                soma += this.a.salario.planilha[ ultimoMes ].salario
                parcelas++ 
                ultimoMes-- 
            }
        }
        if (parcelas > 0) {
            valor = soma / parcelas 
        }
        // t.valor = valor //*** para debug */

    	if( valor <= t.limite_min) res = valor * 0.8;
	    if( valor > t.limite_min && valor <= t.limite_max) res = ((valor - t.limite_min) / 2) + (t.limite_min * 0.8);
        if( valor > t.limite_max) res = t.beneficio_max;    
        if( res < t.salmin) res = t.salmin;
    	if( res > t.beneficio_max) res = t.beneficio_max;

        res *= this.v.seguroDesempregoParcelas  

        this.set('seguroDesempregoMediaSalarios', valor)
        return res;
    }

    this.calcResumo = function () {
        // Correção monetária
        if (typeof this.v.mesanoCorrecaoMonetaria === 'undefined') this.v.mesanoCorrecaoMonetaria  = calcUtil.dia2intMesAno( calcUtil.diaHoje() )
        var ultimoIndiceCorrecao =  this.a.base.info.ultimoIndiceCorrecao

        // Preparação 
        var resumo_TotalAnexos = 0 
        var resumo_TotalFGTS = 0
        var ir_base = 0

        // Anexos 
        for (var i in this.a) {
            if (this.a[i].info.somarResumo && this.a[i].info.visivelLinhaResumo && this.a[i].info.visivel) {
                resumo_TotalAnexos += this.a[i].info.resultadoResumo 
            }
            if (this.a[i].info.somarFGTS && this.a[i].info.visivel) {
                resumo_TotalFGTS += this.a[i].info.resultadoFGTS 
                // console.log('FGTS 1058 - ', i, this.a[i].info.resultadoFGTS, resumo_TotalFGTS )
            }
            if (this.a[i].info.somarIRRF && this.a[i].info.visivel) {
                ir_base += this.a[i].info.resultadoIRRF 
            }
        }
        if (typeof this.v.dataci === 'undefined') this.v.dataci  = this.v.dataco
        this.set('ir_base', ir_base)

        // Seguro Desemprego
        if (typeof this.v.seguroDesempregoParcelas === 'undefined') {
            this.v.seguroDesempregoParcelas = 3
            this.set('seguroDesempregoParcelas', 3) 
        }
        if (typeof this.v.seguroDesempregoCorrigir === 'undefined') {
            this.v.seguroDesempregoCorrigir = true  
            this.set('seguroDesempregoCorrigir', true) 
        }
        this.v.resumo_seguroDesemprego = 0

        if (this.v.seguroDesemprego ) {
            this.v.resumo_seguroDesemprego = this.calcSeguroDesemprego () 
            resumo_TotalAnexos += this.v.resumo_seguroDesemprego 
        } else {
            this.set('seguroDesempregoMediaSalarios', 0)
        }

        // resumo_TotalFGTS += this.v.resumo_seguroDesemprego 

        // FGTS  ------------------------------------------------------------------------------------------------------------

        if (typeof this.v.resumo_MultaFGTS_considerar === 'undefined') this.v.resumo_MultaFGTS_considerar  = 1
        if (this.v.fgtsPago && this.a.fgtsPago.info.somarResumo) {
            resumo_TotalFGTS = resumo_TotalFGTS - this.a.fgtsPago.info.resultadoResumo 
        }
        // console.log('FGTS 1093 - ', resumo_TotalFGTS )
        var resumo_MultaFGTS = resumo_TotalFGTS * 0.4
        var resumo_MultaFGTS_s = (this.v.resumo_MultaFGTS_considerar  == 1) ?  resumo_MultaFGTS : 0  
        var resumo_FGTSDepositado = 0
        if ( this.v.fgts40_valor > 0 ) {
            resumo_FGTSDepositado = ultimoIndiceCorrecao * this.v.fgts40_valor * 0.4 
        }
        var resumo_TotalAnexosFGTS = resumo_TotalAnexos + resumo_TotalFGTS + resumo_MultaFGTS_s + resumo_FGTSDepositado 
        
        // console.log('FGTS 1101 - ', resumo_TotalFGTS )

        this.set('resumo_TotalAnexos', resumo_TotalAnexos)
        this.set('resumo_TotalFGTS', resumo_TotalFGTS)
        this.set('resumo_MultaFGTS', resumo_MultaFGTS)
        this.set('resumo_TotalAnexosFGTS', resumo_TotalAnexosFGTS)
        this.set('resumo_FGTSDepositado', resumo_FGTSDepositado)
        this.set('ultimoIndiceCorrecao', ultimoIndiceCorrecao)

        // JUROS  ------------------------------------------------------------------------------------------------------------

        let data_JurosSelic = calcUtil.dia2intMesAno( this.v.dataco )
        let datadi_ma = calcUtil.dia2intMesAno( this.v.datadi )
        if (this.v.dataci != '') {
            data_JurosSelic = calcUtil.dia2intMesAno( this.v.dataci )
        }

        if (typeof this.v.dataco === 'undefined') this.v.dataco  = calcUtil.diaHoje() 
        // if (typeof this.v.resumo_JurosPercentualSelic === 'undefined') this.v.resumo_JurosPercentualSelic  = 0 
        if (typeof this.v.resumo_JurosPercentual === 'undefined') this.v.resumo_JurosPercentual  = 0 

        let resumo_JurosPercentual  = this.v.resumo_JurosPercentual  
        if (this.v.ic_indexador) {
            if (typeof this.a.base.planilha[ datadi_ma ] !== 'undefined') {
                resumo_JurosPercentual = this.a.base.planilha[ datadi_ma ].juros
            } else {
                console.log('erro l: 1305 processos.js: ', this.v, datadi_ma)
                resumo_JurosPercentual = 0
            }
        }

        if (this.v.ic_juros == 'semjuros') {
            resumo_JurosPercentual = 0 
        }

        let resumo_baseJuros = resumo_TotalAnexosFGTS 

        var resumo_Juros = resumo_baseJuros * ( resumo_JurosPercentual / 100 )
        // if (this.v.juros_sn == '1') {
        var resumo_subtotalJuros = resumo_TotalAnexosFGTS + resumo_Juros 
        // } else {
            // var resumo_subtotalJuros = resumo_TotalAnexosFGTS
        // }

        this.set('resumo_JurosPercentual', resumo_JurosPercentual)
        this.set('resumo_Juros', resumo_Juros)
        this.set('resumo_baseJuros', resumo_baseJuros) 
        this.set('resumo_subtotalJuros', resumo_subtotalJuros)

        // SELIC  ------------------------------------------------------------------------------------------------------------
        
        let resumo_baseSelic = resumo_baseJuros + resumo_Juros
        let resumo_SelicPercentual = 0 
        if (this.v.ic_indexador) {
            resumo_SelicPercentual = 0
            if (typeof this.a.base.planilha[ data_JurosSelic ] !== 'undefined') {
                resumo_SelicPercentual = this.a.base.planilha[ data_JurosSelic ].selicAcumulada
            }
        }
        let resumo_SelicValor = resumo_baseSelic * ( resumo_SelicPercentual / 100 )
        let resumo_subtotalSelic = resumo_subtotalJuros + resumo_SelicValor
        this.set('resumo_SelicPercentual', resumo_SelicPercentual)
        this.set('resumo_SelicValor', resumo_SelicValor)
        this.set('resumo_baseSelic', resumo_baseSelic)
        this.set('resumo_subtotalJuros', resumo_subtotalSelic)

        // INSS ------------------------------------------------------------------------------------------------------------

        var resumo_somaINSS = this.a.inss.info.resultadoResumo + this.a.inss13sal.info.resultadoResumo + this.a.inssFerias.info.resultadoResumo
        if (typeof this.v.inss_reclamante === 'undefined') this.v.inss_reclamante  = 1
        if (typeof this.v.inss_juros === 'undefined') this.v.inss_juros  = 1
        if (this.v.inss_juros==1) {
            resumo_baseJuros = resumo_TotalAnexosFGTS - resumo_somaINSS
        }
        if (resumo_baseJuros < 0) resumo_baseJuros = 0

        if (this.v.inss_reclamante==0) {
            resumo_somaINSS = 0 
        }

        this.set('resumo_somaINSS', resumo_somaINSS)

        // IRRF ------------------------------------------------------------------------------------------------------------
        if (typeof this.v.irrf_sn === 'undefined') this.v.irrf_sn  = 1 
        if (typeof this.v.irrf_modo === 'undefined') this.v.irrf_modo  = 'caixa' 

        var ir_meses = 1 
        if (this.v.irrf_modo != 'caixa') {
            ir_meses = 0 
            var x  = calcUtil.salario13(this.v.dataad, this.v.datade, true)
            for (var i in x) {
                ir_meses += x[i].proporcao + 1
            }
            if (ir_meses < 1) ir_meses = 1 
        }
        var cIr = this.calcIr( this.v.mesanoCorrecaoMonetaria, this.v.ir_base, ir_meses)

        var ir_reclamante = 0 
        if (this.v.irrf_sn == 1) {
            ir_reclamante = ((this.v.ir_base * (cIr.perc/100)) - (cIr.deducao * ir_meses)) 
        }
        
        this.set('ir_perc', cIr.perc)
        this.set('ir_deducao', cIr.deducao * ir_meses)
        this.set('ir_meses', ir_meses)
        this.set('ir_reclamante', ir_reclamante)

        var resumo_subtotal_INSS_IRRF = resumo_subtotalSelic - (ir_reclamante + resumo_somaINSS) 
        this.set('resumo_subtotal_INSS_IRRF', resumo_subtotal_INSS_IRRF)

        // HONORÁRIOS ADVOCATICIOS ------------------------------------------------------------------------------------------------------------
        if (typeof this.v.hono_perc === 'undefined') this.v.hono_perc  = 15 
        if (typeof this.v.hono_inss === 'undefined') this.v.hono_inss  = 0 
        if (typeof this.v.hono_modo === 'undefined') this.v.hono_modo  = 'l'
        if (typeof this.v.hono_val === 'undefined') this.v.hono_val  = 0 

        if (this.v.hono_modo  == 'n') {
            var hono_base = 0 
        }
        if (this.v.hono_modo  == 'l') {
            var hono_base = resumo_subtotalSelic - (resumo_somaINSS  + ir_reclamante) 
        }
        if (this.v.hono_modo  == 'c') {
            var hono_base = resumo_subtotalSelic 
        }
        var resumo_hono = hono_base * ( this.v.hono_perc  / 100 )
        if (this.v.hono_modo  == 'd') {
            resumo_hono = this.v.hono_val  
        }

        this.set('hono_base', hono_base)
        this.set('resumo_hono', resumo_hono)

        // HONORÁRIOS PERICIAIS ------------------------------------------------------------------------------------------------------------
        if (typeof this.v.hono_per_perc === 'undefined') this.v.hono_per_perc  = 15 
        if (typeof this.v.hono_per_inss === 'undefined') this.v.hono_per_inss  = 0 
        if (typeof this.v.hono_per_modo === 'undefined') this.v.hono_per_modo  = '0'
        if (typeof this.v.hono_per_val === 'undefined') this.v.hono_per_val  = 0 

        if (this.v.hono_per_modo  == '0') {
            var hono_per_base = 0 
        }
        if (this.v.hono_per_modo  == 'l') {
            var hono_per_base = resumo_subtotal_INSS_IRRF  
        }
        if (this.v.hono_per_modo  == 'c') {
            var hono_per_base = resumo_subtotalSelic 
        }
        var resumo_per_hono = hono_per_base * ( this.v.hono_per_perc  / 100 )
        if (this.v.hono_per_modo  == 'v') {
            resumo_per_hono = this.v.hono_per_val  
        }

        this.set('hono_per_base', hono_per_base)
        this.set('resumo_per_hono', resumo_per_hono)


        // HONORÁRIOS DE SUCUMBENCIAS ------------------------------------------------------------------------------------------------------------
        var resumo_suc_hono = 0 
        if (typeof this.v.hono_suc_perc === 'undefined') this.v.hono_suc_perc  = 15 
        if (typeof this.v.hono_suc_valor === 'undefined') this.v.hono_suc_valor  = 0 
        if (typeof this.v.hono_suc_total_digitado === 'undefined') this.v.hono_suc_total_digitado  = 0
        if (typeof this.v.hono_suc_modo === 'undefined') this.v.hono_suc_modo  = 'nao_calcular'
        
        if (this.v.hono_suc_modo  == 'total_calculado') {
            var resumo_suc_hono = (resumo_subtotal_INSS_IRRF +  resumo_per_hono + resumo_hono) * (this.v.hono_suc_perc/100)
        }
        if (this.v.hono_suc_modo  == 'digitar_base') {
            var resumo_suc_hono = this.v.hono_suc_valor * (this.v.hono_suc_perc/100) 
        }

        if (this.v.hono_suc_modo  == 'digitar_total') {
            var resumo_suc_hono =this.v.hono_suc_total_digitado  
        }

        this.set('resumo_suc_hono', resumo_suc_hono)

        // TOTAL FINAL ------------------------------------------------------------------------------------------------------------
        var resumo_TotalFinal = resumo_subtotal_INSS_IRRF + resumo_hono + resumo_suc_hono + resumo_per_hono
        this.set('resumo_TotalFinal', resumo_TotalFinal)

        // INSS RECLAMADA ------------------------------------------------------------------------------------------------------------
        if (typeof this.v.inssemp_sn === 'undefined') this.v.inssemp_sn  = 1 
        if (typeof this.v.inssemp_e === 'undefined') this.v.inssemp_e  = 20
        if (typeof this.v.inssemp_t === 'undefined') this.v.inssemp_t  = 5.8 
        if (typeof this.v.inssemp_s === 'undefined') this.v.inssemp_s  = 1 

        var resumo_baseINSSEmpregador = this.a.inss.info.resultadoBaseEmpregadorCorrigida + this.a.inss13sal.info.resultadoBaseEmpregadorCorrigida + this.a.inssFerias.info.resultadoBaseEmpregadorCorrigida
        var resumo_inssemp_e = resumo_baseINSSEmpregador * (this.v.inssemp_e/100)
        var resumo_inssemp_t = resumo_baseINSSEmpregador * (this.v.inssemp_t/100)
        var resumo_inssemp_s = resumo_baseINSSEmpregador * (this.v.inssemp_s/100)
        
        this.set('resumo_baseINSSEmpregador', resumo_baseINSSEmpregador)
        this.set('resumo_inssemp_e', resumo_inssemp_e)
        this.set('resumo_inssemp_t', resumo_inssemp_t)
        this.set('resumo_inssemp_s', resumo_inssemp_s)

        return;
    }

    function  le_arquivo(idCalc) {
        var n = parseInt(idCalc / 1500)
        var pasta = pasta_env + '/' + n 
        var nomearq = pasta + '/'+ idCalc + '.t5'
        console.log('1469: Lendo arquivo: ', nomearq)

        // verifica se a pasta existe 
        if (!fs.existsSync(pasta)) { fs.mkdirSync(pasta); }

        var json1 = {}
        if (fs.existsSync(nomearq)) {
            fs.readFile(nomearq, 'utf8', (err, dados) => {
                if (err) {
                  console.error(err);
                  return;
                }

                json1 = calcUtil.JSON_parseAutoCorrige(dados)

                if (that.assinante) {
                    if (typeof json1.v === 'undefined') json1.v = {}
                    json1.v.assinante = that.assinante 
                } else {
                    if (json1.v) {
                        json1.v.assinante = false 
                    } else {
                        json1.v = { assinante : false} 
                    }
                }
                
                // ajustes pós leitura do arquivo 
                // algumas variaveis precisam ser ajustadas para o novo formato
                if (typeof json1.v.dataCriacao === 'undefined' || !json1.v.dataCriacao) {
                    json1.v.dataCriacao= '20230402'
                } else {
                    console.log('data de criação: ', json1.v.dataCriacao)
                }

                if (typeof json1.v.selicAposCitacao === 'undefined') {
                    json1.v.selicAposCitacao = true;
                }
                
                that.setDump( json1 )
                // console.log('l:1516 -terminei o setDump agora ')
            });
        } else {
            console.log('arquivo nao encontrado')
        }
      
    }

    le_arquivo(this.idCalc) 


    this.setSalvar = function(b) {
        this.salvarAtivo = b 
        if (b) this.salvar () 
    }
      
    this.resetComandos = function() {
        this.comandos = {} 
    }

    this.pegaTabelaRaiz = function(nome) {
        return [{nome}] 
    }
    
    this.atualizaVerbasCriadas( this )

    this.getDump = function (excluirComandos) {
        if (excluirComandos) {
            var res = {
                a: this.a,
                v: this.v,
                idCalc: this.idCalc 
            }
        } else {
            var res = {
                a: this.a,
                v: this.v,
                comandos: this.comandos,
                idCalc: this.idCalc 
            }
        }

        return  res 
    }

    console.log('criado o processo do cálculo: ', this.idCalc)
  }
  