const e = require('cors');

module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'verbasDiversas', 
        posicao: var1.posicao,
        titulo: 'Verbas diversas', 
        prefixo: 'verbasDiversas', 
        grupo: 'verbasDiversas',
        id: 3, 
        visivel: 1,
        visivelLinhaResumo: 1,
        somarResumo: true, 
        somarFGTS: true, 
        somarIRRF: true,
        somarINSS: true, 
        resultadoResumo: 0, 
        resultadoIRRF: 0,
        resultadoFGTS: 0,
        virgem: true    
    }

    this.colunas = [
        { titulo: 'Data', tipo: 'data',  nome: "dia"},
        { titulo: 'Descrição', tipo: 'data', nome: "desc"},
        { titulo: 'Valor', tipo: 'f', casas: 2, nome: "valor"},
        { titulo: 'Índice Correção', tipo: 'f', casas:9, nome: "indice", modal: "mIndiceCorrecao"},
        { titulo: 'Resultado', tipo: 'f', casas: 2, nome:"resultado", somar: true},
        { titulo: 'FGTS', tipo: 'f', casas: 2, nome:"fgts", somar: true },
        { titulo: 'Base INSS', tipo: 'f', casas: 2, nome:"inss" },
        { titulo: 'Base IRRF', tipo: 'f', casas: 2, nome:"irrf", somar: true },
    ]

    this.planilha = []  

    this.setup = function(si,sf, ampliar) {
        if (!this.info.virgem) return; 

        this.planilha = []  
    }

    this.getValorPlanilha = function(nome, dia, coluna) {
        console.log('passando na função default - anexo-periculosidade-reflexos linha 59',nome, dia, coluna)
        return 0;
    }

    this.resINSS = function( dia, tipo ) {
        var r = 0
        if (this.info.visivel!=1) return 0;

        for (var i in this.planilha) {
            if ((this.planilha[i].diaInt == dia) && (tipo != 'ferias' && tipo != 'sal13') &&  (this.planilha[i].calcINSS)) {
                r += this.planilha[i].inss 
            }
        }

        return r; 
    }

    this.calc = function () {
        var totalResumo = 0 
        var totalIRRF = 0
        var totalFGTS = 0

        for (var i in this.planilha) {
            var l  = this.planilha[i]

            if (typeof l.calcSomar === 'undefined') l.calcSomar = false  
            if (typeof l.calcFGTS === 'undefined') l.calcFGTS = false  
            if (typeof l.calcINSS === 'undefined') l.calcINSS = false  
            if (typeof l.calcIRRF === 'undefined') l.calcIRRF = false 
            if (typeof l.calcCorrecaoMonetaria === 'undefined') l.calcCorrecaoMonetaria = true
            
            if (typeof l.valor === 'undefined') l.valor = 0  
                 
            l.indice = (l.calcCorrecaoMonetaria) ? this.getValorPlanilha('base', l.diaInt, "indiceCorrecao"): 1 
            l.resultado = l.valor * l.indice 
            l.fgts = (l.calcFGTS) ? l.resultado * 0.08 : 0
            l.inss = (l.calcINSS) ? l.valor : 0
            l.irrf = (l.calcIRRF) ? l.resultado : 0 
            
            totalResumo += l.resultado 
            totalIRRF += l.irrf
            totalFGTS += l.fgts 
            this.planilha[i] = l 
        }
        this.info.resultadoResumo = totalResumo 
        this.info.resultadoIRRF = totalIRRF 
        this.info.resultadoFGTS = totalFGTS
    }

    this.setVerbasDiversas = function(dados) {
        if (dados.autor != 'automatico') this.info.virgem = false;

        if (dados.autor == 'importado') {
            if (this.planilha.length > 0) {
                if (this.planilha[0].autor == 'automatico') {
                    this.planilha = [] 
                }
            }
        }
        
        var d = { 
            diaInt: dados.diaInt,
            dia: calcUtil.mesAno2dia(dados.diaInt), 
            desc: dados.desc,
            valor: dados.valor,
            calcINSS: dados.calcINSS,
            calcIRRF: dados.calcIRRF,
            calcFGTS: dados.calcFGTS,
            calcSomar: dados.calcSomar,
            calcCorrecaoMonetaria: dados.calcCorrecaoMonetaria,
            // autor: dados.autor   
        }

        if (dados.index==-1) {
            this.planilha.push(d)
        } else {
            this.planilha[ dados.index ] = d 
        }
        this.planilha = this.planilha.sort((a,b) => (a.diaInt > b.diaInt) ? 1 : ((b.diaInt > a.diaInt) ? -1 : 0)) 
        if (dados.autor != 'automatico') this.calc () 
    }

    this.deleteVerbasDiversas = function (linha) {
        this.planilha.splice(linha, 1)
        this.calc () 
    }

    this.deleteReflexo = function (linha) {
        this.planilha.splice(linha, 1)
        this.calc () 
    }

    this.set = function(dia, coluna, valor) {
        if (dia == 'info') {
            this.info[coluna] = valor 
        } else {
            this.planilha[dia][coluna] = valor 
            this.calc () 
        }
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

    // fazer ao criar o objeto
    this.posicao = var1.posicao 
    if (var1.info) {
        this.info = var1.info 
        this.colunas = var1.colunas
        this.planilha = var1.planilha 
    } else {
        if (var1.inicio && var1.fim) {
            this.setup(var1.inicio, var1.fim)
        }
    }
  
}

