module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'Adicional noturno', 
        prefixo: 'adicionalNoturno', 
        grupo: 'adicionalNoturno',
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
        { titulo: 'Salário', tipo: 'f', casas: 2, nome: "base",  modal: "mAdicionalNoturnoBase"},

        { titulo: 'Divisor', tipo: 'v', casas: 2, nome: "divisor"},
        { titulo: 'Percentual', tipo: 'v', casas: 2, nome: "percentual"},

        { titulo: 'Salario Hora Noturno', tipo: 'f', casas: 2, nome: "salarioHora"},
        { titulo: 'Horas noturnas normais', tipo: 'h', casas: 2, nome: "horasNoturnasNormais",  modal: "mAdicionalNoturnoImportar"},
        { titulo: 'Horas extras noturnas', tipo: 'f', casas: 2, nome: "horasExtrasNoturnas"},
        { titulo: 'Total horas noturnas', tipo: 'f', casas: 2, nome: "totalHorasNoturnas"},

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

        var modo = this.getVariavel('modoDigitacaoHora') 
        var horasExtras = this.getVariavel('horasExtras')
        var horasExtrasSomenteAdic = this.getVariavel('horasExtrasSomenteAdic')
        var insalubridade = this.getVariavel('insalubridade')
        var periculosidade = this.getVariavel('periculosidade')
        var equiparacaoSalarial = this.getVariavel('equiparacaoSalarial')
        var diferencasSalariais = this.getVariavel('diferencasSalariais')
        var checkGratA = this.getVariavel('checkGratA')
        var checkGratB = this.getVariavel('checkGratB')
        var checkGratC = this.getVariavel('checkGratC')
        var AdicNot_base1 = this.getVariavel('AdicNot_base1') 
        var AdicNot_base2 = this.getVariavel('AdicNot_base2') 
        var AdicNot_base3 = this.getVariavel('AdicNot_base3') 
        var AdicNot_base4 = this.getVariavel('AdicNot_base4') 
        var AdicNot_base5 = this.getVariavel('AdicNot_base5') 
        var AdicNot_base6 = this.getVariavel('AdicNot_base6') 
        var AdicNot_base7 = this.getVariavel('AdicNot_base7')
        var AdicNot_base8 = this.getVariavel('AdicNot_base8')
        var AdicNot_baseVC = this.getVariavel('AdicNot_baseVC')

        var baseVC_existe = false
        for (var avc in AdicNot_baseVC) {
            if (AdicNot_baseVC[ avc ] && this.getVariavel( avc ) ) {
                baseVC_existe = true
            }
        }

        if (typeof AdicNot_base1 === 'undefined') { AdicNot_base1 = false; }
        if (typeof AdicNot_base2 === 'undefined') { AdicNot_base2 = false; }
        if (typeof AdicNot_base3 === 'undefined') { AdicNot_base3 = false; }
        if (typeof AdicNot_base4 === 'undefined') { AdicNot_base4 = false; }
        if (typeof AdicNot_base5 === 'undefined') { AdicNot_base5 = false; }
        if (typeof AdicNot_base6 === 'undefined') { AdicNot_base6 = false; }
        if (typeof AdicNot_base7 === 'undefined') { AdicNot_base7 = false; }
        if (typeof AdicNot_base8 === 'undefined') { AdicNot_base8 = false; }

        if (!AdicNot_base1 && !AdicNot_base2 && !AdicNot_base3 && !AdicNot_base4 && !AdicNot_base5 && !AdicNot_base6 && !AdicNot_base7  && !AdicNot_base8 && !baseVC_existe) {
            AdicNot_base1 = true 
        }

        for (var i in this.planilha) {
            var l  = this.planilha[i]
            
            l.base = 0
            if (AdicNot_base1) { l.base += this.getValorPlanilha('salario', i, "salario") }
            if (AdicNot_base2 && checkGratA) { l.base += this.getValorPlanilha('salario', i, "vrGratA") }
            if (AdicNot_base3 && checkGratB) { l.base += this.getValorPlanilha('salario', i, "vrGratB") }
            if (AdicNot_base4 && checkGratC) { l.base += this.getValorPlanilha('salario', i, "vrGratC") }
            if (AdicNot_base5 && insalubridade) { l.base += this.getValorPlanilha('insalubridade', i, "valor") }
            if (AdicNot_base6 && periculosidade) { l.base += this.getValorPlanilha('periculosidade', i, "valor") }
            if (AdicNot_base7 && equiparacaoSalarial) { l.base += this.getValorPlanilha('equiparacaoSalarial', i, "diferenca") }
            if (AdicNot_base8 && diferencasSalariais) { l.base += this.getValorPlanilha('diferencasSalariais', i, "diferenca") }
            
            for (var avc in AdicNot_baseVC) {
                if (AdicNot_baseVC[ avc ] && this.getVariavel( avc ) ) {
                    l.base += this.getValorPlanilha(avc, i, "valor")
                }
            }


            if ((typeof l.divisor === 'undefined') || (l.divisor == 0)) {
                l.divisor = 220  
            }
            if (!l.percentual) l.percentual = 20
            if (!l.horasNoturnasNormais) l.horasNoturnasNormais = '00:00' 
            l.horasNoturnasNormais = calcUtil.formataHora3( l.horasNoturnasNormais )
            if (modo == 'd') {
                l.horasNoturnasNormais = l.horasNoturnasNormais.replace(':', ',')
            }

            l.salarioHora = (l.base / l.divisor) * (l.percentual/100) 

            l.horasExtrasNoturnas = 0
            if (horasExtras) l.horasExtrasNoturnas += this.getValorPlanilha('conversaoHEHA', i, "hen") 
            if (horasExtrasSomenteAdic) l.horasExtrasNoturnas += this.getValorPlanilha('conversaoHESA', i, "hen")

            var horasNoturnasNormaisDec = 0 
            if (typeof l.horasNoturnasNormais !== 'undefined' && l.horasNoturnasNormais.length==6) {
                var h = calcUtil.hora2intHora( l.horasNoturnasNormais )
                var m = calcUtil.hora2intMinuto( l.horasNoturnasNormais )
                if (modo == 's') { m = (m/60)*100 } 
                horasNoturnasNormaisDec += (h + (m/100)) 
            }

            l.totalHorasNoturnas = l.horasExtrasNoturnas + horasNoturnasNormaisDec 
            
            l.valor =  l.salarioHora * l.totalHorasNoturnas 
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

    this.converteBaseNumerica = function (novaBase) { 
        for (var i in this.planilha) {
            var l  = this.planilha[i]

            if (novaBase == 'd') {
                l.horasNoturnasNormais = calcUtil.horaStoD(l.horasNoturnasNormais)
            } else {
                l.horasNoturnasNormais = calcUtil.horaDtoS(l.horasNoturnasNormais)
            }

            this.planilha[i] = l 
        }
    } 

    this.set = function(dia, coluna, valor, nao_repetir) {
        if (dia == 'info') {
            this.info[coluna] = valor 
        } else {
            if (typeof this.planilha[dia] !== 'undefined') {
                this.planilha[dia][coluna] = valor
            }
             
            if (nao_repetir != 'nao_repetir') {
                while (( this.getVariavel('repetirValor') ) && (typeof this.planilha[++dia] !== 'undefined')) {
                    this.planilha[dia][coluna] = valor
                }
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

