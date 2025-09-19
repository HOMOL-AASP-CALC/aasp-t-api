const PDFDocument = require("pdfkit");
var logoInfo = {} 
var rowBottomY = 0;
var startY = 0 

class PDFDocumentWithTables extends PDFDocument {
    constructor(options) {
        super(options);
        var that = this
        logoInfo = options.logoInfo

        // this.on("pageAdded", async () => {
        //     await that.cabecalho()
        //     startY = 150; 
        //     rowBottomY = 145;
        // });


    }

    strCheck ( s ) {
        return (typeof s === 'undefined') ? "" : s 
    } 

    async cabecalho ( dump,  titulo1 ) {
        var myDoc = this 
        const entrelinhas = 0.3

        var dataURI = logoInfo
        var margem_esquerda = 20 

        if (dataURI != 'sem_logo') {
            var largura = Number(dataURI.largura)
            var altura = Number(dataURI.altura)

            var max_width = 120;
            var max_height = 60;

             // Não deixa a imagem ser maior que o limite - Verifica Largura
             if (largura > max_width) {
                 var tamanho_proporcional = max_width / largura;
                 largura *= tamanho_proporcional;
                 altura *=  tamanho_proporcional;
             }

             // Não deixa a imagem ser maior que o limite - Verifica Altura
             if(altura > max_height){
                 var tamanho_proporcional = max_height / altura;
                 largura *= tamanho_proporcional;
                 altura *=  tamanho_proporcional;
             }


            this.image(dataURI.img, 10, 10, { fit: [largura, altura ] })
            this.y += altura + 20
            // rowBottomY = this.y 
            margem_esquerda = largura + 20
        }

        var tab1 = dump.tabelaCorrecaoNome        
        var margem_direita = 820 - (margem_esquerda)
        var margem_direita2 = (margem_direita+margem_esquerda )- 30

        myDoc.font('Helvetica')
        myDoc.fontSize(8)
        // myDoc.text(`Processo: `+this.strCheck( dump.dados_processo ) , 20, 20); 
        myDoc.text(`Processo: `+this.strCheck( dump.dados_processo ) , margem_esquerda+10, 20);
        
        myDoc.moveDown(entrelinhas).text(`Vara: `+this.strCheck(dump.dados_vara));
        myDoc.moveDown(entrelinhas).text(`Reclamante: `+this.strCheck(dump.dados_reclamante)); 
        myDoc.moveDown(entrelinhas).text(`Adv. Reclamante: `+this.strCheck(dump.dados_adv_reclamante));
        myDoc.moveDown(entrelinhas).text(`Reclamada: `+this.strCheck(dump.dados_reclamada)); 
        myDoc.moveDown(entrelinhas).text(`Adv. Reclamada: `+this.strCheck(dump.dados_adv_reclamada));

        myDoc.text(`Data de admissão: `+dump.dataad, 20, 20, {width: margem_direita2, align: 'right' }); 
        myDoc.moveDown(entrelinhas).text(`Data de demissão: `+dump.datade, {width: margem_direita2, align: 'right' });
        myDoc.moveDown(entrelinhas).text(`Data de distribuição: `+dump.datadi, {width: margem_direita2, align: 'right' });
        myDoc.moveDown(entrelinhas).text(`Tabela de correção: `+tab1, {width: margem_direita2, align: 'right' });

        myDoc.lineWidth(0);
        myDoc.rect(margem_esquerda, 10, margem_direita, 85).fillOpacity(0.1).fillAndStroke("#DDD", "#DDD")
        myDoc.fontSize(16).fillOpacity(1)

        myDoc.fillColor('#000').text(titulo1, 10, 110); 
        myDoc.lineWidth(1);   
        myDoc.moveTo(10, 135).lineTo(820, 135).stroke()

        myDoc.fontSize(8)
    }

