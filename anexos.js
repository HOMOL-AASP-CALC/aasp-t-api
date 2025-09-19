
module.exports = function(var1) {

    this.info = {
        posicao: var1.posicao,
        titulo: 'Demonstrativo da Evolução Salarial', 
        prefixo: 'salario', 
        id: 1, 
        visivel: 1,
        somarResumo: "c", 
        resultadoResumo: 0, 
        resultadoIRRF: 0  
    }

    this.colunas = [
        { titulo: 'Data', tipo: 'data',  nome: "dia"},
        { titulo: 'Salário', tipo: 'v', casas: 2, nome: "a"},
        { titulo: 'Índice Correção', tipo: 'f', casas:9, nome: "b"},
        { titulo: 'Resultado', tipo: 'f', casas: 2, nome:"c", "somarResumo": true},
        { titulo: 'INSS', tipo: 'f', casas: 2, nome:"d" },
        { titulo: 'IRRF', tipo: 'f', casas: 2, nome:"e" },
    ]

    this.planilha = {}   

    this.setup = function(i,f) {
        for (var i = i; i <= f; i++) {
            this.planilha[i] = {dia: i, a: 10, b: 22, c: 0}  
        }
    }

    this.calc = function () {
        var totalResumo = 0 
        for (var i in this.planilha) {
            var l  = this.planilha[i]
            l.c = l.a + l.b
            
            // if (this.somarResumo) 
            totalResumo += l.c 

            this.planilha[i] = l 
        }
        this.info.resultadoResumo = totalResumo 
    }

    this.set = function(dia, coluna, valor) {
        this.planilha[dia][coluna] = valor 
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

    if (var1.inicio>0 ) {
        this.setup(var1.inicio, var1.fim);
        this.posicao = var1.posicao 
    } else {
        this.info = var1.info 
        this.colunas = var1.colunas
        this.planilha = var1.planilha 
    }
  
}

