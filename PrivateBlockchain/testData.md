Test Data

/submitstar endpoint

req.body.address && req.body.message && req.body.signature && req.body.star

API : POST requestValidation
fill with Bitcoin address (example) -> you may use https://reinproject.org/bitcoin-signature-tool/#sign
{
    "address":"1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN"
}

API : POST submitstar with message output by requestValidation

message is under format :
1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN:1618722273:starRegistry

signature :
sign message using https://reinproject.org/bitcoin-signature-tool/#sign using above message

{ "address": "",
    "message": "",
    "signature": "",
    "star": {   "dec": "72° 24' 53.8",
                "ra": "12h 36m 2.8s",
                "story": "Testing the story 1" }
}

