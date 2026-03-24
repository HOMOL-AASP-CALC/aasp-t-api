
module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'Conversão de horas intrajornada em horas normais', 
        prefixo: 'horasIntraConversao', 
        grupo: 'horasIntra',
        id: 20, 
        visivel: 1,
        visivelLinhaResumo: 0,
        somarResumo: false, 
        somarFGTS: false, 
        somarIRRF: false,
        somarINSS: false, 
        impressaoObrigatoria: true, 
        resultadoResumo: 0, 
        resultadoFGTS: 0,
        resultadoIRRF: 0 
    }

    this.colunas = [  ]
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
        return  0 
    }

    this.calc = function () {
        if (typeof this.info.impressaoObrigatoria === 'undefined') this.info.impressaoObrigatoria = true;
        var modo = this.getVariavel('modoDigitacaoHora')
        var horasIntraMetodo = this.getVariavel('horasIntraMetodo')

        this.colunas = [] 
        this.colunas.push({titulo: 'Data', tipo: 'data',  nome: "dia"})

        this.colunas.push( { titulo: 'Horas intrajornada', tipo: 'h', casas: 2, nome: "horas",  modal: "mModoDigitacaoHora"} )
        this.colunas.push( { titulo: 'Percentual', tipo: 'v', casas: 2, nome: "percentual",  modal: "mMetodologiaHorasIntra"} )
        this.colunas.push( { titulo: 'Horas Normais (em decimal)', tipo: 'f', casas: 2, nome: "horasNormais" } )

        var h = 0
        var m = 0 

        for (var i in this.planilha) {
            var l  = this.planilha[i]

            l.horasNormais = 0 
            if (typeof l.horas === 'undefined') l.horas = '0'  
            l.horas = calcUtil.formataHora3( l.horas )

            if (modo == 'd') {
                l.horas = l.horas.replace(':', ',')
            }

            if (typeof l.percentual === 'undefined') l.percentual = 50 
            if (l.horas.length==6) {
                h = calcUtil.hora2intHora( l.horas )
                m = calcUtil.hora2intMinuto( l.horas )
                if (modo == 's') { m = (m/60)*100 } 
                if (horasIntraMetodo == 'horaPercentual') {
                    l.horasNormais += (h + (m/100)) * ((l.percentual / 100) + 1) 
                } else {
                    l.horasNormais += (h + (m/100)) * (l.percentual / 100)
                }
            }

            this.planilha[i] = l 
        }
    }

    this.converteBaseNumerica = function (novaBase) { 
        for (var i in this.planilha) {
            var l  = this.planilha[i]

            if (novaBase == 'd') {
                l.horas = calcUtil.horaStoD(l.horas)
            } else {
                l.horas = calcUtil.horaDtoS(l.horas)
            }

            this.planilha[i] = l 
        }
    } 

    this.set = function(dia, coluna, valor, nao_repetir) {
        if (dia == 'info') {
            this.info[coluna] = valor 
        } else {
            // console.log('set conversao', dia, coluna, valor)
            this.planilha[dia][coluna] = valor 
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