    table(table, arg0, arg1, arg2) {
        rowBottomY = 145;
        this.page.margins.bottom = 20
        let startX = this.page.margins.left
        startY = this.y;
        let options = {};

        if ((typeof arg0 === "number") && (typeof arg1 === "number")) {
            startX = arg0;
            startY = arg1;

            if (typeof arg2 === "object") options = arg2;
        } else if (typeof arg0 === "object") {  options = arg0; }


        const paddingLeft = 5;
        const paddingTop = 2
        const paddingBottom = 5
        const columnCount = table.headers.length;
        const columnSpacing = options.columnSpacing || 15;
        const rowSpacing = options.rowSpacing || 5;
        const usableWidth = options.width || (this.page.width - this.page.margins.left - this.page.margins.right);
        this.titulo = table.titulo 

        this.prepareHeader = options.prepareHeader || (() => { this.cabecalho( table.v, table.titulo )  });
        const prepareRow = options.prepareRow || (() => { });

        const columnAlign = function(i) {
            if (i == 0) return 'left';

            if (table.tipo == 'reflexo') {
                if (i <= 1) return 'left'; 
                if (i == 2) return 'center';
            }
            return 'right';
        }

        const columnContainerWidth = function(i) {
            var usableWidth1 = usableWidth 
            var columnCount1 = columnCount 
            if (table.tipo == 'reflexo') {
                if (i == 0) return 50; 
                if (i == 1) return 170;
                if (i == 2) return 60;
                usableWidth1 = usableWidth - 280
                columnCount1 = columnCount - 3
            }
            return usableWidth1 / columnCount1;
        }

        const SUMcolumnContainerWidth = function(i) {
            var soma = 0
            for (var x = 0; x < i; x++) {
                soma += columnContainerWidth(x)
            }
            return soma;
        }

        const columnWidth = function(i) {
            return  columnContainerWidth(i) - columnSpacing;
        }

        const computeRowHeight = (row) => {
            let result = 0;

            row.forEach((cell, i) => {
                // não sei se a variavel "i" esta ok 
                const cellHeight = this.heightOfString(cell, {
                    width: columnWidth(i)-5,
                    align: columnAlign(i)
                });
                result = Math.max(result, cellHeight);
            });

            return result + rowSpacing;
        };

        const maxY = this.page.height - this.page.margins.bottom;
        
        
        this.on("pageAdded", () => {
            startY = 150; 
            rowBottomY = 145;
        });

        // Allow the user to override style for headers
        if (!options.apenasTabela) {
            this.prepareHeader(table.titulo);
        }

        startY = options.inicioY ||  150
        
        // Check to have enough room for header and first rows
        if (startY + 3 * computeRowHeight(table.headers) > maxY) {
            this.addPage({ layout: 'landscape', size : 'A4'});
            this.prepareHeader(table.titulo);
        }
        
       

        if (table.descricaoTabela) {
            this.font('Helvetica-Bold')
            this.fill('black').opacity(1)
            this.text(table.descricaoTabela, startX + paddingLeft, startY, {
                width: SUMcolumnContainerWidth(2), align: 'center'
            });
    
            // this.rect(startX, rowBottomYHeader-paddingTop,  SUMcolumnContainerWidth(1),  rowHeight + paddingBottom ).lineWidth(1)
            this.opacity(0.1).fillOpacity(0).fillAndStroke("black").opacity(1);
            this.font('Helvetica')
            this.moveDown(20)
            startY += 30
        }
        
        var rowBottomYHeader = startY - paddingTop - 4 
        const rowHeight = computeRowHeight(table.headers);
        table.headers.forEach((header, i) => {
            var startXText =  startX +  SUMcolumnContainerWidth(i)
            this.font('Helvetica-Bold')
            this.fill('black').opacity(1)
            this.text(header, startXText + paddingLeft, startY, {
                width: columnWidth(i),
                align: columnAlign(i)
            });

            this.rect(startXText, rowBottomYHeader-paddingTop,  columnContainerWidth(i),  rowHeight + paddingBottom ).lineWidth(1)
            this.opacity(0.1).fillOpacity(0).fillAndStroke("black").opacity(1);
            this.font('Helvetica')
        });

        // Refresh the y coordinate of the bottom of the headers row
        rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);


        // Separation line between headers and rows
        this.moveTo(startX, rowBottomY - rowSpacing * 0.5)

        table.rows.forEach((row, i) => {
            var linha = i
            const rowHeight = computeRowHeight(row);

            if (row[0] == "Total" || row[0] == "Subtotal" || row[0] == "Média") {
                this.font('Helvetica-Bold')
            } else {
                this.font('Helvetica')
            }

            // Switch to next page if we cannot go any further because the space is over.
            // For safety, consider 3 rows margin instead of just one

            if (startY + 3 * rowHeight < maxY) {
                startY = rowBottomY + rowSpacing;
                // startY = startY + rowSpacing +rowHeight;
                // console.log( 'dentro od IF startY ', rowBottomY, startY)
            }    
            else {
                this.addPage( { layout: 'landscape', size : 'A4'} );
                this.prepareHeader(table.titulo);
                startY = 150 
                //---
                var rowBottomYHeader = startY - paddingTop - 4 
                // var rowBottomYHeader =  Math.max(startY + computeRowHeight(table.headers), rowBottomY); 
                const rowHeight = computeRowHeight(table.headers);
                table.headers.forEach((header, i) => {
                    // var startXText =  startX + i * columnContainerWidth
                    var startXText =  startX +SUMcolumnContainerWidth(i)
                    this.font('Helvetica-Bold')
                    this.fill('black').opacity(1)
                    this.text(header, startXText + paddingLeft, startY, {
                        width: columnWidth(i),
                        align: columnAlign(i)
                    });

                    this.rect(startXText, rowBottomYHeader-paddingTop,  columnContainerWidth(i),  rowHeight + paddingBottom ).lineWidth(1)
                    this.opacity(1).stroke().opacity(1);
                    this.font('Helvetica')
                });

                // Refresh the y coordinate of the bottom of the headers row
                rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);
                startY = rowBottomY + 5
            }

            // Allow the user to override style for rows
            prepareRow(row, i);

            // Print all cells of the current row
            row.forEach((cell, i) => {
                var startXText =  startX +  SUMcolumnContainerWidth(i)
                // var startXText =  startX + i * columnContainerWidth
                var cor = 'black'
                // console.log('cell',cell, typeof cell)
                if (typeof cell == 'string' && cell.substring(0,3) == "*x*") {
                    cor = '#BBB'
                    cell = cell.substring(3)
                }
                
                this.fillColor(cor).text(cell, startXText + paddingLeft, startY, {
                    width: columnWidth(i),
                    align: columnAlign(i),
                    strike: (cor != 'black')
                });

                this.rect(startXText, rowBottomY-paddingTop,  columnContainerWidth(i),  rowHeight +paddingBottom ).lineWidth(1)

                if ((linha%2)==1) {
                    this.opacity(0.1).fillOpacity(0).fillAndStroke("black").opacity(1);
                } else {
                    this.opacity(0.1).fillAndStroke("black").opacity(1);
                }
            });

            // Refresh the y coordinate of the bottom of this row
            rowBottomY = Math.max(startY + rowHeight, rowBottomY);
        });

        this.x = startX;
        this.moveDown();

        return this;
    }
}

module.exports = PDFDocumentWithTables;