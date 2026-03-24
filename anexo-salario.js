module.exports = function(var1)  {
    const BigNumber = require('bignumber.js');
    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'Evolução Salarial', 
        prefixo: 'salario', 
        grupo: 'salario',
        id: 1, 
        visivel: 1,
        visivelLinhaResumo: 1,
        somarResumo: false, 
        somarFGTS: false, 
        somarIRRF: false,
        somarINSS: false, 
        impressaoObrigatoria: true, 
        resultadoResumo: 0, 
        resultadoFGTS: 0,
        resultadoIRRF: 0 
    }

    this.colunas = [] 
    this.planilha = {} 

    this.setup = function(si,sf) {
        // console.log(this.info.titulo, si, sf)
        var i = calcUtil.dia2intMesAno(si)
        var f = calcUtil.dia2intMesAno(sf)

        if ((i<23568) || (f<23568))  { console.log('data zerada'); return; } 
        for (var n = i; n <= f; n++) {
            if (typeof this.planilha[n] === 'undefined') {
                this.planilha[n] = { diaInt: n, dia: calcUtil.mesAno2dia(n) } 
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
        if (this.info.visivel!=1) return 0;
        return (this.info.somarINSS && tipo!='sal13' && tipo!='ferias') ? this.planilha[ dia ].inss : 0 
    }

    this.calc = function () {
        var totalResumo = 0 
        var totalFGTS = 0
        var totalIRRF = 0
        if (typeof this.info.impressaoObrigatoria === 'undefined') this.info.impressaoObrigatoria = true;
        
        // Colunas 

        this.colunas = [] 
        this.colunas.push(
            { titulo: 'Data', tipo: 'data',  nome: "dia"}, 
            { titulo: 'Salário', tipo: 'v', casas: 2, nome: "salario", modal: "mSalario"},
            { titulo: 'Salário Efetivo', tipo: 'f', casas: 2, nome:"salarioEfetivo",})
        if (this.getVariavel('checkGratA')) {
            this.colunas.push( { titulo: this.getVariavel('descGratA'), tipo: 'v', casas: 2, nome: "vrGratA"} )
        }
        if (this.getVariavel('checkGratB')) {
            this.colunas.push( { titulo: this.getVariavel('descGratB'), tipo: 'v', casas: 2, nome: "vrGratB"} )
        }
        if (this.getVariavel('checkGratC')) {
            this.colunas.push( { titulo: this.getVariavel('descGratC'), tipo: 'v', casas: 2, nome: "vrGratC"} )
        }
        this.colunas.push(  { titulo: 'Total', tipo: 'f', casas: 2, nome:"total"},
                    { titulo: 'Índice Correção', tipo: 'f', casas:9, nome: "indice", modal: "mIndiceCorrecao"},
                    { titulo: 'Resultado', tipo: 'f', casas: 2, nome:"resultado", somar: true },
                    { titulo: 'FGTS', tipo: 'f', casas: 2, nome:"fgts", somar: true },
                    { titulo: 'Base INSS', tipo: 'f', casas: 2, nome:"inss", somar: true },
                    { titulo: 'Base IRRF', tipo: 'f', casas: 2, nome:"irrf", somar: true })


        // Cálculos

        for (var i in this.planilha) {
            var l  = this.planilha[i]

            if (!l.salario) l.salario = 0
            if (!l.vrGratA) l.vrGratA = 0
            if (!l.vrGratB) l.vrGratB = 0
            if (!l.vrGratC) l.vrGratC = 0
            
            
            l.salarioEfetivo = l.salario * this.getValorPlanilha('base', i, 'proporcao') // salario efetivo
            l.total = BigNumber( l.salarioEfetivo ) 

            if (this.getVariavel('checkGratA')) { l.total = l.total.plus( l.vrGratA ) ; }
            if (this.getVariavel('checkGratB')) { l.total = l.total.plus( l.vrGratB ); }
            if (this.getVariavel('checkGratC')) { l.total = l.total.plus( l.vrGratC ); }

            l.indice = this.getValorPlanilha('base', i, 'indiceCorrecao')
            l.resultado = l.total * l.indice 
            l.fgts = l.resultado * 0.08 
            l.inss = l.total 
            l.irrf = l.resultado 
            // l.inss2 = (this.info.somarINSS) ? l.inss : 0 

            totalResumo += l.resultado
            totalFGTS += l.fgts
            totalIRRF += l.irrf

            this.planilha[i] = l 
        }
        this.info.resultadoResumo = totalResumo 
        this.info.resultadoFGTS = totalFGTS
        this.info.resultadoIRRF = totalIRRF
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

