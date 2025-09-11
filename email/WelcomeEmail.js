const config = require('../config')
const comiteeURL = config.get().comiteeURL
const EmailClient = require('./EmailClient')
const EmailCommon = require('./EmailCommon')

const InactiveRenewEmail = {
    send: async function (email, data) {
        let emailContent = `<h3>Loco-Local</h3>
                    <div>
                        <h4>Merci, ${data.firstname} pour votre adhésion !</h4>
                    </div>
                    <div>
                        Votre adhésion débute le ${data.membershipDate} et est valide pour une année.
                    </div>
                    <div>
                        <h5>Merci !</h5>
                    </div>
                    <div>
                        <a href="${comiteeURL}" target="_blank">Comités et implications</a>
                    </div>
                    <div>
                        <h5>Pour nous suivre</h5>                    
                    </div>
                    <div>
                        <a href="https://www.facebook.com/locolocal1">Facebook</a>                        
                    </div>                
                    <div>
                        <a href="https://www.horizonsgaspesiens.net/">Site Web</a>                        
                    </div>                
                    <div>
                        Vous êtes aussi automatiquement inscrit à notre infolettre.
                    </div>                
                    ${EmailCommon.ContactUs}                    
                    `
        return EmailClient.send(
            EmailClient.buildAdminLocoFrom(),
            email,
            "Merci pour votre adhésion",
            emailContent
        )
    }
}

module.exports = InactiveRenewEmail
