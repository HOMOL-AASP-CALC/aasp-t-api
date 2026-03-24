
module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'Periculosidade', 
        prefixo: 'periculosidade', 
        grupo: 'periculosidade',
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
        { titulo: 'Base', tipo: 'f', casas: 2, nome: "base",  modal: "mPericulosidadeBase"},
        { titulo: 'Grau', tipo: 'v', casas: 2, nome: "grau"},
        { titulo: 'Valor', tipo: 'f', casas: 2, nome: "valor"},
        { titulo: 'Valor Pago', tipo: 'v', casas: 2, nome: "valorPago"},
        { titulo: 'Diferença', tipo: 'f', casas: 2, nome: "diferenca"},
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
        // base antiga
        var base = this.getVariavel('insalubridadeBase')

        // base nova
        var equiparacaoSalarial = this.getVariavel('equiparacaoSalarial')
        var diferencasSalariais = this.getVariavel('diferencasSalariais')
        var checkGratA = this.getVariavel('checkGratA')
        var checkGratB = this.getVariavel('checkGratB')
        var checkGratC = this.getVariavel('checkGratC')
        var PericReflex_base1 = this.getVariavel('PericReflex_base1') 
        var PericReflex_base2 = this.getVariavel('PericReflex_base2') 
        var PericReflex_base3 = this.getVariavel('PericReflex_base3') 
        var PericReflex_base4 = this.getVariavel('PericReflex_base4') 
        var PericReflex_base5 = this.getVariavel('PericReflex_base5') 
        var PericReflex_base6 = this.getVariavel('PericReflex_base6') 
        var PericReflex_base7 = this.getVariavel('PericReflex_base7') 
        var PericReflex_base8 = this.getVariavel('PericReflex_base8') 
        var PericReflex_baseVC = this.getVariavel('PericReflex_baseVC')

        var vcTemp  = false
        for (var i in PericReflex_baseVC) {
            if (PericReflex_baseVC[i]) vcTemp = true 
        }

        if ((!PericReflex_base1) && (!PericReflex_base2) && (!PericReflex_base3) && (!PericReflex_base4) 
            && (!PericReflex_base5) && (!PericReflex_base7) && (!PericReflex_base8) && (!vcTemp)) {
                if (base == 'salmin') {
                    PericReflex_base5 = true
                } else {
                    PericReflex_base1 = true  // salario minimo
                }
            }

        for (var i in this.planilha) {
            var l  = this.planilha[i]

            l.base = 0 
            if (PericReflex_base1) { l.base += this.getValorPlanilha('salario', i, "salario") }
            if (PericReflex_base2 && checkGratA) { l.base += this.getValorPlanilha('salario', i, "vrGratA") }
            if (PericReflex_base3 && checkGratB) { l.base += this.getValorPlanilha('salario', i, "vrGratB") }
            if (PericReflex_base4 && checkGratC) { l.base += this.getValorPlanilha('salario', i, "vrGratC") }
            if (PericReflex_base5) { l.base += this.getValorPlanilha('base', i, 'salarioMinimo') }
            if (PericReflex_base7 && equiparacaoSalarial) { l.base += this.getValorPlanilha('equiparacaoSalarial', i, "diferenca") }
            if (PericReflex_base8 && diferencasSalariais) { l.base += this.getValorPlanilha('diferencasSalariais', i, "diferenca") }

            for (var avc in PericReflex_baseVC) {
                // console.log('l: 105 ------- ', PericReflex_baseVC[ avc ] ,this.getVariavel( avc ) )
                if (PericReflex_baseVC[ avc ] && this.getVariavel( avc ) ) {
                    l.base += this.getValorPlanilha(avc, i, "valor")
                }
            }
              
            if (typeof l.grau === 'undefined') l.grau = 30
            l.valorIntegral = l.base * ( l.grau / 100 )
            l.valor = l.valorIntegral * this.getValorPlanilha('base', i, 'proporcao')
            if (!l.valorPago) l.valorPago = 0 
            l.diferenca = l.valor - l.valorPago  
            l.indice = this.getValorPlanilha('base', i, "indiceCorrecao")
            l.resultado = l.diferenca * l.indice 
            l.fgts = l.resultado * 0.08 
            l.inss = l.diferenca

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

