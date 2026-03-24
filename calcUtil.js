module.exports = {

    // dia -> dd/mm/aaaa
    // int -> (mm * 12) + 1
    // dinv -> aaaammdd      -> dia invertido (notação de datas anteriores)

    zeroStr (n) {
        var x = parseInt(n)
        if (x < 10) {
            return '0'+String(n)
        } else {
            return String(n)
        }
    },

    dia2dinv (dia) {
        return dia.substring(6)+dia.substring(3,5)+dia.substring(0,2)
    },

    dia2intDia : function(d) {
        return parseInt(d.substring(0,2))
    },

    dia2intMes : function(d) {
        return parseInt(d.substring(3,5))
    },

    dia2intAno : function(d) {
        return parseInt(d.substring(6,10))
    },

    int2Hora (h) {
        if (!h) return '00:00'
        let hora = parseInt(h/60)
        let minuto = h % 60
        return this.zeroStr(hora) + ':' + this.zeroStr(minuto)
    },
    
    intData2Mes : function (i) {
        var x = ( i % 12 )
        if ( x == 0 ) x = 12 
        return x 
    },

    intData2Ano : function (i) {
        var x = Math.floor( i / 12 )
        var y = ( i % 12 )
        if (y == 0) x-- 
        return x 
    }, 

	dia2intMesAno : function (d) {
	  var mes = parseInt(d.substring(3,5)) 
      var ano = parseInt(d.substring(6,10))
	  return  (ano * 12) + mes   
	}, 	

    diminuiDia (dia) {
        var d = this.dia2intDia(dia)
        var m = this.dia2intMes(dia)
        var a = this.dia2intAno(dia)

        d--

        if (d < 1) {
            m--
            if (m < 1) {
                a--;
                m=12;
            }
            stemp = '01/'+this.zeroStr(m)+'/'+a
            d = this.diasMes(stemp)
        }

        return this.zeroStr(d) + '/' + this.zeroStr(m) + '/' + a
    }, 

    diminuiAno (dia) {
        var d = this.dia2intDia(dia)
        var m = this.dia2intMes(dia)
        var a = this.dia2intAno(dia)
        a-- 
        return this.zeroStr(d) + '/' + this.zeroStr(m) + '/' + a
    },

    somaAno (dia) {
        var d = this.dia2intDia(dia)
        var m = this.dia2intMes(dia)
        var a = this.dia2intAno(dia)
        a++ 
        return this.zeroStr(d) + '/' + this.zeroStr(m) + '/' + a
    },


    somaMes (dia) {
        var d = this.dia2intDia(dia)
        var m = this.dia2intMes(dia)
        var a = this.dia2intAno(dia)
        m++
        if (m>12) {
            m=1
            a++
        }
        return this.zeroStr(d) + '/' + this.zeroStr(m) + '/' + a
    },

    diaHoje () {
        var data = new Date(),
        dia  = data.getDate().toString().padStart(2, '0'),
        mes  = (data.getMonth()+1).toString().padStart(2, '0'), //+1 pois no getMonth Janeiro começa com zero.
        ano  = data.getFullYear();
        return dia+"/"+mes+"/"+ano;     
    },

	yyyymmdd2intMesAno : function (d) {
        var mes = parseInt(d.substring(4,6))
        var ano = parseInt(d.substring(0,4))
        return  (ano * 12) + mes   
      }, 

    yyyymmdd2dia : function (d) {
        var dia = d.substring(6,8)
        var mes = d.substring(4,6)
        var ano = d.substring(0,4)  
        return  `${dia}/${mes}/${ano}`    
      }, 

    dia2yyyymmdd : function (dia1) {
        var d = this.dia2intDia(dia1)
        var m = this.dia2intMes(dia1)
        var a = this.dia2intAno(dia1)
        var dia = this.zeroStr(d)
        var mes = this.zeroStr(m)
        var ano = a 

        return  `${ano}${mes}${dia}`    
    },

    dia2yyyymmddInt : function (dia1) {
        return parseInt( this.dia2yyyymmdd(dia1) )
    },

    mesAno2dia : function (d) {
        if (!d) return 0;
        if (d.length < 10) return 0;
        d = parseInt(d)
        var ano = Math.floor( d / 12 )
        var mes = d-(ano*12)
        if (mes==0) { mes = 12; ano--; } 
        var zero = (mes<10) ? '0' : '' 
        return  `${zero}${mes}/${ano}`   
    }, 

    mesAno2dinv : function (d) {
        if (d.length < 10) return 0;
        d = parseInt(d)
        var ano = Math.floor( d / 12 )
        var mes = d-(ano*12)
        if (mes==0) { mes = 12; ano--; }  
        var zero = (mes<10) ? '0' : '' 
        return  `${ano}${zero}${mes}01`   
    }, 

    anoBisexto : function (ano) {
        return ((ano%4)==0)
    }, 

    diasMes : function(data) {
        var meses = {'1': 31, '2': 28, '3':31, '4':30, '5':31, '6':30, '7':31,'8':31, '9':30, '10':31, '11': 30, '12': 31};
        var m = meses[this.dia2intMes(data)]
        if ((m==28) && (this.anoBisexto(this.dia2intAno(data)) )) {
            m = 29 
        }
        return m;
    },

    salario13 : function(ini, fim, ampliar) {
        var i = this.dia2intMesAno(ini)
        var f = this.dia2intMesAno(fim)
        var i_dia = this.dia2intDia(ini)
        var f_dia = this.dia2intDia(fim)

        var i_ano = this.dia2intAno(ini)
        var f_ano = this.dia2intAno(fim)

        // console.log('###### i, f, i_dia, f_dia', i, f, i_dia, f_dia)
        var prop = 0 
        var resultado =  [ ]

        for (var q = i; q <= f; q++) {
            var temp = {}  
            prop++
            // console.log('###### ', q,prop)
            var mes = ((q%12)==0) ? 12 : (q%12)
            if ((mes == 12) || (q == f)) {
                if ((q==f) && (ampliar)) { prop++ }
                if ((q==f) && (f_dia < 15)) { prop-- }
                if ( ( this.intData2Ano(q) == this.intData2Ano(i) ) && (i_dia > 15) )  { prop-- } 

                temp.dia = q
                temp.proporcao = prop

                if (resultado.length <= 0) {
                    if (i_ano == f_ano) {
                        var pa_ini = this.zeroStr( i_dia ) +  '/'+ this.zeroStr( this.intData2Mes(i) ) + '/' + this.intData2Ano( q ) 
                    } else {
                        var pa_ini = '01/01/' + this.intData2Ano(q) 
                    }
                } else {
                    var pa_ini = '01/01/' + this.intData2Ano(q) 
                }
                if (q == f) {
                    var pa_fim = this.zeroStr( f_dia ) +  '/'+ this.zeroStr( this.intData2Mes(q) ) + '/' + this.intData2Ano( q ) 
                } else {
                    var pa_fim = '31/12/' + this.intData2Ano(q) 
                }

                prop = 0 
                temp.debug_dia = this.mesAno2dia(q)
                temp.pa_ini = pa_ini
                temp.pa_fim = pa_fim  
                // console.log(temp)
                if (temp.proporcao>0) {
                    resultado.push(temp)
                }
            } 
        }
        // console.log(resultado)
        return resultado 
    }, 

    feriasTodas : function(ini, fim, ampliar) {

        var res =  [ ]
        var ma_admis = this.dia2intMesAno(ini)
        var ma_demis = this.dia2intMesAno(fim)

        var propferias = ma_demis - ma_admis + 1 
        var ini_ferias = ini 

        while (propferias > 12) {
            var linha = {} 
            
            linha.dia = this.dia2intMesAno( this.somaAno( ini_ferias ) ) 
            linha.pa_ini = ini_ferias 
            linha.pa_fim = this.somaAno( this.diminuiDia( ini_ferias ))
            linha.prop = 12
            linha.tipo = 'g'

            ini_ferias = this.somaAno( ini_ferias )
            propferias -= 12
            // console.log(linha)
            res.push(linha)
        }

        linha = {}
        linha.dia = this.dia2intMesAno(  this.strPrimeiroDia( fim ) ) 
        linha.pa_ini = ini_ferias
        linha.pa_fim = fim 

        var a = ini_ferias
        var a1 = ini_ferias
        var b = fim 
        propferias = 0

        while ( this.dia2yyyymmddInt(a1) < this.dia2yyyymmddInt(b)) {
            var u = this.diasMes( a )
            var x = ( u - this.dia2intDia(a) ) + 1
            if (x > 14) propferias++;
            a = this.somaMes( this.strPrimeiroDia(a) )
            a1 = this.strUltimoDia( a )
        }

        x = this.dia2intDia(fim)
        if (x > 14) propferias++;
        if (ampliar) propferias++;
        linha.prop = propferias
        linha.tipo = 'p'

        res.push( linha)

        return res 
    },

    feriasProporcionais :  function(ini, fim, ampliar) {
        var ma_admis = this.dia2intMesAno(ini)
        var ma_demis = this.dia2intMesAno(fim)
        var admis_dia = this.dia2intDia(ini)
        var demis_dia = this.dia2intDia(fim)
        var propferias = (ma_demis - ma_admis) + 1

        while (propferias > 12) propferias -= 12
        // console.log('ma_admis ma_demis propferias', ma_admis, ma_demis, propferias)

        if (admis_dia >= 15) propferias--;
        if (demis_dia < 15) propferias--;
        // console.log('2 - propferias - admis_dia - demis_dia',  propferias, admis_dia, demis_dia)

        if ( (admis_dia < 15) && (demis_dia >= 15) && ((demis_dia-admis_dia) < 15) ) { 
            propferias--; 
            // console.log('calcUtil.js - diminui um mes')
        }

        // console.log('propferias2', propferias)
        if  (propferias < 0) propferias += 12
        if (ampliar) propferias++ 

        return propferias
    },

    diasAviso : function(ini, fim) {
        var meses = this.mesesInteiros(ini, fim)
        // console.log('meses',ini,fim,meses)
        if (meses < 12) meses = 0
        var n = Math.floor(meses / 12) * 3
        if (n < 0) n = 0
        n += 30
        if (n > 90) n = 90
        return n 
    }, 

    mesesInteiros : function(a, b) {
        var ad = this.dia2intDia( a ) 
        var am = this.dia2intMes( a )
        var aa = this.dia2intAno( a )
        var ba = this.dia2intAno( b )
        var bm = this.dia2intMes( b )

        if (aa==ba && am==bm) {
            return 0 
        } else {
            if (ad>1) {
                ad = 1
                am++
            }
            if (am==13) {
                am = 1
                aa++
            }
        }
        return (12 * (ba - aa -1)) + (bm + 12 - am)
    },


    datePascoa (aano) {
        var resto = (aano % 19) + 1

        let r;

        switch (resto) {
            case 1: r = new Date(aano, 3, 14); break;
            case 2: r = new Date(aano, 3, 4); break;
            case 3: r = new Date(aano, 2, 23); break;
            case 4: r = new Date(aano, 3, 11); break;
            case 5: r = new Date(aano, 2, 31); break;
            case 6: r = new Date(aano, 3, 18); break;
            case 7: r = new Date(aano, 3, 8); break;
            case 8: r = new Date(aano, 2, 28); break;
            case 9: r = new Date(aano, 3, 16); break;
            case 10: r = new Date(aano, 3, 5); break;
            case 11: r = new Date(aano, 2, 25); break;
            case 12: r = new Date(aano, 3, 13); break;
            case 13: r = new Date(aano, 3, 2); break;
            case 14: r = new Date(aano, 2, 22); break;
            case 15: r = new Date(aano, 3, 10); break;
            case 16: r = new Date(aano, 2, 30); break;
            case 17: r = new Date(aano, 3, 24); break;
            case 18: r = new Date(aano, 3, 7); break;
            case 19: r = new Date(aano, 2, 27); break;
        }

        var a = r.getDay ()         
        if (a > 0) {
            r.setDate(  r.getDate () + (7-a) )
        }

        return r
    },

    dateFeriadoMovel (dia, config) {
        var ano = dia.getYear () + 1900
        var pascoa = this.datePascoa (ano)   
        var sextaSanta =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 2)  )   
        var corpus =  new Date( pascoa.getTime() + (  (24*60*60*1000) * 60)  )
        var carnaSab =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 50)  )
        var carnaDom =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 49)  )
        var carnaSeg =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 48)  )
        var carnaTer =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 47)  )
        var carnaQua =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 46)  )

        r = 0
        if ((config[0]==1) && (dia.getTime() == pascoa.getTime())) r = 1
        if ((config[1]==1) && (dia.getTime() == sextaSanta.getTime())) r = 1
        if ((config[2]==1) && (dia.getTime() == corpus.getTime())) r = 1
        if ((config[3]==1) && (dia.getTime() == carnaSab.getTime())) r = 1
        if ((config[4]==1) && (dia.getTime() == carnaDom.getTime())) r = 1
        if ((config[5]==1) && (dia.getTime() == carnaSeg.getTime())) r = 1
        if ((config[6]==1) && (dia.getTime() == carnaTer.getTime())) r = 1
        if ((config[7]==1) && (dia.getTime() == carnaQua.getTime())) r = 1

        return r 
    }, 

    str2arrayFeriados (str) {
        r = []
        while (str.length > 0) {
            var d = parseInt(str.substring(0, 2))
            var m = parseInt(str.substring(2, 4))
            r.push({d,m})
            str = str.substring(4)
        }
        return r 
    },

    dateFeriadoFixo (dia, arrayFeriados) {
        var d = dia.getDate()
        var m = dia.getMonth()+1
        for (var i in arrayFeriados) {
            if (arrayFeriados[i].d == d && arrayFeriados[i].m == m) return 1
        }
        return 0 
    },

    str2date (str) {
        var d = str.substring(0,2)
        var m = parseInt(str.substring(3,5))-1
        var a = str.substring(6)

        return new Date(a,m,d)
    }, 

    strPrimeiroDia (str) {
        return '01/'+str.substring(3)
    },

    strUltimoDia (str) {
        return this.diasMes(str)+'/'+str.substring(3) 
    }, 

    dsrDetalhado (strIni, strFim, feriados, config) {
        // console.log('dsrDetalhado', strIni, strFim, feriados, config)
        var dateIni = this.str2date( strIni )
        var dateFim = this.str2date( strFim )
        var ferM = feriados.substring(0,8)
        var ferF = this.str2arrayFeriados( feriados.substring(8) )

        var r = {
            segunda: 0,
            terca: 0,
            quarta: 0,
            quinta: 0,
            sexta: 0,
            sabado: 0,
            domingo: 0,
            feriado: 0 
        }

        while (dateIni.getTime() <= dateFim.getTime()) {
            var diaSemana = dateIni.getDay () 
            // if (config.dsrFer) {
                if ( this.dateFeriadoFixo( dateIni, ferF) ) diaSemana = 7
                if ( this.dateFeriadoMovel( dateIni, ferM) ) diaSemana = 7 
            // }

            switch (diaSemana) {
                case 0: r.domingo++; break;
                case 1: r.segunda++; break;
                case 2: r.terca++; break;
                case 3: r.quarta++; break;
                case 4: r.quinta++; break;
                case 5: r.sexta++; break;
                case 6: r.sabado++; break;
                case 7: r.feriado++; break;
            }

            dateIni.setTime(  dateIni.getTime() + (24*60*60*1000) )
        }

        r.diasU = 0
        r.diasD = 0

        if (config.dsrDom) { r.diasD += r.domingo } else { r.diasU += r.domingo }
        if (config.dsrSeg) { r.diasD += r.segunda } else { r.diasU += r.segunda }
        if (config.dsrTer) { r.diasD += r.terca } else { r.diasU += r.terca }
        if (config.dsrQua) { r.diasD += r.quarta } else { r.diasU += r.quarta }
        if (config.dsrQui) { r.diasD += r.quinta } else { r.diasU += r.quinta }
        if (config.dsrSex) { r.diasD += r.sexta } else { r.diasU += r.sexta }
        if (config.dsrSab) { r.diasD += r.sabado } else { r.diasU += r.sabado }
        if (config.dsrFer) { r.diasD += r.feriado } else { r.diasU += r.feriado }

        return r;
    },


      diasQuebrados(a,b){
        var ad = this.dia2intDia(a)
        var am = this.dia2intMes(a)
        var aa = this.dia2intAno(a) - 1900
        var bd = this.dia2intDia(b)
        var bm = this.dia2intMes(b)
        var ba = this.dia2intAno(b) - 1900
      
        var tot1 = this.diasMes(a) - ad
        var tot2 = bd
        var desconto = 0

        if (ad == 1) {
            desconto = (aa==ba && am==bm) ? 0 : this.diasMes(a)
        }
        var pass = (am != bm || aa != ba) ? tot1 + tot2 : bd - ad

        return Math.abs(pass - desconto)
      },

      calcJuros(dia, diaFim, v, modo, proRata) {
        var rju = 0
        var mi = this.mesesInteiros(dia, diaFim)
        var dq = this.diasQuebrados(dia, diaFim)

        if (modo == 'composto') {
            var c2 = 1 + (v / 100)
            var c1 = Math.pow(c2, (1/30))
            var c3 = Math.pow(c2, mi)
            rju = Math.pow(c1, dq)
            if (!proRata) rju = 1
            rju = ((rju * c3)-1)*100 
        } else {
            var x2 = 0
            var c1 = v / 30
            if (!proRata) {
                var x1 = this.dia2intDia(diaFim)
                x2 = this.dia2intDia(dia)

                if ((x1 >= x2) &&
                    (((this.dia2intMes( dia ) != this.dia2intMes( diaFim )) && (this.dia2intAno(dia) != this.dia2intAno( diaFim ))) || 
                    ((this.dia2intMes( dia ) == this.dia2intMes( diaFim )) && (this.dia2intAno( dia ) != this.dia2intAno( diaFim ))  && ( dq > 30 )) ||
                    ((this.dia2intMes( dia ) != this.dia2intMes( diaFim )) && (this.dia2intAno( dia ) == this.dia2intAno( diaFim )))))
                {
                    mi++ 
                }
                dq = 0
            }

            if ((x2 == 1) && ( mi > 0 ) && (this.dia2intMes(dia) !=  this.dia2intMes(diaFim))){
                mi--
            }
            rju = c1 * dq
            c3 = v * mi
            rju = rju + c3
            if (rju < 0) rju = 0
            return rju 
        }
      },

    zeroStr3 (n) {
        var x = parseInt(n)
        if (x < 10)  return '00'+String(n)
        if (x < 100)  return '0'+String(n)
        return String(n)
    },

    hora2intHora : function(d) {
        if (!d) return 0;
        var x = d.indexOf(":")
        if (!x) x = d.indexOf(",")
        if (!x || x<0) return parseInt(d)
        
        return parseInt(d.substring(0,x))
    },

    hora2intMinuto : function(d) {
        if (!d) return 0;
        var x = d.indexOf(":")
        if (x<0) x = d.indexOf(",")
        if (!x || x<0)  return 0;
        if (x+1 == d.length) return 0;
        var s = d.substring(x+1)
        if (s.length==1) s = s+"0"
        return parseInt(s)
    },


      formataHora( s ) {
        if (s == '' || typeof(s) ==='undefined') return "00:00";
        s = String(s)
        s = s.replace(',', ':')
        s = s.replace('.', ':')
        if (s.length == 1) { s = '0' + s; }
        if ((s.length >= 2) && (s[1] ==":")) { s = s + '0' ; } 

        var x = s.indexOf(':')
        if (x < 0) s = s + ':'

        if (s.length == 3) {  s = s+'00'; } 
        if (s.length == 4) s = s+'0'
        return s;
      },

      formataHora3( s ) {
        if (s == '' || typeof(s) ==='undefined') return "000:00";
        s = String(s)
        s = s.replace(',', ':')
        s = s.replace('.', ':')

        var h = this.hora2intHora(s)
        var m = this.hora2intMinuto(s)

        // console.log('h = ',h)

        var r = this.zeroStr3(h)+":"+this.zeroStr(m)

        return r;
      },

      formataNum: function (n, c) {
        var m = 0;
        var char_centavos = ",";
        var char_milhar = ".";
  
        n = String(n);
  
        if (n=="null") return "";
  
        if (n.indexOf("e")>0) { 
          n = '0';
        }
  
        var len = n.length;
        var ponto = n.indexOf(".");
        if (ponto>0) {
          n = n.substr(0,ponto) + char_centavos + n.substr(ponto+1);
        }
  
        if (len>0) {
          if (n[0]==char_centavos) {
            n = '0'+n;
            len++;
            ponto++;
          }
        }
  
        if (c>0) {
          if (ponto<0) {
            n = n + char_centavos;
            ponto = len;
            len++;
          }
          while (  ( ( len-1) - ponto) < c) {
            n = n + '0';
            len++;
          }
          
          if (( ( len-1) - ponto) > c) {
            n = n.substr(0,   ponto+c+1);
          }
          // pontos de milhar 
          m = ponto -3;
          while (m > 0) {
            if ((m!=1) || ((m==1) && (n.substr(0,1)!="-" ))) {
              n = n.substr(0, m)+char_milhar+n.substr(m);
            }
            m = m - 3;
          }
        } else {
          //console.log('ponto: '+ponto);
          if (ponto < 0) ponto = n.length;
          m = ponto -3;
          while (m > 0) {
            if ((m!=1) || ((m==1) && (n.substr(0,1)!="-" ))) {
              n = n.substr(0, m)+char_milhar+n.substr(m);
            }
            m = m - 3;
          }    
        }
  
        return n;
      },
      horaStoD: function (s) {
        if (s.length==6) {
            var hora = this.hora2intHora(s)
            var minutos = this.hora2intMinuto(s)
            minutos = Math.floor( (minutos / 60) * 100 ) 
            s = this.zeroStr3(hora) + ',' + this.zeroStr(minutos)
        }
        return s;
    },

    horaDtoS: function (s) {
        if (s.length==6) {
            var hora = this.hora2intHora(s)
            var minutos = this.hora2intMinuto(s)
            minutos = Math.floor( (minutos / 100) * 60 ) 
            s = this.zeroStr3(hora) + ':' + this.zeroStr(minutos)
        }
        return s;
    },

    JSON_parseAutoCorrige: function ( dados) {
        let j;
        try {
            j = JSON.parse(dados)
            return j
       } catch (e) {
            var x = String(e)
            var p1 = x.indexOf("position ")+9;
            var posicao = x.substring(p1)    
            var recorte = dados.substring(0,posicao)
            try {
                var j2 = JSON.parse(recorte)
            } catch (e) {
                var j2 = {} 
            }
            
            return j2
       }
    }
}

