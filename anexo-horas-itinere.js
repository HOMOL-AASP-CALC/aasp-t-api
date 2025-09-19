module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'Horas in itinere', 
        prefixo: 'horasItinere', 
        grupo: 'horasItinere',
        id: 21, 
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
        { titulo: 'Base', tipo: 'f', casas: 2, nome: "base",  modal: "mHorasItinereBase"},
        { titulo: 'Divisor', tipo: 'v', casas: 2, nome: "divisor"},
        { titulo: 'Salario Hora', tipo: 'f', casas: 2, nome: "salarioHora"},
        { titulo: 'Horas in itinere', tipo: 'f', casas: 2, nome: "horasExtras"},
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

        var insalubridade = this.getVariavel('insalubridade')
        var periculosidade = this.getVariavel('periculosidade')
        var equiparacaoSalarial = this.getVariavel('equiparacaoSalarial')
        var diferencasSalariais = this.getVariavel('diferencasSalariais')
        var checkGratA = this.getVariavel('checkGratA')
        var checkGratB = this.getVariavel('checkGratB')
        var checkGratC = this.getVariavel('checkGratC')
        var HI_base1 = this.getVariavel('HI_base1') 
        var HI_base2 = this.getVariavel('HI_base2') 
        var HI_base3 = this.getVariavel('HI_base3') 
        var HI_base4 = this.getVariavel('HI_base4') 
        var HI_base5 = this.getVariavel('HI_base5') 
        var HI_base6 = this.getVariavel('HI_base6') 
        var HI_base7 = this.getVariavel('HI_base7')
        var HI_base8 = this.getVariavel('HI_base8')
        var HI_baseVC = this.getVariavel('HI_baseVC')

        var baseVC_existe = false
        for (var avc in HI_baseVC) {
            if (HI_baseVC[ avc ] && this.getVariavel( avc ) ) {
                baseVC_existe = true
            }
        }

        if (typeof HI_base1 === 'undefined') { HI_base1 = false; }
        if (typeof HI_base2 === 'undefined') { HI_base2 = false; }
        if (typeof HI_base3 === 'undefined') { HI_base3 = false; }
        if (typeof HI_base4 === 'undefined') { HI_base4 = false; }
        if (typeof HI_base5 === 'undefined') { HI_base5 = false; }
        if (typeof HI_base6 === 'undefined') { HI_base6 = false; }
        if (typeof HI_base7 === 'undefined') { HI_base7 = false; }
        if (typeof HI_base8 === 'undefined') { HI_base8 = false; }

        if (!HI_base1 && !HI_base2 && !HI_base3 && !HI_base4 && !HI_base5 && !HI_base6 && !HI_base7  && !HI_base8 && !baseVC_existe) {
            HI_base1 = true 
        }

        for (var i in this.planilha) {
            var l  = this.planilha[i]
            
            l.base = 0
            if (HI_base1) { l.base += this.getValorPlanilha('salario', i, "salario") }
            if (HI_base2 && checkGratA) { l.base += this.getValorPlanilha('salario', i, "vrGratA") }
            if (HI_base3 && checkGratB) { l.base += this.getValorPlanilha('salario', i, "vrGratB") }
            if (HI_base4 && checkGratC) { l.base += this.getValorPlanilha('salario', i, "vrGratC") }
            if (HI_base5 && insalubridade) { l.base += this.getValorPlanilha('insalubridade', i, "valor") }
            if (HI_base6 && periculosidade) { l.base += this.getValorPlanilha('periculosidade', i, "valor") }
            if (HI_base7 && equiparacaoSalarial) { l.base += this.getValorPlanilha('equiparacaoSalarial', i, "diferenca") }
            if (HI_base8 && diferencasSalariais) { l.base += this.getValorPlanilha('diferencasSalariais', i, "diferenca") }
     
            for (var avc in HI_baseVC) {
                if (HI_baseVC[ avc ] && this.getVariavel( avc ) ) {
                    l.base += this.getValorPlanilha(avc, i, "valor")
                }
            }
            
            if ((typeof l.divisor === 'undefined') || (l.divisor == 0)) {
                l.divisor = 220  
            }
            l.salarioHora = l.base / l.divisor 
            l.horasExtras = this.getValorPlanilha('horasItinereConversao', i, "horasNormais")  
            l.valor =  l.salarioHora * l.horasExtras 
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

