import config from "../config";

const accountSid = config.twilioAccountSid;
const authToken = config.twilioAuthToken;
const client = require("twilio")(accountSid, authToken);

export async function twilioClientSenderSMS(bodyMessage, clientNumber) {
  const formattedNumber = `+55${clientNumber}`;
  const message = await client.messages
    .create({
      body: bodyMessage,
      from: config.twilioPhoneNumber,
      to: formattedNumber,
    })
    .then()
    .catch(err => {
      console.log(err)
    });
}

export async function twilioClientSenderWhatsApp(clientNumber, verificationLink) {
  const cleanClientNumber = clientNumber.replace(/\s/g, '');

  const formattedNumber = `whatsapp:+55${cleanClientNumber}`;
  const formattedFromNumber = `whatsapp:${config.twilioPhoneNumberWhatsApp}`;

  try {
    await client.messages.create({
      contentSid: 'HX51cf94a73ed11d2ae39769e66478e451',
      contentVariables: JSON.stringify({ 3: verificationLink }),
      from: formattedFromNumber,
      messagingServiceSid: 'MG756220f26c2bb38267f555d8cc11510c',
      to: formattedNumber,
    });
    console.log("Mensagem enviada via WhatsApp com sucesso!");
    console.log("Número do cliente:", formattedNumber);
    console.log("Link de verificação:", verificationLink);
  } catch (err) {
    console.error("Erro ao enviar mensagem via WhatsApp:", err);
  }
}

