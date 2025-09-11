const EmailClient = require('./EmailClient')

const DuplicatesEmail = {
    send: async function (email, data) {
        let emailContent = `
                    Les courriels en duplicats:,
                    <div>                        
                        ${data.emailsInDuplicate}
                    </div>
                    <div>
                        Ce courriel est envoyé à horizonsgaspesiens@gmail.com, une fois par semaine, le lundi
                    </div>                                    
                    `
        return EmailClient.send(
            EmailClient.buildAdminLocoFrom(),
            email,
            "Courriels en duplicat",
            emailContent
        )
    }
};

module.exports = DuplicatesEmail;
