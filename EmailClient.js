const config = require('./config')
const nodemailer = require('nodemailer')
const sgMail = require('@sendgrid/mail')
const isMock = config.getConfig().sendgrid === 'mock'
let emailClient
let transport
if (isMock) {
  const Transport = require('nodemailer-mock-transport')
  transport = Transport({})
  emailClient = nodemailer.createTransport(transport)
} else {
  sgMail.setApiKey(config.getConfig().sendgrid.key)
}

const sprintf = require('sprintf-js').sprintf
const supportTextFR = {
  text: 'Pour plus d\'information visitez la section support de notre site',
  link: 'www.partageheure.com'
}
const supportTextEN = {
  text: 'For more information visit the support section of our website',
  link: 'www.partageheure.com'
}
const EmailClient = {
  client: emailClient,
  transport: transport,
  sendTemplateEmail: function (to, template, variables) {
    let msg = {
      to: to,
      from: EmailClient.buildFrom("horizonsgaspesiens@gmail.com"),
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
  },
  addSupportText: function (emailDescription, language) {
    const content = language.toUpperCase() === 'FR' ? supportTextFR : supportTextEN
    emailDescription.html += '<br><br>' + content.text + ' ' + '<a href=\'' + content.link + '\'>' + content.link + '</a>'
  },
  addEmailNumber: function (emailDescription, language, emailNumber) {
    emailDescription.html += '<br><br>' + '<span style=\'color:#A9A9A9;\'>' + language.toUpperCase() + ' ' + emailNumber + '</span>'
  },
  buildEmailInLanguages: function (frenchContent, englishContent, dynamicData, emailNumber) {
    return {
      'FR': EmailClient._buildEmail(frenchContent, dynamicData, emailNumber, 'FR'),
      'EN': EmailClient._buildEmail(englishContent, dynamicData, emailNumber, 'EN')
    }
  },
  _buildEmail: function (emailText, dynamicData, emailNumber, locale) {
    const sprintfArguments = [emailText.content].concat(dynamicData)
    const emailContent = {
      from: EmailClient.buildFrom(emailText.from),
      subject: emailText.subject,
      html: sprintf.apply(
        null,
        sprintfArguments
      )
    }
    EmailClient.addSupportText(emailContent, locale)
    EmailClient.addEmailNumber(emailContent, locale, emailNumber)
    return emailContent
  }
}
module.exports = EmailClient
