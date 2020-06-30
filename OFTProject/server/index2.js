var key = {
            "type": "service_account",
            "project_id": "aerobic-gift-281811",
            "private_key_id": "73b4ccf17f83b48f6212afa98860bce5c7355884",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDr+qEk5JDfHF07\nro4E3Z/Is1dGm9c5SCHEvJimxZy2pVA53b8u/ZXxmSq+NT5ImfFF6BED4QOIIpuu\nzQIeTKKdcBZ+JFiplM1RtlagHO5SkiRIcgaPa+Ln2TBA6eKLr0nV3TQ46YeYs+S5\nTE3PvwV41qUgQGnt4exT0AmBIKP1tDuU6B03LnGFz9wLDvWzXRkOeqZMcqUKwSkG\nPaOHNHPW1kMXCoy+FtELg9lHDQgiziv/C0PWfvLmOdngk0CuZkmCWtyALOzMSlPT\nUpu1mmtKBy44IcqCruNxJLIbxFDFkWpteonvuPBJ6e/0wM2Hkjq9Lu+FriZZrdY3\nU9DyrkQfAgMBAAECggEAQqwe4HIVvnvgma6xYI2PiiClnYUFc6E+LTxN8vytUOt3\nNcpBrJCoT0kDyxb3AINCKIqvWAW4vjts+h/hI9dqMIpNSJmTVWJ9+kLGydkyurCg\nwLk6wkXsp631FLogMHA3r82eZiARGCNnkbUN3Q7vCFu47tpUM4pb/7gtH0cuHAqj\nvZZ/GxGtF3zJ8ANks5CDTdIJPWxtvgG84c0wkGMNkTkzM6PfQln3MRzmoqudWFaC\np/cqIzCmlB92ACPYnILJ1AfDQFKslQWesFz6rzX+ZIeBsl8LU8A02jd9rHDQAy1C\nLefdDqh73qQafzwhRVuXFxAMkldKbT0PwCP2IbN7dQKBgQD+Jq5atIIg6knb+hT+\nR2faXaTMqFF4+XjKIx29fmMfktS4lX3rn74mOSVUvbxrYk0FMmTzlz/Gdo5KvAuZ\nB+7uOuLfdPVnHV9L/l7DbsV1CdT/tq29vZ0moPiA8suCLhWLi+TiGMN4/slgM54s\n02J7BrVv4l180FIyguMVQxdx4wKBgQDtshsHqisusrz1KupY/ShMIadY5EOGtyB4\nxmFgxrdhGxCjuBVBIcIWDuclFYecJrYonGMl0Y7hfcPEEn8kTZHSIDBuPvIwR8iv\nY+t1gS/Xqx3x5Xa1Y3XzR6JTWfoCrfJSmTGSwyyKHXuPIm/7O8Lohgj2yaXw8eSN\nufXx71gJlQKBgFNbbn4zjCatkVIEARSxaN+XLTEu16H8+OAbimqXZH17lCeCaI16\nlExHG/ZiUMVLtYVJ1RCMAA/g3KSobolfr78VM0olO0P5v0LWiFBDKaJMej7wtKVx\n5nRAAaGRgKwO32QomwaJJrutnXDfHTcIkdlWBvZOYWlJjlwgz8gufCcPAoGBALLN\nXr3mSTOIqtG2JbEpRm32ht88XntxOBECEfBtqzZ12I9/gyWKkmhrb38a8fcJu89S\nzNZ/C/8dzuyoiVGytDWfly7nVOHyrckZ3d53fpi6lP0JAsIx/mEyCq6uqX3ogbeW\nm47uGIwQ34htfFU9wEGPyiBy0cws+iOOtq72v3/9AoGBAN2JW7lDlaxCBJUrniba\nY3uu48DM4USeL05YeVsdeQ7XclZOYa4vE6R0ttKzr15VYafNv3QChisKBKWhbRNR\nHBOTgq4f0tqMGk3Jlz22Lgxe3Qc6EFv6vGIbSkJoqVpOajf3w19nOB2oAIS4lyLL\n2onIz0yNmWHopOZAwQ2zloEM\n-----END PRIVATE KEY-----\n",
            "client_email": "test-email@aerobic-gift-281811.iam.gserviceaccount.com",
            "client_id": "111721377942920599404",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/test-email%40aerobic-gift-281811.iam.gserviceaccount.com"
          };

const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        xoauth2: xoauth2.createXOAuth2Generator({
            user: 'contact@anubhavtrainings.com',
            clientId: '275646007499-2hfmo1j4ot1ds89saqrk8pn1pdh4v5sp.apps.googleusercontent.com',
            clientSecret: 'WIajP-Wif3OWVahkRt--aj73',
            refreshToken: '1//04hBvLq6qONfDCgYIARAAGAQSNwF-L9Ir6rhFpmkpn4nU1PDdZ_CTZKVZK-YPX2cp6f2TWoRaVq692hP0wofSvxOlLOJnzEhq7HY'
        })
    }
}));

// var transporter = nodemailer.createTransport(smtpTransport({
//   service: 'gmail',
//   host: 'smtp.gmail.com',
//   auth: {
//     user: 'contact@anubhavtrainings.com',
//     pass: 'Anubhav@123'
//   }
// }));
var mailOptions = {
    from: 'contact@anubhavtrainings.com',
    to: 'anubhav.abap@gmail.com',
    subject: 'Nodemailer test',
    text: 'Hello World!!'
};

transporter.sendMail(mailOptions, function (err, res) {
    if(err){
        console.log('Error' + err);
    } else {
        console.log('Email Sent');
    }
});
