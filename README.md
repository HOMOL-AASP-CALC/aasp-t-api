# Debit A API

Este projeto reúne diversas rotinas de cálculo e ferramentas utilizadas pelo sistema Debit. A aplicação é baseada em Node.js.

## Instalação

1. Certifique-se de possuir o **Node.js** instalado (versão 18 ou superior).
2. Clone este repositório e instale as dependências:

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto definindo as variáveis de ambiente utilizadas. Segue um exemplo de configuração:

```ini

MYSQL_host=localhost
MYSQL_user=root
MYSQL_password=simples123
MYSQL_database=debit-trabalhista

servidorWWW=https://www.aasp.org.br
servidorAPI=https://api.aasp.org 

pasta_calculos=/Users/mrozgrin/calculos_trabalhistas
```



## Uso

Após configurar as variáveis de ambiente, inicie o servidor com:

```bash
pm2 start ecosystem.js
```


## Configuração do Proxy reverso (exemplo abaixo com nginx)


```config

    server {
        listen  80;
        server_name  t-api.fastbet.win;

        location /trabalhista-w {
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $host;
            proxy_pass http://127.0.0.1:3010;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        location /trabalhistasocket {
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $host;
            proxy_pass http://127.0.0.1:3010;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

    }


```
