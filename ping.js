
const axios = require('axios').default;
var player = require('play-sound')(opts = {})


// var u1 = 'http://api.fastbet.win/ping' 
var u1 = 'https://t-api.debit.com.br/ping' 

setInterval( function() {
    axios.get(u1, { responseType: 'json' })
    .then( function(res) { console.log('ok')} )
    .catch( function(error) {
        if (typeof error.response !== 'undefined') {
            console.log(error.response.statusText)
        } else {
            console.log(error)
        }

        player.play('som_erro.wav')
    })

}, 5000)


