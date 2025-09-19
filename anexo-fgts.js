
module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'Valores pagos do FGTS', 
        prefixo: 'fgtsPago', 
        grupo: 'fgts',
        id: 900, 
        visivel: 1,
        visivelLinhaResumo: 0,
        somarResumo: false, 
        resultadoResumo: 0
    }

    this.colunas = [
        { titulo: 'Data', tipo: 'data',  nome: "dia"},
        { titulo: 'Valor Pago', tipo: 'v', casas: 2, nome: "valorPago"},
        { titulo: 'Índice Correção', tipo: 'f', casas:9, nome: "indice", modal: "mIndiceCorrecao"},
        { titulo: 'Resultado', tipo: 'f', casas: 2, nome:"resultado",  somar: true }
    ]

    this.planilha = {} 

    this.setup = function(si,sf) {
        // console.log(this.info.titulo, si, sf)
        var i = calcUtil.dia2intMesAno(si)
        var f = calcUtil.dia2intMesAno(sf)

        if ((i<23568) || (f<23568))  { console.log('data zerada'); return; } 
        for (var n = i; n <= f; n++) {
            if (typeof this.planilha[n] === 'undefined') {
                this.planilha[n] = { diaInt: n, dia: calcUtil.mesAno2dia(n), b: 20, c: 0, d: 0, e: 0, g: 0, h: 0, i:0, j:0  }  
            } 
        }
        // remove itens que não estão dentro do inicio e fim
        var plan2 = {} 
        for (var p in this.planilha) {
            if ((i <= p) && (p <= f)) {
                plan2[p] = this.planilha[p]
            }
        }
        this.planilha = plan2 
    }

    this.resINSS = function( dia, tipo) {
        return 0;
    }

    this.calc = function () {
        var totalResumo = 0 


        for (var i in this.planilha) {
            var l  = this.planilha[i]

            if (typeof l.valorPago === 'undefined') l.valorPago = 0 

            l.indice = this.getValorPlanilha('base', i, "indiceCorrecao")
            l.resultado = l.valorPago * l.indice 
            totalResumo += l.resultado 
            this.planilha[i] = l 
        }
        this.info.resultadoResumo = totalResumo 

    }

    this.getDump = function () {
        return { 
            info: this.info, 
            colunas: this.colunas,
            planilha: this.planilha 
        }
    }

    this.set = function(dia, coluna, valor) {
        if (dia == 'info') {
            this.info[coluna] = valor 
        } else {
            this.planilha[dia][coluna] = valor 
            while (( this.getVariavel('repetirValor') ) && (typeof this.planilha[++dia] !== 'undefined')) {
                this.planilha[dia][coluna] = valor
            }
        }

        this.calc () 
    }

    this.getPlanilha = function () {
        return this.planilha 
    }

    this.getValorPlanilha = function(nome, dia, coluna) {
        console.log('getValorPlanilha default', nome, dia, coluna)
        return 300;
    }

    this.getVariavel = function(nome) {
        console.log('getVariavel default', nome)
        return "def1";
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

