const EmailCommon = {
    PromoteMission: `
                    <div>
                        Votre adhésion encourage les bénévoles et la coop dans sa mission:
                    </div>
                    <div>
                        Soutenir le partage de ressources, de lieux et connaissances au service de la solidarité et de la résilience.
                    </div>                
    `,
    ServicesAuxMembres: `
                        <div>                
                        <h4>Services réservés aux membres</h4>
                        <ul>
                            <li style="margin-bottom:14px;">
                                <a href="https://horizonsgaspesiens.net/calendrier" target="_blank">Profiter du Loco Local en dehors des activités.</a>
                            </li>                           
                            <li style="margin-bottom:14px;">
                                <a href="https://horizonsgaspesiens.net/groupe-achat" target="_blank">Participer au groupe d'achat.</a>                                                    
                            </li>                           
                            <li style="margin-bottom:14px;">                            
                                <a href="https://horizonsgaspesiens.net/calendrier" target="_blank">Organiser une activité au Loco Local.</a>
                            </li>
                            <li style="margin-bottom:14px;">                            
                                <a href="https://horizonsgaspesiens.net/gouvernance" target="_blank">Orienter le développement de la coop</a>
                            </li>                        
                            <li style="margin-bottom:14px;">                            
                                <a href="https://horizonsgaspesiens.net/" target="_blank">Soutenir les initiatives des membres</a>
                            </li>                                                
                        </ul>
                    </div>
                    `,
    buildMembershipStatusButton: function (email) {
        return `
                    <div>                
                        <a href="https://www.horizonsgaspesiens.net/adhesion/${email}">Votre statut d'adhésion</a>                        
                    </div>
                    `
    },
    ContactUs: `   <div>
                        <div>
                            <a href="https://www.horizonsgaspesiens.net/contact">Contactez-nous</a>
                        </div>
                    </div>
                    `
};
module.exports = EmailCommon;