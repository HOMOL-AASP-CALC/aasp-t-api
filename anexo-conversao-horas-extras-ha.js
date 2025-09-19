
module.exports = function(var1) {

    var calcUtil = require('./calcUtil.js');

    this.info = {
        tipo: 'comum', 
        posicao: var1.posicao,
        titulo: 'Conversão de horas extras em horas normais (hora + adicional)', 
        prefixo: 'conversaoHEHA', 
        grupo: 'horasExtras',
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

    this.colunas = [
        { titulo: 'Data', tipo: 'data',  nome: "dia"},
        { titulo: 'Base', tipo: 'f', casas: 2, nome: "base",  modal: "mInsalubridadeBase"}
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
        if (typeof this.info.impressaoObrigatoria === 'undefined') this.info.impressaoObrigatoria = true;

        var percHE1 = this.getVariavel('percHE1')
        var percHE2 = this.getVariavel('percHE2')
        var percHE3 = this.getVariavel('percHE3')
        var percHE4 = this.getVariavel('percHE4')
        var modo = this.getVariavel('modoDigitacaoHora')

        this.colunas = [] 
        this.colunas.push({titulo: 'Data', tipo: 'data',  nome: "dia"})
        if (percHE1) {
            this.colunas.push( { titulo: percHE1+'% diurno', tipo: 'h', casas: 2, nome: "he1",  modal: "mConversaoHE"} )
        }
        if (percHE2) {
            this.colunas.push( { titulo: percHE2+'% diurno', tipo: 'h', casas: 2, nome: "he2",  modal: "mConversaoHE"} )
        }
        if (percHE3) {
            this.colunas.push( { titulo: percHE3+'% diurno', tipo: 'h', casas: 2, nome: "he3",  modal: "mConversaoHE"} )
        }
        if (percHE4) {
            this.colunas.push( { titulo: percHE4+'% diurno', tipo: 'h', casas: 2, nome: "he4",  modal: "mConversaoHE"} )
        }
        this.colunas.push( { titulo: 'Horas Normais (em decimal)', tipo: 'f', casas: 2, nome: "hed" } )

        if (percHE1) {
            this.colunas.push( { titulo: percHE1+'% noturno', tipo: 'h', casas: 2, nome: "hen1",  modal: "mConversaoHE"} )
        }
        if (percHE2) {
            this.colunas.push( { titulo: percHE2+'% noturno', tipo: 'h', casas: 2, nome: "hen2",  modal: "mConversaoHE"} )
        }
        if (percHE3) {
            this.colunas.push( { titulo: percHE3+'% noturno', tipo: 'h', casas: 2, nome: "hen3",  modal: "mConversaoHE"} )
        }
        if (percHE4) {
            this.colunas.push( { titulo: percHE4+'% noturno', tipo: 'h', casas: 2, nome: "hen4",  modal: "mConversaoHE"} )
        }
        this.colunas.push( { titulo: 'Horas Noturnas Normais (em decimal)', tipo: 'f', casas: 2, nome: "hen" } )
        this.colunas.push( { titulo: 'Total', tipo: 'f', casas: 2, nome: "he" } )

        var h = 0
        var m = 0 

        for (var i in this.planilha) {
            var l  = this.planilha[i]
            l.hed = 0
            l.hen = 0

            l.he1 = calcUtil.formataHora3( l.he1 )
            l.he2 = calcUtil.formataHora3( l.he2 )
            l.he3 = calcUtil.formataHora3( l.he3 )
            l.he4 = calcUtil.formataHora3( l.he4 )
            l.hen1 = calcUtil.formataHora3( l.hen1 )
            l.hen2 = calcUtil.formataHora3( l.hen2 )
            l.hen3 = calcUtil.formataHora3( l.hen3 )
            l.hen4 = calcUtil.formataHora3( l.hen4 )

            if (modo == 'd') {
                l.he1 = l.he1.replace(':', ',')
                l.he2 = l.he2.replace(':', ',')
                l.he3 = l.he3.replace(':', ',')
                l.he4 = l.he4.replace(':', ',')
                l.hen1 = l.hen1.replace(':', ',')
                l.hen2 = l.hen2.replace(':', ',')
                l.hen3 = l.hen3.replace(':', ',')
                l.hen4 = l.hen4.replace(':', ',')
            }

            if (percHE1 && typeof l.he1 !== 'undefined' && l.he1.length==6) {
                h = calcUtil.hora2intHora( l.he1 )
                m = calcUtil.hora2intMinuto( l.he1 )
                if (modo == 's') { m = (m/60)*100 } 
                // console.log('h, m', h, m)
                l.hed += (h + (m/100)) * ((  percHE1 / 100)+1)
            }

            if (percHE2 && typeof l.he2 !== 'undefined' && l.he2.length==6) {
                h = calcUtil.hora2intHora( l.he2 )
                m = calcUtil.hora2intMinuto( l.he2 )
                if (modo == 's') { m = (m/60)*100 } 
                l.hed += (h + (m/100)) * (( percHE2 / 100)+1)
            }

            if (percHE3 && typeof l.he3 !== 'undefined' && l.he3.length==6) {
                h = calcUtil.hora2intHora( l.he3 )
                m = calcUtil.hora2intMinuto( l.he3 )
                if (modo == 's') { m = (m/60)*100 } 
                l.hed += (h + (m/100)) * (( percHE3 / 100)+1)
            }

            if (percHE4 && typeof l.he4 !== 'undefined' && l.he4.length==6) {
                h = calcUtil.hora2intHora( l.he4 )
                m = calcUtil.hora2intMinuto( l.he4 )
                if (modo == 's') { m = (m/60)*100 } 
                l.hed += (h + (m/100)) * (( percHE4 / 100)+1)
            }

            if (percHE1 && typeof l.hen1 !== 'undefined' && l.hen1.length==6) {
                h = calcUtil.hora2intHora( l.hen1 )
                m = calcUtil.hora2intMinuto( l.hen1 )
                if (modo == 's') { m = (m/60)*100 } 
                l.hen += (h + (m/100)) * ((  percHE1 / 100)+1)
            }

            if (percHE2 && typeof l.hen2 !== 'undefined' && l.hen2.length==6) {
                h = calcUtil.hora2intHora( l.hen2 )
                m = calcUtil.hora2intMinuto( l.hen2 )
                if (modo == 's') { m = (m/60)*100 } 
                l.hen += (h + (m/100)) * (( percHE2 / 100)+1)
            }

            if (percHE3 && typeof l.hen3 !== 'undefined' && l.hen3.length==6) {
                h = calcUtil.hora2intHora( l.hen3 )
                m = calcUtil.hora2intMinuto( l.hen3 )
                if (modo == 's') { m = (m/60)*100 } 
                l.hen += (h + (m/100)) * (( percHE3 / 100)+1)
            }

            if (percHE4 && typeof l.hen4 !== 'undefined' && l.hen4.length==6) {
                h = calcUtil.hora2intHora( l.hen4 )
                m = calcUtil.hora2intMinuto( l.hen4 )
                if (modo == 's') { m = (m/60)*100 } 
                l.hen += (h + (m/100)) * (( percHE4 / 100)+1)
            }

            l.he = l.hed + l.hen 

            this.planilha[i] = l 
        }
    }


    this.converteBaseNumerica = function (novaBase) { 
        for (var i in this.planilha) {
            var l  = this.planilha[i]

            if (novaBase == 'd') {
                l.he1 = calcUtil.horaStoD(l.he1)
                l.he2 = calcUtil.horaStoD(l.he2)
                l.he3 = calcUtil.horaStoD(l.he3)
                l.he4 = calcUtil.horaStoD(l.he4)
                l.hen1 = calcUtil.horaStoD(l.hen1)
                l.hen2 = calcUtil.horaStoD(l.hen2)
                l.hen3 = calcUtil.horaStoD(l.hen3)
                l.hen4 = calcUtil.horaStoD(l.hen4)
            } else {
                l.he1 = calcUtil.horaDtoS(l.he1)
                l.he2 = calcUtil.horaDtoS(l.he2)
                l.he3 = calcUtil.horaDtoS(l.he3)
                l.he4 = calcUtil.horaDtoS(l.he4)
                l.hen1 = calcUtil.horaDtoS(l.hen1)
                l.hen2 = calcUtil.horaDtoS(l.hen2)
                l.hen3 = calcUtil.horaDtoS(l.hen3)
                l.hen4 = calcUtil.horaDtoS(l.hen4)
            }
            // console.log(l)

            this.planilha[i] = l 
        }
    }    


    this.set = function(dia, coluna, valor, nao_repetir) {
        if (dia == 'info') {
            this.info[coluna] = valor 
        } else {
            if (typeof this.planilha[dia] === 'undefined') {
                this.planilha[dia] = {}
            }

            if ( typeof this.planilha[dia] !== 'undefined') {
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

