import createClient from  'twilio';

export default (on, config) => {
  const accountSid = config.env.accountSid;
  const authToken = config.env.authToken;
  const messagingServiceSid = config.env.messagingServiceSid;

  const client = createClient(accountSid, authToken)

  on('task', {
    log (message, ...args) {
      console.log(message, ...args)
      return null
    }
  })

  on("task", {
    sendSms ({to, text}) {
      console.log(`sending message to '${to}' with text: ${text}`)
      return client.messages.create({         
         to,
         messagingServiceSid, 
         body: text
       })
      .then(message => {
        console.log("message sid", message.sid)
        return message.sid;
      }) 
    }
  })
}
