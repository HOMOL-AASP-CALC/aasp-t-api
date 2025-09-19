
module.exports = function(var1) {
    const BigNumber = require('bignumber.js');
    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'Diferenças Salariais', 
        prefixo: 'diferencasSalariais', 
        grupo: 'diferencasSalariais',
        id: 1, 
        visivel: 1,
        visivelLinhaResumo: 1,
        somarResumo: true, 
        somarFGTS: true, 
        somarIRRF: true,
        somarINSS: true, 
        resultadoResumo: 0, 
        resultadoFGTS: 0,
        resultadoIRRF: 0 
    }

    this.colunas = [
        { titulo: 'Data', tipo: 'data',  nome: "dia"},
        { titulo: 'Salário', tipo: 'f', casas: 2, nome: "salario", modal: "mDiferencasSalariaisBase"},
        { titulo: 'Percentual', tipo: 'v', casas: 2, nome: "percA"},
        { titulo: 'Percentual', tipo: 'v', casas: 2, nome: "percB"},
        { titulo: 'Percentual', tipo: 'v', casas: 2, nome: "percC"},
        { titulo: 'Percentual', tipo: 'v', casas: 2, nome: "percD"},
        { titulo: 'Diferença', tipo: 'f', casas: 2, nome: "diferenca"},
        { titulo: 'Diferença Efetiva', tipo: 'f', casas: 2, nome: "diferencaEfetiva"},
        { titulo: 'Índice Correção', tipo: 'f', casas:9, nome: "indice", modal: "mIndiceCorrecao"},
        { titulo: 'Resultado', tipo: 'f', casas: 2, nome:"resultado", somar: true},
        { titulo: 'FGTS', tipo: 'f', casas: 2, nome:"fgts", somar: true },
        { titulo: 'Base INSS', tipo: 'f', casas: 2, nome:"inss", somar: true },
        { titulo: 'Base IRRF', tipo: 'f', casas: 2, nome:"irrf", somar: true },
    ]

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

    this.getValorPlanilha = function(nome, dia, coluna) {
        console.log('passando na função default')
        return 300;
    }

    this.getVariavel = function(nome) {
        console.log('getVariavel default', nome)
        return "def1";
    }

    this.resINSS = function( dia, tipo) {
        if (this.info.visivel!=1) return 0;
        return (this.info.somarINSS && tipo!='sal13' && tipo!='ferias') ? this.planilha[ dia ].inss : 0 
    }

    this.calc = function () {
        var totalResumo = 0 
        var totalFGTS = 0
        var totalIRRF = 0

        var equiparacaoSalarial = this.getVariavel('equiparacaoSalarial')
        var checkGratA = this.getVariavel('checkGratA')
        var checkGratB = this.getVariavel('checkGratB')
        var checkGratC = this.getVariavel('checkGratC')
        var DifSal_base1 = this.getVariavel('DifSal_base1')
        var DifSal_base2 = this.getVariavel('DifSal_base2')
        var DifSal_base3 = this.getVariavel('DifSal_base3')
        var DifSal_base4 = this.getVariavel('DifSal_base4')
        var DifSal_base5 = this.getVariavel('DifSal_base5')

        if (typeof DifSal_base1 === 'undefined') { DifSal_base1 = false; }
        if (typeof DifSal_base2 === 'undefined') { DifSal_base2 = false; }
        if (typeof DifSal_base3 === 'undefined') { DifSal_base3 = false; }
        if (typeof DifSal_base4 === 'undefined') { DifSal_base4 = false; }
        if (typeof DifSal_base5 === 'undefined') { DifSal_base5 = false; }

        if (!DifSal_base1 && !DifSal_base2 && !DifSal_base3 && !DifSal_base4 && !DifSal_base5) {
            DifSal_base1 = true 
        }

        for (var i in this.planilha) {
            var l  = this.planilha[i]
            
            l.salario = 0
            if (DifSal_base1)  l.salario += this.getValorPlanilha('salario', i, "salario")
            if (DifSal_base2 && checkGratA) {  l.salario += this.getValorPlanilha('salario', i, "vrGratA") }
            if (DifSal_base3 && checkGratB) {  l.salario += this.getValorPlanilha('salario', i, "vrGratB") }
            if (DifSal_base4 && checkGratC) {  l.salario += this.getValorPlanilha('salario', i, "vrGratC") }
            if (DifSal_base5 && equiparacaoSalarial) {  l.salario += this.getValorPlanilha('equiparacaoSalarial', i, "diferenca") }
            
            if (typeof l.percA === 'undefined') l.percA = 0
            if (typeof l.percB === 'undefined') l.percB = 0
            if (typeof l.percC === 'undefined') l.percC = 0
            if (typeof l.percD === 'undefined') l.percD = 0

            var p = (1+(l.percA / 100)) *  (1+(l.percB / 100)) *  (1+(l.percC / 100)) *  (1+(l.percD / 100))
            var p1 = BigNumber(p).minus(1)

            l.diferenca = l.salario * p1  
            l.diferencaEfetiva = l.diferenca * this.getValorPlanilha('base', i, 'proporcao')  
            // console.log('######', l.salario, p1, l.diferenca, '######')

            if (l.diferenca < 0) l.diferenca = 0 
            l.indice = this.getValorPlanilha('base', i, "indiceCorrecao")
            l.resultado = l.diferencaEfetiva * l.indice 
            l.fgts = l.resultado * 0.08 
            l.inss = l.diferencaEfetiva

            l.irrf = l.resultado  
            totalResumo += l.resultado  
            totalFGTS += l.fgts 
            totalIRRF += l.irrf

            this.planilha[i] = l 
        }
        this.info.resultadoResumo = totalResumo 
        this.info.resultadoFGTS = totalFGTS 
        this.info.resultadoIRRF = totalIRRF 
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

