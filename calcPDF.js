const calcUtil = require("./calcUtil")

module.exports = {
    anexoResumoGeral(myDoc, dump) {
        myDoc.fontSize(16).fillOpacity(1)
        myDoc.fillColor('#000').text(`Resumo Geral dos Haveres`, 10, 110); 
        myDoc.lineWidth(1);   
        myDoc.moveTo(10, 135).lineTo(820, 135).stroke() 

        var tabela = {
            headers: ["Verba", "Valor"],
            rows: [],
            titulo: 'Resumo Geral dos Haveres',
            v: dump.v,
            tipo: 'resumo' 
        };

        for (var i in dump.a) {
            if ((dump.a[i].info.visivel == 1) && (dump.a[i].info.grupo != 'inss' && dump.a[i].info.prefixo != 'base' ) && (dump.a[i].info.somarResumo)  ){
                tabela.rows.push([dump.a[i].info.titulo, calcUtil.formataNum( dump.a[i].info.resultadoResumo, 2) ])
            }  
        }

        // seguro desemprego
        if (dump.v.seguroDesemprego) {
            // 'Seguro desemprego (média dos salários: R$ {{formataNum( variaveis.seguroDesempregoMediaSalarios, 2) }}; número de parcelas: {{variaveis.seguroDesempregoParcelas}}{{ (variaveis.seguroDesempregoCorrigir) ? "; corrigido monetariamente" : "" }})'
            var t1 = 'Seguro desemprego (média dos salários: R$ '+calcUtil.formataNum( dump.v.seguroDesempregoMediaSalarios, 2)+'; número de parcelas: '+dump.v.seguroDesempregoParcelas;
            if (dump.v.seguroDesempregoCorrigir) t1 = t1 + "; corrigido monetariamente"
            t1 = t1+")"
            tabela.rows.push([t1 , calcUtil.formataNum( dump.v.resumo_seguroDesemprego, 2) ])
        }

        // subtotal
        tabela.rows.push(['Subtotal' , calcUtil.formataNum( dump.v.resumo_TotalAnexos, 2) ])

        // fgts
        tabela.rows.push(['FGTS' , calcUtil.formataNum( dump.v.resumo_TotalFGTS, 2) ])
        if (dump.v.resumo_MultaFGTS_considerar) {
            tabela.rows.push(['Multa de 40% do FGTS' , calcUtil.formataNum( dump.v.resumo_MultaFGTS, 2) ])
        }
        if (dump.v.fgts40_valor) {
            var t1 = 'Multa de 40% sobre os valores do FGTS (valor depositado R$ '+calcUtil.formataNum(dump.v.fgts40_valor,2) +' x 40% x '+ calcUtil.formataNum( dump.v.ultimoIndiceCorrecao, 9)
            tabela.rows.push([t1 , calcUtil.formataNum( dump.v.resumo_FGTSDepositado, 2) ])
        }

        // subtotal
        if (dump.v.resumo_TotalAnexosFGTS != dump.v.resumo_TotalFinal) {
            tabela.rows.push(['Subtotal' , calcUtil.formataNum( dump.v.resumo_TotalAnexosFGTS, 2) ])
        }

        var escrever_subtotal  = false

        var t1 = 'Juros (R$ '+ calcUtil.formataNum( dump.v.resumo_baseJuros, 2) +' x '+ calcUtil.formataNum( dump.v.resumo_JurosPercentual, 2) +'%)'
        tabela.rows.push([t1 , calcUtil.formataNum( dump.v.resumo_Juros, 2) ])

        if (dump.v.resumo_SelicValor>0) {
            t1 = 'Selic (R$ '+ calcUtil.formataNum( dump.v.resumo_TotalAnexosFGTS, 2) + ' + '+ calcUtil.formataNum( dump.v.resumo_Juros, 2) +') x '+ calcUtil.formataNum( dump.v.resumo_SelicPercentual, 2) +'%'
            tabela.rows.push([t1 , calcUtil.formataNum( dump.v.resumo_SelicValor, 2) ])
        }


        // subtotal
        tabela.rows.push(['Subtotal' , calcUtil.formataNum( dump.v.resumo_subtotalJuros, 2) ])


        var escrever_subtotal  = false

        // inss
        if (dump.v.inss_reclamante==1) {
            tabela.rows.push(['INSS do reclamante' , calcUtil.formataNum( dump.v.resumo_somaINSS *-1, 2) ])
            escrever_subtotal = true
        }

        // irrf
        if (dump.v.irrf_sn == "1") {
            if (dump.v.irrf_modo=='caixa') {
                var t1 = 'IRRF (regime de caixa) [(R$ '+calcUtil.formataNum(dump.v.ir_base, 2) +' x '+calcUtil.formataNum(dump.v.ir_perc, 2) +'%) - '+ calcUtil. formataNum(dump.v.ir_deducao, 2) +' ]'
                tabela.rows.push([t1 , calcUtil.formataNum( dump.v.ir_reclamante *-1, 2) ])
            }
            if (dump.v.irrf_modo=='1127') {
                var t1 = 'IRRF (IN 1500/14) [(R$ '+calcUtil.formataNum(dump.v.ir_base, 2) +' ('+dump.v.ir_meses+' meses)'
                tabela.rows.push([t1 , calcUtil.formataNum( dump.v.ir_reclamante *-1, 2) ])
            }
            escrever_subtotal = true           
        }
        // subtotal

        if (escrever_subtotal) {
            tabela.rows.push(['Subtotal' , calcUtil.formataNum( dump.v.resumo_subtotal_INSS_IRRF, 2) ])
        }
        
        // Honorários advocatícios
        if (dump.v.hono_modo!="n") {
            var t1 = 'Honorários advocatícios'
            if (dump.v.hono_modo!="d") {
                t1 = t1 + ' (R$ '+calcUtil.formataNum( dump.v.hono_base, 2) +' x '+ calcUtil.formataNum( dump.v.hono_perc, 2) + '%)'
            }
            tabela.rows.push([t1 , calcUtil.formataNum( dump.v.resumo_hono, 2) ])
        }

        // Honorários periciais
        if (dump.v.hono_per_modo!="0") {
            var t1 = 'Honorários periciais'
            if (dump.v.hono_base!="v") {
                t1 = t1 + ' (R$ '+calcUtil.formataNum( dump.v.hono_per_base, 2) +' x '+ calcUtil.formataNum( dump.v.hono_per_perc, 2)+'%)'
            }
            tabela.rows.push([t1 , calcUtil.formataNum( dump.v.resumo_per_hono, 2) ])
        }

        // Honorários sucumbências
        if (dump.v.hono_suc_modo!="nao_calcular") {
            tabela.rows.push(['Honorários de sucumbências' , calcUtil.formataNum( dump.v.resumo_suc_hono, 2) ])
        }

        tabela.rows.push(['Total' , calcUtil.formataNum( dump.v.resumo_TotalFinal, 2) ])

        myDoc.moveDown()
        myDoc.table(tabela, 10, 160, { width: 810 });


        // INSS Reclamada
        if (dump.v.inssemp_sn == '1') {
            tabela = {
                headers: ["INSS Reclamada", ""],
                rows: [],
                v: dump.v,
                tipo: 'inssReclamada' 
            };

            tabela.rows.push(['Percentual do empregador (R$ '+calcUtil.formataNum( dump.v.resumo_baseINSSEmpregador, 2)+' x '+calcUtil.formataNum( dump.v.inssemp_e, 2) +'%)', calcUtil.formataNum( dump.v.resumo_inssemp_e, 2) ])
            tabela.rows.push(['Percentual de terceiros  (R$ '+calcUtil.formataNum( dump.v.resumo_baseINSSEmpregador, 2)+' x '+calcUtil.formataNum( dump.v.inssemp_t, 2) +'%)', calcUtil.formataNum( dump.v.resumo_inssemp_t, 2) ])
            tabela.rows.push(['Percentual ref. ao SAT (R$ '+calcUtil.formataNum( dump.v.resumo_baseINSSEmpregador, 2)+' x '+calcUtil.formataNum( dump.v.inssemp_s, 2) +'%)', calcUtil.formataNum( dump.v.resumo_inssemp_s, 2) ])

            myDoc.moveDown()
            myDoc.moveDown()
            myDoc.moveDown()

            myDoc.table(tabela, 10, 160, { width: 500,  apenasTabela: true, inicioY: myDoc.y });
        }
    },

    anexoComum(myDoc, a, dump) {
        var tabela = {
            headers: [],
            rows: [],
            titulo: a.info.titulo,
            v: dump.v, 
            tipo: a.info.tipo  
        };

        // console.log( a.info )
        for (var i in a.colunas) {
            tabela.headers.push( a.colunas[i].titulo )
        }

        for (var i in a.planilha) {
            var linha = [] 

            for (var k in a.colunas) {
                var v1 = a.planilha[ i ][ a.colunas[ k ].nome ] 
                if (  a.colunas[ k ].tipo == 'v' ||  a.colunas[ k ].tipo == 'f' ) v1 = calcUtil.formataNum(v1, a.colunas[ k ].casas )

                var nomeCol = a.colunas[ k ].nome

                if (nomeCol == "resultado" && !a.info.somarResumo) v1 = '*x*'+v1
                if (nomeCol == "fgts" && !a.info.somarFGTS) v1 = v1 = '*x*'+v1 
                if (nomeCol == "inss" && !a.info.somarINSS) v1 = v1 = '*x*'+v1 
                if (nomeCol == "irrf" && !a.info.somarIRRF) v1 = v1 = '*x*'+v1

                linha.push( v1 )
            }
            tabela.rows.push( linha )
        }

        if (a.info.somarResumo || a.info.somarIRRF || a.info.somarFGTS ) {
            var linha = [] 
            for (var k in a.colunas) {
                var nomeCol = a.colunas[ k ].nome

                var v1 = ""
                if (nomeCol == "dia") v1 = "Total"
                if (nomeCol == "resultado" && a.info.somarResumo) v1 = calcUtil.formataNum( a.info.resultadoResumo, 2)  
                if (nomeCol == "fgts" && a.info.somarFGTS) v1 = calcUtil.formataNum( a.info.resultadoFGTS, 2)
                if (nomeCol == "irrf" && a.info.somarIRRF) v1 = calcUtil.formataNum( a.info.resultadoIRRF, 2)

                linha.push( v1 )
            }
            tabela.rows.push( linha )
        }

        myDoc.moveDown()
        myDoc.table(tabela, 10, 160, { width: 810 });
    }, 


    anexoMedias(myDoc, a, dump) {
        var posX = 0 
        var posX3 = 0 

        for (var i in a.planilha) {
            var itens = a.planilha[i].itensMedia 
            // console.log('itens', itens)

            var tabela = {
                descricaoTabela: a.planilha[i].desc+'\nPeríodo aquisitivo de '+a.planilha[i].pa_ini+' a '+a.planilha[i].pa_fim,  
                headers: ['Data', 'Horas'],
                rows: [],
                titulo: 'Demonstrativo de médias de '+a.info.titulo,
                v: dump.v, 
                tipo: 'medias'  
            };

            for (var k in itens) {  
                tabela.rows.push( [calcUtil.mesAno2dia(itens[k].dia), calcUtil.formataNum(itens[k].valor,2) ] )
            }
            tabela.rows.push( ['Média', calcUtil.formataNum(a.planilha[i].resultadoMedia,2) ] )

            myDoc.table(tabela, (270 * posX3)+10 , 160, { width: 250 }); 
            
            posX++ 
            posX3 = posX % 3 

            if (posX > 0 && posX3 == 0) {
                myDoc.addPage({ layout: 'landscape', size : 'A4'})
            }
        }
    }, 

    addAnexoComum(myDoc, dump1, tempo, dumpGrande, titulo) {
        var that = this 
        setTimeout( function() {
            myDoc.addPage({ layout: 'landscape', size : 'A4'})
            that.anexoComum(myDoc, dump1, dumpGrande, titulo )
        }, tempo)
    },

    addAnexoMedias(myDoc, dump1, tempo, dumpGrande, titulo) {
        var that = this 
        setTimeout( function() {
            myDoc.addPage({ layout: 'landscape', size : 'A4'})
            that.anexoMedias(myDoc, dump1, dumpGrande, titulo )
        }, tempo)
    },

    montaCalc (myDoc, dump) {
        myDoc.addPage({ layout: 'landscape', size : 'A4'})
        this.anexoResumoGeral(myDoc, dump)

        var aa = [] 
        for (var i in dump.a) {
            aa.push({nome: i, posicao: dump.a[i].info.posicao}) 
        }
        aa.sort((a,b) => (a.posicao  > b.posicao ) ? 1 : ((b.posicao  > a.posicao ) ? -1 : 0))

        var incremento = 250
        var t = 100
        var that = this 

        for (var k in aa) {
            var i = aa[k].nome

            if (i != 'base' && (dump.a[i].info.somarResumo || dump.a[i].info.somarFGTS || dump.a[i].info.somarIRRF || dump.a[i].info.somarINSS || dump.a[i].info.impressaoObrigatoria) && dump.a[i].info.visivel  ) { 
                that.addAnexoComum(myDoc, dump.a[i], t += incremento, dump, dump.a[i].info.titulo)
                if (dump.a[i].info.relatorioMedias) {
                    that.addAnexoMedias(myDoc, dump.a[i], t += incremento, dump, dump.a[i].info.titulo)
                }
            } 
        }

        // this.anexoComum(myDoc, dump.a[ 'insalubridade' ])
        setTimeout( function() {
            myDoc.end();
        }, t += incremento)
    }

 }
  