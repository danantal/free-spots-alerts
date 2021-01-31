/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const accountSid = 'AC367e8b66199baf01b3098f074b2662aa'; 
const authToken = '39fb4dd30849e5c2e522a150c025cf2e'; 
const client = require('twilio')(accountSid, authToken); 

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    log (message, ...args) {
      console.log(message, ...args)
      return null
    }
  })

  on("task", {
    sendSms ({to, text}) {
      console.log("sending message", to, text)
      return client.messages.create({         
         to,
         messagingServiceSid: 'MG2c3c0a01ad03065276dfdef78b8c4a9d', 
         body: text
       })
      .then(message => {
        console.log("message sid", message.sid)
        return message.sid;
      }) 
      .done();
    }
  })
}
