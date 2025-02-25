const config = require('./config')
const nodemailer = require('nodemailer')
const sgMail = require('@sendgrid/mail')
const isMock = config.get().sendgrid === 'mock'
let emailClient
let transport
if (isMock) {
  const Transport = require('nodemailer-mock-transport')
  transport = Transport({})
  emailClient = nodemailer.createTransport(transport)
} else {
  sgMail.setApiKey(config.get().sendgrid.key)
}

const EmailClient = {
  client: emailClient,
  transport: transport,
  sendTemplateEmail: function (to, template, variables) {
    let msg = {
      to: to,
      from: EmailClient.buildFrom("admin@loco-local.net"),
      templateId: template,
      dynamic_template_data: variables
    };
    console.log('sending email to template ' + JSON.stringify(msg));
    if (isMock) {
      return new Promise(function (resolve, reject) {
        EmailClient.client.sendMail(msg, function (err) {
          if (err) {
            console.log(err);
            reject(err);
          }
          else {
            resolve([{
              statusCode: 200
            }]);
          }
        });
      });
    } else {
      return sgMail.send(msg)
    }
  },
  buildFrom: function (fromEmail) {
    return 'Loco Local <' + fromEmail + '>'
  }
}
module.exports = EmailClient
