const calcUtil = require("./calcUtil")

module.exports = {
    desenhaTabela(t, w) {
        var fator_alinhamento = 0
        if (t.tipo == 'reflexo') fator_alinhamento = 1
        var r = "<table width='100%'>"
        if (w) {
            r = "<table  width='"+w+"' style='width:"+w+";'>"
        }
        
        r += '<tr>'
        t.headers.forEach((cell, i) => {
            var classe = '' 
            if (i<=fator_alinhamento) {
                classe = 'esquerda'
            } 
            r += '<th class="'+classe+'">'+cell+'</th>'
        });
        r += '</tr>'

        t.rows.forEach((row, i) => {
            r += '<tr>'
            row.forEach((cell, i) => {
                var classe = '' 
                if (i<=fator_alinhamento) {
                    classe = 'esquerda'
                } 
                if (row[0] == 'Total' || row[0] == 'Subtotal') {
                    classe += ' negrito'
                }
                
                r += '<td class="'+classe+'">'+cell+'</td>'
            }) 
            r += '</tr>'
        });
        

        r += "</table>"
        return (r)
    },

    anexoResumoGeral(dump) {
        var res = '' 
        res = `<h1>Resumo Geral dos Haveres</h1>`; 
        res = res + `<span style="font-size: 12px;">${dump.v.tabelaCorrecaoNome}</span><br /><br />`

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
        tabela.rows.push(['Subtotal' , calcUtil.formataNum( dump.v.resumo_TotalAnexosFGTS, 2) ])

        // juros
        t1 = 'Juros (R$ '+ calcUtil.formataNum( dump.v.resumo_baseJuros, 2)  +' x '+ calcUtil.formataNum( dump.v.resumo_JurosPercentual, 2) +'% )'
        tabela.rows.push([t1 , calcUtil.formataNum( dump.v.resumo_Juros, 2) ])

        // selic
        if (dump.v.resumo_SelicValor>0) {
            t1 = 'Selic (R$ '+ calcUtil.formataNum( dump.v.resumo_TotalAnexosFGTS, 2) + ' + '+ calcUtil.formataNum( dump.v.resumo_Juros, 2)  +') ' +' x '+ calcUtil.formataNum( dump.v.resumo_SelicPercentual, 2) +'%'
            tabela.rows.push([t1 , calcUtil.formataNum( dump.v.resumo_SelicValor, 2) ])
        }

        // subtotal
        tabela.rows.push(['Subtotal' , calcUtil.formataNum( dump.v.resumo_subtotalJuros, 2) ])

        // inss
        if (dump.v.inss_reclamante==1) {
            tabela.rows.push(['INSS do reclamante' , calcUtil.formataNum( dump.v.resumo_somaINSS* -1, 2) ])
        }

        // irrf
        if (dump.v.irrf_modo=='caixa') {
            var t1 = 'IRRF (regime de caixa) [(R$ '+calcUtil.formataNum(dump.v.ir_base, 2) +' x '+calcUtil.formataNum(dump.v.ir_perc, 2) +'%) - '+ calcUtil. formataNum(dump.v.ir_deducao, 2) +' ]'
            tabela.rows.push([t1 , calcUtil.formataNum( dump.v.ir_reclamante* -1, 2) ])
        }
        if (dump.v.irrf_modo=='1127') {
            var t1 = 'IRRF (IN 1500/14) [(R$ '+calcUtil.formataNum(dump.v.ir_base, 2) +' ('+dump.v.ir_meses+' meses)'
            tabela.rows.push([t1 , calcUtil.formataNum( dump.v.ir_reclamante * -1, 2) ])
        }
        // subtotal
        tabela.rows.push(['Subtotal' , calcUtil.formataNum( dump.v.resumo_subtotal_INSS_IRRF, 2) ])

        // Honorários advocatícios
        if (dump.v.hono_base!="n") {
            var t1 = 'Honorários advocatícios'
            if (dump.v.hono_base!="d") {
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


        res += this.desenhaTabela(tabela);

        // INSS Reclamada
        tabela = {
            headers: ["INSS Reclamada", ""],
            rows: [],
            v: dump.v,
            tipo: 'inssReclamada' 
        };

        tabela.rows.push(['Percentual do empregador (R$ '+calcUtil.formataNum( dump.v.resumo_baseINSSEmpregador, 2)+' x '+calcUtil.formataNum( dump.v.inssemp_e, 2) +'%)', calcUtil.formataNum( dump.v.resumo_inssemp_e, 2) ])
        tabela.rows.push(['Percentual de terceiros  (R$ '+calcUtil.formataNum( dump.v.resumo_baseINSSEmpregador, 2)+' x '+calcUtil.formataNum( dump.v.inssemp_t, 2) +'%)', calcUtil.formataNum( dump.v.resumo_inssemp_t, 2) ])
        tabela.rows.push(['Percentual ref. ao SAT (R$ '+calcUtil.formataNum( dump.v.resumo_baseINSSEmpregador, 2)+' x '+calcUtil.formataNum( dump.v.inssemp_s, 2) +'%)', calcUtil.formataNum( dump.v.resumo_inssemp_s, 2) ])

        res += '<br><br>'+this.desenhaTabela(tabela, '500px');

       return res 
    },

    anexoComum(a, dump) {
        var r = '' 

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
                linha.push( v1 )
            }
            tabela.rows.push( linha )
        }

        if (a.info.somarResumo || a.info.somarIRRF || a.info.somarFGTS) {
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

        r = '<br><h1>'+tabela.titulo+'</h1><br>'
        r += this.desenhaTabela (tabela);

        return r 
    }, 


    anexoMedias(a, dump) {
        var posX = 0 
        var posX3 = 0 
        var r = '<br><h1>Demonstrativo de médias de '+a.info.titulo+'</h1><br>'

        r += '<table width=100%><tr>'

        for (var i in a.planilha) {
            var itens = a.planilha[i].itensMedia 
            // console.log('itens', itens)

            var tabela = {
                descricaoTabela: a.planilha[i].desc+'<br>Período aquisitivo de '+a.planilha[i].pa_ini+' a '+a.planilha[i].pa_fim,  
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

            r += '<td style="vertical-align:top; text-align: left;"><b>'+tabela.descricaoTabela+'</b><br>'
            r += this.desenhaTabela(tabela,  '250px' ); 
            r += "</td>"
            
            posX++ 
            posX3 = posX % 3 
            if (!posX3) {
                r += '</tr><tr>'
            }
        }

        r += '</tr></table>'
        return r 
    }, 

    addAnexoComum(dump1, tempo, dumpGrande, titulo) {
        return this.anexoComum(dump1, dumpGrande, titulo )
    },

    addAnexoMedias(dump1, tempo, dumpGrande, titulo) {
        var r = this.anexoMedias(dump1, dumpGrande, titulo )
        return r 
    },

    montaCalc ( dump) {
        var myDoc = ` 
        <link rel="stylesheet" href="https://legacy.debit.com.br/css/trabalhista.css">
        `;

        myDoc  += this.anexoResumoGeral(dump)

        var incremento = 250
        var t = 100
        var that = this 


        var aa = [] 
        for (var i in dump.a) {
            aa.push({nome: i, posicao: dump.a[i].info.posicao}) 
        }
        aa.sort((a,b) => (a.posicao  > b.posicao ) ? 1 : ((b.posicao  > a.posicao ) ? -1 : 0))


        for (var k in aa) {
            var i = aa[k].nome

            if (i != 'base' && (dump.a[i].info.somarResumo || dump.a[i].info.somarFGTS || dump.a[i].info.somarIRRF || dump.a[i].info.somarINSS || dump.a[i].info.impressaoObrigatoria) && dump.a[i].info.visivel  ) { 
                myDoc  += that.addAnexoComum(dump.a[i], t += incremento, dump, dump.a[i].info.titulo)
                if (dump.a[i].info.relatorioMedias) {
                    myDoc  += that.addAnexoMedias(dump.a[i], t += incremento, dump, dump.a[i].info.titulo)
                }
            } 
        }
        return myDoc;
    }

 }
  