const EmailClient = require('./EmailClient')
const EmailCommon = require('./EmailCommon')
const config = require('../config')
const comiteeURL = config.get().comiteeURL

const ExpireSoonEmail = {
    send: async function (email, data) {
        let emailContent = `<h3>Loco-Local</h3>
                    Bonjour ${data.firstname},
                    <div>                        
                        Votre adhésion à la coopérative expire dans ${data.expirationInDays} jours.
                    </div>
                    <div>
                        <a href="https://horizonsgaspesiens.net/devenez-membre" target="_blank">Renouveller et payer votre adhésion</a>
                    </div>                    
                    ${EmailCommon.PromoteMission}
                    ${EmailCommon.ServicesAuxMembres}
                    ${EmailCommon.buildMembershipStatusButton(email)}
                    <div>
                        <a href="${comiteeURL}" target="_blank">Comités et implications</a>
                    </div>                    
                    ${EmailCommon.ContactUs}
                    `
        return EmailClient.send(
            EmailClient.buildAdminLocoFrom(),
            email,
            "Votre adhésion à la Coopérative Horizons Gaspésiens.",
            emailContent
        )
    }
}

module.exports = ExpireSoonEmail
