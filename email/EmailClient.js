const config = require('../config')
const nodemailer = require('nodemailer')
const Resend = require('resend')
const isMock = config.get().resend === 'mock'
let emailClient
let transport
let resend
if (isMock) {
  const Transport = require('nodemailer-mock-transport')
  transport = Transport({})
  emailClient = nodemailer.createTransport(transport)
} else {
  resend = new Resend.Resend(config.get().resend)
}
const EmailClient = {
  client: emailClient,
  transport: transport,
  send: async function (from, to, subject, html) {
    const msg = {
      from,
      to: to.toLowerCase().trim(),
      subject,
      html: html.replace(/\n/g, "")
    }
    console.log('sending email ' + JSON.stringify(msg))
    if (isMock) {
      return new Promise(function (resolve, reject) {
        EmailClient.client.sendMail(msg, function (err) {
          if (err) {
            reject(err)
          } else {
            resolve({})
          }
        })
      })
    } else {
      const { data, error } = await resend.emails.send(msg)
      if (error) {
        return console.error(error);
      }
      console.log(data);
    }
  },
  buildAdminLocoFrom: function () {
    return EmailClient.buildFrom("admin@loco-local.net");
  },
  buildFrom: function (fromEmail) {
    return 'Loco Local <' + fromEmail + '>'
  }
}
module.exports = EmailClient
