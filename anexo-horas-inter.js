module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'Horas interjornada', 
        prefixo: 'horasInter', 
        grupo: 'horasInter',
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
        { titulo: 'Base', tipo: 'f', casas: 2, nome: "base",  modal: "mHorasInterBase"},
        { titulo: 'Divisor', tipo: 'v', casas: 2, nome: "divisor"},
        { titulo: 'Salario Hora', tipo: 'f', casas: 2, nome: "salarioHora"},
        { titulo: 'Horas interjornada', tipo: 'f', casas: 2, nome: "horasNormais"},
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
        var HInter_base1 = this.getVariavel('HInter_base1') 
        var HInter_base2 = this.getVariavel('HInter_base2') 
        var HInter_base3 = this.getVariavel('HInter_base3') 
        var HInter_base4 = this.getVariavel('HInter_base4') 
        var HInter_base5 = this.getVariavel('HInter_base5') 
        var HInter_base6 = this.getVariavel('HInter_base6') 
        var HInter_base7 = this.getVariavel('HInter_base7')
        var HInter_base8 = this.getVariavel('HInter_base8')
        var HInter_baseVC = this.getVariavel('HInter_baseVC')

        var baseVC_existe = false
        for (var avc in HInter_baseVC) {
            if (HInter_baseVC[ avc ] && this.getVariavel( avc ) ) {
                baseVC_existe = true
            }
        }

        if (typeof HInter_base1 === 'undefined') { HInter_base1 = false; }
        if (typeof HInter_base2 === 'undefined') { HInter_base2 = false; }
        if (typeof HInter_base3 === 'undefined') { HInter_base3 = false; }
        if (typeof HInter_base4 === 'undefined') { HInter_base4 = false; }
        if (typeof HInter_base5 === 'undefined') { HInter_base5 = false; }
        if (typeof HInter_base6 === 'undefined') { HInter_base6 = false; }
        if (typeof HInter_base7 === 'undefined') { HInter_base7 = false; }
        if (typeof HInter_base8 === 'undefined') { HInter_base8 = false; }

        if (!HInter_base1 && !HInter_base2 && !HInter_base3 && !HInter_base4 && !HInter_base5 && !HInter_base6 && !HInter_base7  && !HInter_base8 && !baseVC_existe) {
            HInter_base1 = true 
        }

        for (var i in this.planilha) {
            var l  = this.planilha[i]
            
            l.base = 0
            if (HInter_base1) { l.base += this.getValorPlanilha('salario', i, "salario") }
            if (HInter_base2 && checkGratA) { l.base += this.getValorPlanilha('salario', i, "vrGratA") }
            if (HInter_base3 && checkGratB) { l.base += this.getValorPlanilha('salario', i, "vrGratB") }
            if (HInter_base4 && checkGratC) { l.base += this.getValorPlanilha('salario', i, "vrGratC") }
            if (HInter_base5 && insalubridade) { l.base += this.getValorPlanilha('insalubridade', i, "valor") }
            if (HInter_base6 && periculosidade) { l.base += this.getValorPlanilha('periculosidade', i, "valor") }
            if (HInter_base7 && equiparacaoSalarial) { l.base += this.getValorPlanilha('equiparacaoSalarial', i, "diferenca") }
            if (HInter_base8 && diferencasSalariais) { l.base += this.getValorPlanilha('diferencasSalariais', i, "diferenca") }

            for (var avc in HInter_baseVC) {
                if (HInter_baseVC[ avc ] && this.getVariavel( avc ) ) {
                    l.base += this.getValorPlanilha(avc, i, "valor")
                }
            }
            
            if ((typeof l.divisor === 'undefined') || (l.divisor == 0)) {
                l.divisor = 220  
            }
            l.salarioHora = l.base / l.divisor 
            l.horasNormais = this.getValorPlanilha('horasInterConversao', i, "horasNormais")  
            l.valor =  l.salarioHora * l.horasNormais 
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

