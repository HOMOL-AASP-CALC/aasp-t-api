
module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'INSS - 13o salário', 
        prefixo: 'inss13sal', 
        grupo: 'inss',
        id: 101, 
        visivel: 1,
        visivelLinhaResumo: 0,
        somarResumo: true,
        somarINSS: true,
        resultadoResumo: 0,
        resultadoBaseEmpregadorCorrigida: 0 
    }

    this.colunas = [
        { titulo: 'Data', tipo: 'data',  nome: "dia"},
        { titulo: 'Base INSS Pago (hollerith)', tipo: 'v', casas: 2, nome: "basePago"},
        { titulo: 'Base INSS da ação', tipo: 'f', casas: 2, nome: "baseInssAcao"},
        { titulo: 'Base INSS total', tipo: 'f', casas: 2, nome: "baseInssTotal"},
        { titulo: 'Alíquota', tipo: 'f', casas: 2, nome: "aliquota"},
        { titulo: 'INSS da ação trabalhista até', tipo: 'f', casas: 2, nome: "acaoAte"},
        { titulo: 'INSS retido (hollerith)', tipo: 'v', casas: 2, nome: "inssRetido"},
        { titulo: 'INSS a recolher limitado ao teto', tipo: 'f', casas: 2, nome: "recolher"},
        { titulo: 'Índice Correção', tipo: 'f', casas:9, nome: "indice", modal: "mIndiceCorrecao"},
        { titulo: 'Resultado', tipo: 'f', casas: 2, nome:"resultado", somar: true},
        { titulo: 'Base corrigida para INSS do  empregador', tipo: 'f', casas: 2, nome:"baseCorrigidaEmpregador", somar: true },
    ]

    this.planilha = {} 
    this.tabela_inss = null 

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
        return 0;
    }

    this.getValorPlanilha = function(nome, dia, coluna) {
        console.log('passando na função default')
        return 300;
    }

    this.getVariavel = function(nome) {
        console.log('getVariavel default', nome)
        return "def1";
    }

    this.calcAliquota = function(dia, valor,tabela_inss) {
        var tab = tabela_inss[dia]
        // console.log( dia , JSON.stringify( tab ) ) 
        for (var i in tab) {
            // console.log(dia, tab[i].de, valor, tab[i].ate)
            if (tab[i].de <= valor && valor <= tab[i].ate ) {
                return tab[i]
            } 
        }
        return { aliquota: -1, teto: 0  }   
    }

    this.calc = function () {
        var totalINSS = 0 
        var totalBaseEmpregadorCorrgida = 0 
        var tabela_inss = this.pegaTabela('tabela_inss')
        
        for (var i in this.planilha) {
            var l  = this.planilha[i]

            if (typeof l.basePago === 'undefined') l.basePago = 0
            l.baseInssAcao = this.getINSS(i, 'sal13')  
            l.baseInssTotal = l.basePago + l.baseInssAcao 
            var t = this.calcAliquota( i, l.baseInssTotal,tabela_inss) 
            l.aliquota = t.aliquota 
            l.acaoAte = l.baseInssTotal * (t.aliquota / 100)
            if (typeof l.inssRetido === 'undefined') l.inssRetido = 0 
            var teto = t.teto - l.inssRetido
            if (teto < l.acaoAte) {
                l.recolher = teto
            } else {
                l.recolher = l.acaoAte
            }
            if (l.recolhar < 0) l.recolher = 0 

            l.indice = this.getValorPlanilha('base', i, "indiceCorrecao")  
            l.resultado = l.recolher * l.indice 
            l.baseCorrigidaEmpregador = l.baseInssAcao * l.indice 
    
            totalINSS += l.resultado  
            totalBaseEmpregadorCorrgida += l.baseCorrigidaEmpregador

            this.planilha[i] = l 
        }

        this.info.resultadoResumo = totalINSS 
        this.info.resultadoBaseEmpregadorCorrigida = totalBaseEmpregadorCorrgida 
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

