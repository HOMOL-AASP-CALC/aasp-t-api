const e = require('cors');

module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'reflexo', 
        posicao: var1.posicao,
        titulo: 'Reflexo das diferenças salariais nas demais verbas', 
        prefixo: 'diferencasSalariaisReflexos', 
        grupo: 'diferencasSalariais',
        id: 3, 
        visivel: 1,
        visivelLinhaResumo: 1,
        somarResumo: true, 
        somarFGTS: true, 
        somarIRRF: true,
        somarINSS: true, 
        resultadoResumo: 0, 
        resultadoIRRF: 0,
        resultadoFGTS: 0,
        virgem: true    
    }

    this.colunas = [
        { titulo: 'Data', tipo: 'data',  nome: "dia"},
        { titulo: 'Descrição', tipo: 'data', nome: "desc"},
        { titulo: 'Proporção', tipo: 'proporcao', nome: "strProporcao"},
        { titulo: 'Valor', tipo: 'f', casas: 2, nome: "valor"},
        { titulo: 'Valor Pago', tipo: 'v', casas: 2, nome: "valorPago"},
        { titulo: 'Diferença', tipo: 'f', casas: 2, nome: "diferenca"},
        { titulo: 'Índice Correção', tipo: 'f', casas:9, nome: "indice", modal: "mIndiceCorrecao"},
        { titulo: 'Resultado', tipo: 'f', casas: 2, nome:"resultado", somar: true},
        { titulo: 'FGTS', tipo: 'f', casas: 2, nome:"fgts", somar: true },
        { titulo: 'Base INSS', tipo: 'f', casas: 2, nome:"inss" },
        { titulo: 'Base IRRF', tipo: 'f', casas: 2, nome:"irrf", somar: true },
    ]

    this.planilha = []  

    this.setup = function(si,sf, ampliar) {
        if (!this.info.virgem) return; 

        this.planilha = []  

        var x  = calcUtil.salario13(si, sf, ampliar)

        for (var i in x) {
            var dados = x[i] 
            this.setReflexo ({ 
                index: -1, 
                diaInt: dados.dia,
                dia: calcUtil.mesAno2dia(dados.dia), 
                desc: '13o. salário',
                proporcao: dados.proporcao,
                tipoCalc: 'sal13',
                calcINSS: true,
                calcIRRF: true,
                calcFGTS: true,
                calcSomar: true,
                autor: 'automatico' 
            })  
        }

        var x  = calcUtil.feriasTodas(si, sf, ampliar)
        // console.log(x)

        for (var i in x) {
            var dados = x[i] 
            if (dados.tipo == 'g') {
                var desc = 'Férias Gozadas' 
                var tipoCalc = 'fg'
            } else {
                var desc = 'Férias Proporcionais' 
                var tipoCalc = 'fp'
            }
            this.setReflexo ({ 
                index: -1, 
                diaInt: dados.dia,
                dia: calcUtil.mesAno2dia(dados.dia), 
                desc,
                proporcao: dados.prop,
                tipoCalc, 
                calcINSS: true,
                calcIRRF: true,
                calcFGTS: true,
                calcSomar: true, 
                autor: 'automatico' 
            })  
            this.setReflexo ({ 
                index: -1, 
                diaInt: dados.dia,
                dia: calcUtil.mesAno2dia(dados.dia), 
                desc: 'Abono de férias das '+desc,
                proporcao: dados.prop,
                tipoCalc: tipoCalc+'3', 
                calcINSS: true,
                calcIRRF: true,
                calcFGTS: true,
                calcSomar: true,
                autor: 'automatico'  
            }) 
        }

        var ini1 = calcUtil.diminuiAno(sf)
        var ini2 = calcUtil.dia2yyyymmdd( ini1 )
        var intIni = parseInt( ini2 )
        var intDataAd = parseInt( calcUtil.dia2yyyymmdd( si ) )
        if (intIni < intDataAd) {
            var ini = si
        } else {
            var ini = ini1
        }

        this.setReflexo ({ 
            index: -1, 
            diaInt: calcUtil.dia2intMesAno(sf),
            dia: sf, 
            desc: 'Aviso Prévio',
            proporcao: calcUtil.diasAviso(si, sf),
            tipoCalc: 'ap', 
            pa_ini: ini ,
            pa_fim: sf,
            calcINSS: true,
            calcIRRF: true,
            calcFGTS: true,
            calcSomar: true,
            autor: 'automatico'  
        })      
    }

    this.getValorPlanilha = function(nome, dia, coluna) {
        console.log('passando na função default - anexo-periculosidade-reflexos linha 59',nome, dia, coluna)
        return 0;
    }

    this.resINSS = function( dia, tipo ) {
        var r = 0
        if (this.info.visivel!=1) return 0;

        for (var i in this.planilha) {
            if ((this.planilha[i].diaInt == dia) && (tipo == 'sal13') && (this.planilha[i].tipoCalc == 'sal13') && (this.planilha[i].calcINSS)) {
                // console.log(this.planilha[i])
                r += this.planilha[i].inss 
            }
            if ((this.planilha[i].diaInt == dia) && (tipo != 'ferias' && tipo != 'sal13') && (this.planilha[i].tipoCalc == 'ap') && (this.planilha[i].calcINSS)) {
                // console.log(this.planilha[i])
                r += this.planilha[i].inss 
            }
            if ((this.planilha[i].diaInt == dia) && (tipo == 'ferias') && (this.planilha[i].tipoCalc != 'sal13' &&  this.planilha[i].tipoCalc != 'ap') && (this.planilha[i].calcINSS)) {
                // console.log(this.planilha[i])
                r += this.planilha[i].inss 
            }
        }

        return r; // (this.info.somarINSS) ? this.planilha[ dia ].inss : 0 
    }

    this.calc = function () {
        var totalResumo = 0 
        var totalIRRF = 0
        var totalFGTS = 0

        for (var i in this.planilha) {
            var l  = this.planilha[i]

            if (typeof l.calcSomar === 'undefined') l.calcSomar = true  
            if (typeof l.calcFGTS === 'undefined') l.calcFGTS = true  
            if (typeof l.calcINSS === 'undefined') l.calcINSS = true  
            if (typeof l.calcIRRF === 'undefined') l.calcIRRF = true  
            if (typeof l.valorPago === 'undefined') l.valorPago = 0

            if (l.tipoCalc == 'ap') {
                l.valor = this.getValorPlanilha('diferencasSalariais', l.diaInt, "diferenca") * (l.proporcao / 30)
                l.strProporcao = l.proporcao + ' dias'
            } else {
                l.valor = this.getValorPlanilha('diferencasSalariais', l.diaInt, "diferenca") * (l.proporcao / 12)
                l.strProporcao = l.proporcao + ' / 12'

                if ((l.tipoCalc == 'fd') || (l.tipoCalc == 'fd3')) {
                    l.valor *= 2
                }
                if ((l.tipoCalc == 'fg3') || (l.tipoCalc == 'fi3') || (l.tipoCalc == 'fp3') || (l.tipoCalc == 'fd3')) {
                    l.valor = l.valor / 3;
                }
            }

                 
            l.diferenca = l.valor - l.valorPago 
            l.indice = this.getValorPlanilha('base', l.diaInt, "indiceCorrecao")
            l.resultadoCalc = l.diferenca * l.indice 
            l.resultado = (l.calcSomar) ? l.resultadoCalc : 0
            l.fgts = (l.calcFGTS) ? l.resultadoCalc * 0.08 : 0
            l.inss = (l.calcINSS) ? l.diferenca : 0
            l.irrf = (l.calcIRRF) ? l.resultadoCalc : 0 
            
            totalResumo += l.resultado 
            totalIRRF += l.irrf
            totalFGTS += l.fgts 
            this.planilha[i] = l 
        }
        this.info.resultadoResumo = totalResumo 
        this.info.resultadoIRRF = totalIRRF 
        this.info.resultadoFGTS = totalFGTS
    }

    this.setReflexo = function(dados) {
        if (dados.autor != 'automatico') this.info.virgem = false;

        if (dados.autor == 'importado') {
            if (this.planilha.length > 0) {
                if (this.planilha[0].autor == 'automatico') {
                    this.planilha = [] 
                }
            }
        }
        
        var d = { 
            diaInt: dados.diaInt,
            dia: calcUtil.mesAno2dia(dados.diaInt), 
            desc: dados.desc,
            proporcao: dados.proporcao,
            pa_ini: dados.pa_ini,
            pa_fim: dados.pa_fim, 
            tipoCalc: dados.tipoCalc,
            calcINSS: dados.calcINSS,
            calcIRRF: dados.calcIRRF,
            calcFGTS: dados.calcFGTS,
            calcSomar: dados.calcSomar,
            valorPago: dados.valorPago, 
            autor: dados.autor   
        }

        if (dados.index==-1) {
            this.planilha.push(d)
        } else {
            this.planilha[ dados.index ] = d 
        }
        this.planilha = this.planilha.sort((a,b) => (a.diaInt > b.diaInt) ? 1 : ((b.diaInt > a.diaInt) ? -1 : 0)) 
        if (dados.autor != 'automatico') this.calc () 
    }

    this.deleteReflexo = function (linha) {
        this.planilha.splice(linha, 1)
        this.calc () 
    }

    this.set = function(dia, coluna, valor) {
        if (dia == 'info') {
            this.info[coluna] = valor 
        } else {
            this.planilha[dia][coluna] = valor 
            this.calc () 
        }
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

