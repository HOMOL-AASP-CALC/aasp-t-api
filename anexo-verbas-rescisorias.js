const e = require('cors');
var calcUtil = require('./calcUtil.js');

module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'reflexo', 
        posicao: var1.posicao,
        titulo: '13o. salário, férias e verbas rescisórias', 
        prefixo: 'verbasRescisorias', 
        grupo: 'salario',
        id: 4, 
        visivel: 1,
        visivelLinhaResumo: 1,
        somarResumo: true,
        somarFGTS: true, 
        somarIRRF: true,
        somarINSS: true, 
        resultadoResumo: 0, 
        resultadoIRRF: 0,
        resultadoFGTS: 0,
        virgem: true,
        prop467: 0     
    }

    this.colunas = [
        { titulo: 'Data', tipo: 'data',  nome: "dia"},
        { titulo: 'Descrição', tipo: 'data', nome: "desc"},
        // { titulo: 'Proporção', tipo: 'proporcao', nome: "proporcao"},
        { titulo: 'Proporção', tipo: 'proporcao', nome: "strProporcao"},
        { titulo: 'Valor', tipo: 'f', casas: 2, nome: "valor", modal: "mVerbasRescisoriasBase"},
        { titulo: 'Valor Pago', tipo: 'v', casas: 2, nome: "valorPago"},
        { titulo: 'Diferença', tipo: 'f', casas: 2, nome: "diferenca"},
        { titulo: 'Índice Correção', tipo: 'f', casas:9, nome: "indice", modal: "mIndiceCorrecao"},
        { titulo: 'Resultado', tipo: 'f', casas: 2, nome:"resultado", somar: true},
        { titulo: 'FGTS', tipo: 'f', casas: 2, nome:"fgts", somar: true },
        { titulo: 'Base INSS', tipo: 'f', casas: 2, nome:"inss" },
        { titulo: 'Base IRRF', tipo: 'f', casas: 2, nome:"irrf", somar: true },
    ]

    this.planilha = []  
    this.ativarCorrecao = false 
    var that = this

    this.setAtivarCorrecao = function(b) {
        that.ativarCorrecao = true 
    }

    this.setup = function(si,sf, ampliar, vars) {
        // console.log('=====================')
        // console.log(vars)
        // console.log('=====================')

        if (!this.info.virgem) return; 
        // if (typeof vars === 'undefined') return; 
        this.planilha = []  
        // console.log('anexo-verbas-resc - ', si, sf, ampliar, vars)
        var x  = calcUtil.salario13(si, sf, ampliar )
        var ultimaProporcaoSal13 = 0 

        if (vars.salario || vars.sal13) {
            for (var i in x) {
                var dados = x[i] 
                this.setReflexo ({ 
                    index: -1, 
                    diaInt: dados.dia,
                    dia: calcUtil.mesAno2dia(dados.dia), 
                    desc: '13o. salário',
                    proporcao: dados.proporcao,
                    tipoCalc: 'sal13',
                    pa_ini: dados.pa_ini,
                    pa_fim: dados.pa_fim,
                    calcINSS: true,
                    calcIRRF: true,
                    calcFGTS: true,
                    calcSomar: true,
                    autor: 'automatico' 
                }) 
                ultimaProporcaoSal13 = dados.proporcao  
                // console.log('\n\n', dados)
            }
        }

        var x  = calcUtil.feriasTodas(si, sf, ampliar)
        var ultimaProporcaoFerias = 0 

        if (vars.ferias) {
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
                    pa_ini: dados.pa_ini,
                    pa_fim: dados.pa_fim,
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
                    pa_ini: dados.pa_ini,
                    pa_fim: dados.pa_fim,
                    proporcao: dados.prop,
                    tipoCalc: tipoCalc+'3', 
                    calcINSS: true,
                    calcIRRF: true,
                    calcFGTS: true,
                    calcSomar: true,
                    autor: 'automatico'  
                }) 
                ultimaProporcaoFerias = dados.prop * 1.333333333
            }
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

        if (vars.avisoPrevio) {
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
        var ultimaProporcaoAviso = calcUtil.diasAviso(si, sf)  
        
        // console.log('ultimaProporcaoSal13 ultimaProporcaoFerias ultimaProporcaoAviso', ultimaProporcaoSal13, ultimaProporcaoFerias, ultimaProporcaoAviso)
        this.info.prop467 = ((ultimaProporcaoSal13 + ultimaProporcaoFerias) / 12) + ( ultimaProporcaoAviso / 30)

        if (vars.multasRescisorias) {
            this.setReflexo ({ 
                index: -1, 
                diaInt: calcUtil.dia2intMesAno(sf),
                dia: sf, 
                desc: 'Multa do art. 477',
                proporcao: calcUtil.diasAviso(si, sf),
                tipoCalc: 'multa477', 
                pa_ini: ini ,
                pa_fim: sf,
                calcINSS: true,
                calcIRRF: true,
                calcFGTS: true,
                calcSomar: true,
                autor: 'automatico'  
            }) 
        }

        if (vars.saldoSalarial) {
            this.setReflexo ({ 
                index: -1, 
                diaInt: calcUtil.dia2intMesAno(sf),
                dia: sf, 
                desc: 'Saldo Salarial',
                proporcao: calcUtil.dia2intDia(sf),
                tipoCalc: 'saldoSalarial', 
                pa_ini: ini ,
                pa_fim: sf,
                calcINSS: true,
                calcIRRF: true,
                calcFGTS: true,
                calcSomar: true,
                autor: 'automatico'  
            }) 
        }
    }

    this.getValorPlanilha = function(nome, dia, coluna) {
        console.log('passando na função default - anexo-insalubridade-reflexos linha 59',nome, dia, coluna)
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
            if ((this.planilha[i].diaInt == dia) && (tipo != 'ferias' && tipo != 'sal13') && (this.planilha[i].tipoCalc == 'ap' || this.planilha[i].tipoCalc == 'saldoSalarial') && (this.planilha[i].calcINSS)) {
                // console.log(this.planilha[i])
                r += this.planilha[i].inss 
            }
            if ((this.planilha[i].diaInt == dia) && (tipo == 'ferias') && (this.planilha[i].tipoCalc != 'sal13' &&  this.planilha[i].tipoCalc != 'ap' &&  this.planilha[i].tipoCalc != 'saldoSalarial') && (this.planilha[i].calcINSS)) {
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

        var diaFim = this.getVariavel('datade')
        var iDiaFim = calcUtil.dia2intMesAno(diaFim)
        var ultimoSalario = this.getValorPlanilha('salario', iDiaFim, "salario")
        // var ultimosDias = calcUtil.dia2intDia(diaFim)
        var ultimoMes_qtdeDias = calcUtil.diasMes(diaFim)

        var checkGratA = this.getVariavel('checkGratA')
        var checkGratB = this.getVariavel('checkGratB')
        var checkGratC = this.getVariavel('checkGratC')
        var salarioReflex_base1 = this.getVariavel('salarioReflex_base1')
        var salarioReflex_base2 = this.getVariavel('salarioReflex_base2')
        var salarioReflex_base3 = this.getVariavel('salarioReflex_base3')
        var salarioReflex_base4 = this.getVariavel('salarioReflex_base4')
        var salarioReflex_base5 = this.getVariavel('salarioReflex_base5')
        var dsr = this.getVariavel('dsr')

        for (var i in this.planilha) {
            var l  = this.planilha[i]

            if (typeof l.calcSomar === 'undefined') l.calcSomar = true  
            if (typeof l.calcFGTS === 'undefined') l.calcFGTS = true  
            if (typeof l.calcINSS === 'undefined') l.calcINSS = true  
            if (typeof l.calcIRRF === 'undefined') l.calcIRRF = true  
            if (typeof l.valorPago === 'undefined') l.valorPago = 0
            
            l.strProporcao = ''

            // acerta  a base
            var valorBase = 0 
            if ( salarioReflex_base1 == "mes") valorBase += this.getValorPlanilha('salario', l.diaInt, "salario")
            if ( salarioReflex_base1 == "media") {
                var temp = this.getMediaPlanilha('salario', 'salario',  l.pa_ini, l.pa_fim, false)
                valorBase += temp.media  
            }

            if ( salarioReflex_base2 == "mes" && checkGratA)  valorBase += this.getValorPlanilha('salario', l.diaInt, "vrGratA")
            if ( salarioReflex_base2 == "media") {
                var temp = this.getMediaPlanilha('salario', 'vrGratA',  l.pa_ini, l.pa_fim, false)
                valorBase += temp.media  
            }

            if ( salarioReflex_base3 == "mes" && checkGratB) valorBase += this.getValorPlanilha('salario', l.diaInt, "vrGratB")
            if ( salarioReflex_base3 == "media") {
                var temp = this.getMediaPlanilha('salario', 'vrGratB',  l.pa_ini, l.pa_fim, false)
                valorBase += temp.media  
            }

            if ( salarioReflex_base4 == "mes" && checkGratC) valorBase += this.getValorPlanilha('salario', l.diaInt, "vrGratC")
            if ( salarioReflex_base4 == "media") {
                var temp = this.getMediaPlanilha('salario', 'vrGratC',  l.pa_ini, l.pa_fim, false)
                valorBase += temp.media  
            }

            if ( salarioReflex_base5 == "mes" && dsr) valorBase += this.getValorPlanilha('dsr', l.diaInt, "valor")
            if ( salarioReflex_base5 == "media") {
                var temp = this.getMediaPlanilha('dsr', 'valor',  l.pa_ini, l.pa_fim, false)
                valorBase += temp.media  
            }

            if (l.tipoCalc == 'ap') {
                l.valor = valorBase * (l.proporcao / 30)
                l.strProporcao = l.proporcao+' dias'
            } else {
                if (l.tipoCalc != 'outro') {
                    l.valor = valorBase * (l.proporcao / 12)
                    l.strProporcao = l.proporcao+' / 12'
                }
 
                if ((l.tipoCalc == 'fd') || (l.tipoCalc == 'fd3')) {
                    l.valor *= 2
                }
                if ((l.tipoCalc == 'fg3') || (l.tipoCalc == 'fi3') || (l.tipoCalc == 'fp3') || (l.tipoCalc == 'fd3')) {
                    l.valor = l.valor / 3;
                }

                if (l.tipoCalc == 'multa477') {
                    l.valor = ultimoSalario
                    l.strProporcao = ''
                }

                if (l.tipoCalc == 'multa467') {
                    l.valor = 0
                    var multa467metodo = l.multa467metodo 
                    if (multa467metodo == 'rescisao50') {
                        // console.log('this.info.prop467 ',this.info.prop467 )
                        l.valor = (this.info.prop467 / 2) * ultimoSalario
                    }
                    if (multa467metodo == 'saldo100') l.valor = ultimoSalario
                    if (multa467metodo == 'saldo50') l.valor = ultimoSalario / 2
                    
                    l.strProporcao = ''
                }

                if (l.tipoCalc == 'saldoSalarial') {
                    if ( this.ativarCorrecao) {
                        // console.log('====== corrigi o calc - l: 322 - anexo-verbas-rescisorias.js')
                        l.proporcao =  calcUtil.dia2intDia(diaFim)
                    }
                    
                    if (!l.proporcao) l.proporcao = ultimoMes_qtdeDias
                    l.valor = (ultimoSalario / ultimoMes_qtdeDias) * l.proporcao 
                    if (l.proporcao == 1) {
                        l.strProporcao = l.proporcao + ' dia' 
                    }
                    if (l.proporcao  > 1) {
                        l.strProporcao = l.proporcao + ' dias' 
                    }
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

        // console.log('setReflexo', dados)
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

        if (d.tipoCalc == 'outro') {
            d.valor = dados.valor 
        }

        if (d.tipoCalc == 'multa467') {
            d.multa467metodo = dados.multa467metodo 
        }

        if (dados.index==-1) {
            this.planilha.push(d)
        } else {
            if (typeof this.planilha[ dados.index ].valorPago !== 'undefined') {
                d.valorPago = this.planilha[ dados.index ].valorPago 
            } else {
                d.valorPago = 0
            }
            
            this.planilha[ dados.index ] = d 
        }

        this.planilha = this.planilha.sort((a,b) => (a.diaInt > b.diaInt) ? 1 : ((b.diaInt > a.diaInt) ? -1 : 0)) 
        if (dados.autor != 'automatico') this.calc () 
    }

    this.deleteReflexo = function (linha) {
        this.planilha.splice(linha, 1)
        this.info.virgem = false 
        this.calc () 

        // console.table(this.planilha)
    }

    this.set = function(dia, coluna, valor) {
        if (dia == 'info') {
            this.info[coluna] = valor 
        } else {
            this.info.virgem = false 
            this.planilha[dia][coluna] = valor 
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
            
            this.setup(var1.inicio, var1.fim, var1.ampliar, var1)
        }
    }
  
}

