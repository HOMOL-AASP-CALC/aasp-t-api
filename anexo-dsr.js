
module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'Descansos semanais remunerados', 
        prefixo: 'dsr', 
        grupo: 'salario',
        id: 7, 
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
        { titulo: 'Base', tipo: 'f', casas: 2, nome: "base",  modal: "mDSRBase"},
        { titulo: 'Dias úteis', tipo: 'data', casas: 2, nome: "diasU", modal: "mDSR"},
        { titulo: 'Dias Descanso', tipo: 'data', casas: 2, nome: "diasD", modal: "mDSR"},
        { titulo: 'Valor', tipo: 'f', casas: 2, nome: "valor"},
        { titulo: 'Valor Pago', tipo: 'v', casas: 2, nome: "valorPago"},
        { titulo: 'Diferença', tipo: 'f', casas: 2, nome: "diferenca"},
        { titulo: 'Índice Correção', tipo: 'f', casas:9, nome: "indice", modal: "mIndiceCorrecao"},
        { titulo: 'Resultado', tipo: 'f', casas: 2, nome:"resultado",  somar: true },
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
        if (this.info.visivel!=1) return 0;
        return (this.info.somarINSS && tipo!='sal13' && tipo!='ferias') ? this.planilha[ dia ].inss : 0 
    }

    this.calc = function () {
        var totalResumo = 0 
        var totalFGTS = 0
        var totalIRRF = 0 

        var equiparacaoSalarial = this.getVariavel('equiparacaoSalarial')
        var diferencasSalariais = this.getVariavel('diferencasSalariais')
        var checkGratA = this.getVariavel('checkGratA')
        var checkGratB = this.getVariavel('checkGratB')
        var checkGratC = this.getVariavel('checkGratC')
        var DSR_base1 = this.getVariavel('DSR_base1') 
        var DSR_base2 = this.getVariavel('DSR_base2') 
        var DSR_base3 = this.getVariavel('DSR_base3') 
        var DSR_base4 = this.getVariavel('DSR_base4') 
        var DSR_base5 = this.getVariavel('DSR_base5') 
        var DSR_base6 = this.getVariavel('DSR_base6')
        var DSR_baseVC = this.getVariavel('DSR_baseVC')

        var baseVC_existe = false
        for (var avc in DSR_baseVC) {
            if (DSR_baseVC[ avc ] && this.getVariavel( avc ) ) {
                baseVC_existe = true
            }
        }


        if (typeof DSR_base1 === 'undefined') { DSR_base1 = false; }
        if (typeof DSR_base2 === 'undefined') { DSR_base2 = false; }
        if (typeof DSR_base3 === 'undefined') { DSR_base3 = false; }
        if (typeof DSR_base4 === 'undefined') { DSR_base4 = false; }
        if (typeof DSR_base5 === 'undefined') { DSR_base5 = false; }
        if (typeof DSR_base6 === 'undefined') { DSR_base6 = false; }

        if (!DSR_base1 && !DSR_base2 && !DSR_base3 && !DSR_base4 && !DSR_base5 && !DSR_base6  && !baseVC_existe) {
            DSR_base1 = true 
        }

        for (var i in this.planilha) {
            var l  = this.planilha[i]

            if (typeof l.valorPago === 'undefined') l.valorPago = 0 

            // l.base = this.getValorPlanilha('salario', i, "salarioEfetivo")  // base

            l.base = 0
            if (DSR_base1) { l.base += this.getValorPlanilha('salario', i, "salario") }
            if (DSR_base2 && checkGratA) { l.base += this.getValorPlanilha('salario', i, "vrGratA") }
            if (DSR_base3 && checkGratB) { l.base += this.getValorPlanilha('salario', i, "vrGratB") }
            if (DSR_base4 && checkGratC) { l.base += this.getValorPlanilha('salario', i, "vrGratC") }
            if (DSR_base5 && equiparacaoSalarial) { l.base += this.getValorPlanilha('equiparacaoSalarial', i, "diferenca") }
            if (DSR_base6 && diferencasSalariais) { l.base += this.getValorPlanilha('diferencasSalariais', i, "diferenca") }

            for (var avc in DSR_baseVC) {
                // console.log('l: 105 ------- ', HEReflex_baseVC[ avc ] ,this.getVariavel( avc ) )
                if (DSR_baseVC[ avc ] && this.getVariavel( avc ) ) {
                    l.base += this.getValorPlanilha(avc, i, "valor")
                }
            }


            l.diasU = this.getValorPlanilha('base', i, "dsrU")
            l.diasD = this.getValorPlanilha('base', i, "dsrD") 
            if (l.diasU>0) {
                l.valor = (l.base / l.diasU) * l.diasD
            } else {
                l.valor = 0
            }
            l.diferenca = l.valor - l.valorPago 
            l.indice = this.getValorPlanilha('base', i, "indiceCorrecao")
            l.resultado = l.diferenca * l.indice 
            l.fgts = l.resultado * 0.08 // fgts
            l.inss = l.diferenca  
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

