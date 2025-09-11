const EmailClient = require('./EmailClient')
const EmailCommon = require('./EmailCommon')

const NeverPaidEmail = {
    send: async function (email, data) {
        let emailContent = `<h3>Loco-Local</h3>
                    Bonjour ${data.firstname},
                    <div>                        
                        Le ${data.formDate}, vous avez rempli le formulaire d'adhésion à la Coopérative de Solidarité Horizons Gaspésiens.
                    </div>
                    <div>
                        Nous n'avons toutefois pas enregistré le paiement requis.
                    </div>
                    <div>
                        Pour une première adhésion, les frais sont de 25$ la première année et de 15$ pour un renouvellement.
                    </div>
                    <div>
                        Pour une organisation, les frais sont de 60$ la première année et de 50$ pour un renouvellement.
                    </div>
                      <div>
                        S'il s'agit d'une erreur, <a href="https://horizonsgaspesiens.net/contact" target="_blank">contactez nous</a>
                    </div>                                
                    ${EmailCommon.PromoteMission}
                    ${EmailCommon.ServicesAuxMembres}
                    ${EmailCommon.buildMembershipStatusButton(email)}
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

module.exports = NeverPaidEmail
