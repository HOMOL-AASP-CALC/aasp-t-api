
module.exports = function(var1) {
    var calcUtil = require('./calcUtil.js');

    this.info = {
        posicao: var1.posicao,
        titulo: 'Base', 
        prefixo: 'base', 
        id: 1000, 
        visivel: 0,
        visivelLinhaResumo: 0,
        somarResumo: "", 
        resultadoResumo: 0, 
        resultadoIRRF: 0,
        inicio: '',
        fim: '',
        ultimoIndiceCorrecao: -2    
    }

    this.colunas = [
        { titulo: 'Data', tipo: 'data',  nome: "dia"},  
        { titulo: 'Índice Correção', tipo: 'f', casas:9, nome: "indiceCorrecao"},
        { titulo: 'Proporção', tipo: 'f', casas: 9, nome:"proporcao"},
        { titulo: 'DSR u', tipo: 'data', casas: 1, nome:"dsrU"},
        { titulo: 'DSR d', tipo: 'data', casas: 1, nome:"dsrD"},
        { titulo: 'salarioMinimo', tipo: 'data', casas: 2, nome:"salarioMinimo"}
    ]

    this.planilha = {}   

    this.setup = function(si,sf, diaDemissao) {
        // console.log('setup anexo-base', si,sf, diaDemissao)
        this.info.inicio = si
        this.info.fim = sf 
        this.info.demissao = diaDemissao 

        var i = calcUtil.dia2intMesAno(si)
        var f = calcUtil.dia2intMesAno(sf)

        if ((i<23568) || (f<23568))  { console.log('data zerada'); return; } 
        for (var n = i; n <= f; n++) {
            if (typeof this.planilha[n] === 'undefined') {
                this.planilha[n] = { diaInt: n, dia: calcUtil.mesAno2dia(n), proporcao: 1  }  
            }
        }
    }

    this.resINSS = function( dia, tipo) {
        return 0;
    }

    this.calc = function () {
        var intInicio = calcUtil.dia2intMesAno(this.info.inicio)
        var intFim = calcUtil.dia2intMesAno(this.info.fim) 
        if (this.info.demissao) {
            var intDemissao = calcUtil.dia2intMesAno(this.info.demissao)
        } else {
            var intDemissao = intFim 
        }
        

        var tabFeriados = this.getVariavel('dsrFeriados')
        var tabConfig = { 
            dsrDom:  this.getVariavel('dsrDom'),
            dsrSeg:  this.getVariavel('dsrSeg'),
            dsrTer:  this.getVariavel('dsrTer'),
            dsrQua:  this.getVariavel('dsrQua'),
            dsrQui:  this.getVariavel('dsrQui'),
            dsrSex:  this.getVariavel('dsrSex'),
            dsrSab:  this.getVariavel('dsrSab'),
            dsrFer:  this.getVariavel('dsrFer') 
        }

        var salmin = this.pegaTabela('salario_minimo')
        for (var i in this.planilha) {
            var l  = this.planilha[i]
            if (!l.indiceCorrecao) l.indiceCorrecao = 1 
            if (!l.salarioMinimo) {
                if (typeof salmin[i] === 'undefined') {
                    l.salarioMinimo = 0
                } else {
                    l.salarioMinimo = salmin[i].valor
                }
            }

            if (intInicio == i) { var dsrCalc = calcUtil.dsrDetalhado( this.info.inicio, calcUtil.strUltimoDia(this.info.inicio), tabFeriados, tabConfig  )  }
            if (intFim == i) { var dsrCalc = calcUtil.dsrDetalhado( calcUtil.strPrimeiroDia(this.info.fim) , this.info.fim, tabFeriados, tabConfig  )  }
            if ((intInicio != i) && (intFim != i)) { 
                var i2 = parseInt(i)
                var stri =  '01/'+calcUtil.mesAno2dia(i2)
                var dmFim = calcUtil.diasMes(  '01/'+calcUtil.mesAno2dia(i2) )  
                var strf = dmFim + '/' + calcUtil.mesAno2dia(i2)
                var dsrCalc = calcUtil.dsrDetalhado( stri, strf, tabFeriados, tabConfig  ) 
            }

            // console.log(dsrCalc)
            l.dsrU = dsrCalc.diasU 
            l.dsrD = dsrCalc.diasD  
            l.proporcao = 1
            this.info.ultimoIndiceCorrecao = l.indiceCorrecao 
        }

        // calcula proporcao inicio e fim 
        var diaIni = calcUtil.dia2intDia(this.info.inicio)
        var diasMesIni = calcUtil.diasMes(this.info.inicio)
        this.planilha[intInicio].proporcao =  ((diasMesIni - diaIni)+1) / diasMesIni;

        var diasMesFim = calcUtil.diasMes(this.info.fim)
        var diaFim = calcUtil.dia2intDia(this.info.fim)
        this.planilha[intFim].proporcao = diaFim / diasMesFim 

        this.planilha[intDemissao].proporcao = diaFim / diasMesFim 
        var diasMesFim = calcUtil.diasMes(this.info.demissao)
        var diaFim = calcUtil.dia2intDia(this.info.demissao)
        this.planilha[intDemissao].proporcao = diaFim / diasMesFim 
    }

    this.set = function(dia, coluna, valor) {
        this.planilha[dia][coluna] = valor 
        this.calc () 
    }

    this.getDump = function () {
        return { 
            info: this.info, 
            colunas: this.colunas,
            planilha: this.planilha 
        }
    }

    this.getPlanilha = function () {
        return this.planilha 
    }

    this.pegaTabela = function( nome ) {
        console.log('pegaTabela do anexo: ', nome)
        return "pegaTabela do anexo"
    }

    // fazer ao criar o objeto
    this.posicao = var1.posicao 

    if (var1.info) {
        this.info = var1.info 
        this.colunas = var1.colunas
        this.planilha = var1.planilha 
    } else {
        if (var1.inicio && var1.fim) {
            this.setup(var1.inicio, var1.fim, var1.diaDemissao)
        }
    }
  
}

