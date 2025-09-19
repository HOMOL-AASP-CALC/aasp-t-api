module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'Salário família', 
        prefixo: 'salarioFamilia', 
        grupo: 'salarioFamilia',
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
        { titulo: 'Salário', tipo: 'f', casas: 2, nome: "salario", modal: "mSalarioFamiliaBase"}, 
        { titulo: 'Valor por cota', tipo: 'f', casas: 2, nome: "valorPorCota"}, 
        { titulo: 'Número de cotas', tipo: 'v', casas: 2, nome: "quantidadeCotas"},
        { titulo: 'Valor do Salário Família', tipo: 'f', casas: 2, nome: "total"},
        { titulo: 'Índice Correção', tipo: 'f', casas:9, nome: "indice", modal: "mIndiceCorrecao"},
        { titulo: 'Resultado', tipo: 'f', casas: 2, nome:"resultado", somar: true},
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
        return 0 
    }

    this.calcCota = function(dia, valor, tabela) {
        if (dia < 23568) { return 0 }
        var tab = tabela  [ dia ]

        if (typeof tab === 'undefined') {
            return this.calcCota( dia-1, valor, tabela)
        }

        for (var i in tab) {
            if (tab[i].de <= valor && valor <= tab[i].ate ) {
                return tab[i].valor 
            } 
        }
        return 0   
    }

    this.calc = function () {
        var totalResumo = 0 
        var tabela_salfam = this.pegaTabela('tabela_salfam') 

        var equiparacaoSalarial = this.getVariavel('equiparacaoSalarial')
        var diferencasSalariais = this.getVariavel('diferencasSalariais')
        var checkGratA = this.getVariavel('checkGratA')
        var checkGratB = this.getVariavel('checkGratB')
        var checkGratC = this.getVariavel('checkGratC')
        var SalFam_base1 = this.getVariavel('SalFam_base1')
        var SalFam_base2 = this.getVariavel('SalFam_base2')
        var SalFam_base3 = this.getVariavel('SalFam_base3')
        var SalFam_base4 = this.getVariavel('SalFam_base4')
        var SalFam_base5 = this.getVariavel('SalFam_base5')
        var SalFam_base6 = this.getVariavel('SalFam_base6')

        if (typeof SalFam_base1 === 'undefined') { SalFam_base1 = false; }
        if (typeof SalFam_base2 === 'undefined') { SalFam_base2 = false; }
        if (typeof SalFam_base3 === 'undefined') { SalFam_base3 = false; }
        if (typeof SalFam_base4 === 'undefined') { SalFam_base4 = false; }
        if (typeof SalFam_base5 === 'undefined') { SalFam_base5 = false; }
        if (typeof SalFam_base6 === 'undefined') { SalFam_base6 = false; }

        if (!SalFam_base1 && !SalFam_base2 && !SalFam_base3 && !SalFam_base4 && !SalFam_base5 && !SalFam_base6) {
            SalFam_base1 = true 
            this.setVariavel('SalFam_base1', true)
        }

        for (var i in this.planilha) {
            var l  = this.planilha[i]
            
            l.salario = 0
            if (SalFam_base1)  l.salario += this.getValorPlanilha('salario', i, "salario")
            if (SalFam_base2 && checkGratA) {  l.salario += this.getValorPlanilha('salario', i, "vrGratA") }
            if (SalFam_base3 && checkGratB) {  l.salario += this.getValorPlanilha('salario', i, "vrGratB") }
            if (SalFam_base4 && checkGratC) {  l.salario += this.getValorPlanilha('salario', i, "vrGratC") }
            if (SalFam_base5 && equiparacaoSalarial) {  l.salario += this.getValorPlanilha('equiparacaoSalarial', i, "diferenca") }
            if (SalFam_base6 && diferencasSalariais) {  l.salario += this.getValorPlanilha('diferencasSalariais', i, "diferenca") }

            if (typeof l.quantidadeCotas === 'undefined') l.quantidadeCotas = 0

            l.valorPorCota = this.calcCota(i, l.salario, tabela_salfam)  

            l.total = l.quantidadeCotas * l.valorPorCota
            l.diferencaEfetiva = l.diferenca * this.getValorPlanilha('base', i, 'proporcao')  

            l.indice = this.getValorPlanilha('base', i, "indiceCorrecao")
            l.resultado = l.total * l.indice 
            totalResumo += l.resultado  
            this.planilha[i] = l 
        }
        this.info.resultadoResumo = totalResumo 
        this.info.resultadoFGTS = 0 
        this.info.resultadoIRRF = 0 
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

    this.pegaTabela = function( nome ) {
        console.log('anexo-salario-familia pegaTabela do anexo: ', nome)
        return "pegaTabela do anexo anexo-salario-familia l:169"
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

