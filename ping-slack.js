
const axios = require('axios').default;


var u = [ 'https://t-api.debit.com.br/ping', 
          'https://a-api.debit.com.br/atualiza/ping',
          'https://api.debit.com.br/email/ping', 
          'https://api.debit.com.br/lista/ping', 
          'https://api.debit.com.br/menu/ping',
          'https://api.debit.com.br/cobranca/ping',
          'https://api.debit.com.br/share/ping',
          'https://api.debit.com.br/auth/ping',

        //   'https://api3.debit.com.br/cponto/ping',
          'https://a-api.debit.com.br/atualizaExtra/ping',
          'https://a-api.debit.com.br/externoCalcs/ping',

          'https://a-api.debit.com.br/s3050/ping',
            'https://a-api.debit.com.br/s3051/ping',
            'https://a-api.debit.com.br/s3052/ping',
            'https://a-api.debit.com.br/s3053/ping',
            'https://a-api.debit.com.br/s3054/ping',
            'https://a-api.debit.com.br/s3055/ping',
            'https://a-api.debit.com.br/s3056/ping',
            'https://a-api.debit.com.br/s3057/ping',
            'https://a-api.debit.com.br/s3058/ping',
            'https://a-api.debit.com.br/s3059/ping',
            'https://client-api.debit.com.br/atualiza-v1/ping'
        ]

function pingar(url1, mais) {
    console.log('iniciou o teste '+url1)
    setInterval( function() {
        axios.get(url1, { responseType: 'json' })
        .then( function(res) { } )
        .catch( function(error) {
            if (typeof error.response !== 'undefined') {
                axios.post(`https://hooks.slack.com/services/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`, {"text": url1+" nao funcionou"})
            }
        })
    }, (60000 * 3)+mais)
}


var mais = 0

for (var i in u) {
    pingar(u[i], mais)
    mais += 1000
}




