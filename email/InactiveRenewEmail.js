const EmailClient = require('./EmailClient')
const EmailCommon = require('./EmailCommon')

const InactiveRenewEmail = {
    send: async function (email, data) {
        let emailContent = `<h3>Loco-Local</h3>
                    Bonjour,
                    <div>
                        Votre adhésion à la coopérative est échu depuis le <strong>${data.expiredDate}</strong>
                    </div>
                    <div>
                        S'il s'agit d'une erreur, <a href="https://horizonsgaspesiens.net/contact" target="_blank">contactez-nous</a>.
                    </div>
                    <div>
                        <a href="https://horizonsgaspesiens.net/devenez-membre" target="_blank">Renouveller et payer votre adhésion</a>
                    </div>
                    <div>
                        Votre adhésion encourage les bénévoles et la coop dans sa mission:                
                    </div>
                    <div>
                        Soutenir le partage de ressources, de lieux et connaissances au service de la solidarité et de la résilience.
                    </div>                    
                    ${EmailCommon.PromoteMission}
                    ${EmailCommon.ServicesAuxMembres}
                    ${EmailCommon.buildMembershipStatusButton(email)}
                    ${EmailCommon.ContactUs}
                    `
        return EmailClient.send(
            EmailClient.buildAdminLocoFrom(),
            email,
            "Statut inactif",
            emailContent
        )
    }
}

module.exports = InactiveRenewEmail
