import fs from 'fs';
import docusign from "docusign-esign";
import { key } from '../docusignKeys/privatekey';


const apiClient = new docusign.ApiClient();

const secret_key = process.env.DOCUSIGN_SECRET_KEY;
export const accountId = process.env.DOCUSIGN_ACCOUNT_ID;

const client_id = process.env.DOCUSIGN_CLIENT_ID;
const user_id = process.env.DOCUSIGN_USER_ID;


const docuSignBasePath = process.env.DOCUSIGN_BASE_PATH;
export const basePath = `${docuSignBasePath}/${process.env.DOCUSIGN_BASE_API_PATH}`;
const oAuthBasePath = process.env.DOCUSIGN_OAUTH_BASE_PATH;
apiClient.setBasePath(basePath);
apiClient.setOAuthBasePath(oAuthBasePath);

const rsaKey = key;

const jwtLifeSec = 10 * 60; // requested lifetime for the JWT is 10 min


export const getDocuSignJwtToken = async () => {
    const results = await apiClient.requestJWTUserToken(client_id, user_id, 'signature', rsaKey, jwtLifeSec);
    const accessToken = results.body.access_token;
    return accessToken;
};

export const makeEnvelope = (args) => {
    // Data for this method
    // args.signerEmail
    // args.signerName
    // args.signerClientId
    // docFile

    // document 1 (pdf) has tag /sn1/
    //
    // The envelope has one recipients.
    // recipient 1 - signer

    // create the envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.emailSubject = 'Please sign this document';

    // add the documents
    let doc1 = new docusign.Document();
    let doc1b64 = args.documentBase64;
    doc1.documentBase64 = doc1b64;
    doc1.name = 'Lorem Ipsum'; // can be different from actual file name
    doc1.fileExtension = 'pdf';
    doc1.documentId = '3';

    // The order in the docs array determines the order in the envelope
    env.documents = [doc1];

    // Create a signer recipient to sign the document, identified by name and email
    // We set the clientUserId to enable embedded signing for the recipient
    // We're setting the parameters via the object creation
    let signer1 = docusign.Signer.constructFromObject({
        email: args.signerEmail,
        name: args.signerName,
        clientUserId: args.signerClientId,
        recipientId: 1,
    });

    // Create signHere fields (also known as tabs) on the documents,
    // We're using anchor (autoPlace) positioning
    //
    // The DocuSign platform seaches throughout your envelope's
    // documents for matching anchor strings.
    let signHere1 = docusign.SignHere.constructFromObject({
        anchorString: '###SIGN_HERE###',
        anchorYOffset: '10',
        anchorUnits: 'pixels',
        anchorXOffset: '20',
    });
    // Tabs are set per recipient / signer
    let signer1Tabs = docusign.Tabs.constructFromObject({
        signHereTabs: [signHere1],
    });
    signer1.tabs = signer1Tabs;

    // Add the recipient to the envelope object
    let recipients = docusign.Recipients.constructFromObject({
        signers: [signer1],
    });
    env.recipients = recipients;

    // Request that the envelope be sent by setting |status| to "sent".
    // To request that the envelope be created as a draft, set to "created"
    env.status = 'sent';

    return env;
}

export const makeEnvelopes = (envelopeArgs) => {
    // Data for this method
    // args.signerEmail
    // args.signerName
    // args.signerClientId
    // docFile

    // document 1 (pdf) has tag /sn1/
    //
    // The envelope has one recipients.
    // recipient 1 - signer


    let envelopes = [];

    for (let i = 0; i < envelopeArgs.length; i++) {
        const envelop = envelopeArgs[i];


        const documentId = envelop.documentId;
        console.log('documentId : ', documentId);




        // add the documents
        let doc = new docusign.Document();
        doc.documentBase64 = envelop.documentBase64;
        doc.name = envelop.documentName; // can be different from actual file name
        doc.fileExtension = 'pdf';
        doc.documentId = documentId;


        // The order in the docs array determines the order in the envelope

        envelopes = [...envelopes, doc];
    }

    // create the envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.emailSubject = 'Please sign this document';

    env.documents = envelopes;

    // Create a signer recipient to sign the document, identified by name and email
    // We set the clientUserId to enable embedded signing for the recipient
    // We're setting the parameters via the object creation
    let signer1 = docusign.Signer.constructFromObject({
        email: envelopeArgs[0].signerEmail,
        name: envelopeArgs[0].signerName,
        clientUserId: envelopeArgs[0].signerClientId,
        recipientId: envelopeArgs[0].recipientId
    });

    // Create signHere fields (also known as tabs) on the documents,
    // We're using anchor (autoPlace) positioning
    //
    // The DocuSign platform seaches throughout your envelope's
    // documents for matching anchor strings.
    let signHere1 = docusign.SignHere.constructFromObject({
        anchorString: '###SIGN_HERE###',
        anchorYOffset: '10',
        anchorUnits: 'pixels',
        anchorXOffset: '20',
    });
    // Tabs are set per recipient / signer
    let signer1Tabs = docusign.Tabs.constructFromObject({
        signHereTabs: [signHere1],
    });
    signer1.tabs = signer1Tabs;

    // Add the recipient to the envelope object
    let recipients = docusign.Recipients.constructFromObject({
        signers: [signer1],
    });
    env.recipients = recipients;

    // Request that the envelope be sent by setting |status| to "sent".
    // To request that the envelope be created as a draft, set to "created"
    env.status = 'sent';
    return env;
}

export const createEnvelope = async (args) => {
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    let results = null;

    // Step 1. Make the envelope request body
    let envelope = makeEnvelope(args.envelopeArgs);

    // Step 2. call Envelopes::create API method
    // Exceptions will be caught by the calling function
    results = await envelopesApi.createEnvelope(accountId, {
        envelopeDefinition: envelope,
    });

    results.fullUrl = docuSignBasePath + results.uri;

    console.log('results : ', results);

    return results;
}

export const createEnvelopes = async (args) => {
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    let results = null;

    // Step 1. Make the envelope request body
    let envelope = makeEnvelopes(args.envelopeArgs);

    // Step 2. call Envelopes::create API method
    // Exceptions will be caught by the calling function
    results = await envelopesApi.createEnvelope(accountId, {
        envelopeDefinition: envelope,
    });

    return results;
}

export const makeRecipientViewRequest = (args) => {
    // Data for this method
    // args.dsReturnUrl
    // args.signerEmail
    // args.signerName
    // args.signerClientId
    // args.dsPingUrl

    let viewRequest = new docusign.RecipientViewRequest();

    // Set the url where you want the recipient to go once they are done signing
    // should typically be a callback route somewhere in your app.
    // The query parameter is included as an example of how
    // to save/recover state information during the redirect to
    // the DocuSign signing. It's usually better to use
    // the session mechanism of your web framework. Query parameters
    // can be changed/spoofed very easily.
    viewRequest.returnUrl = args.dsReturnUrl;

    // How has your app authenticated the user? In addition to your app's
    // authentication, you can include authenticate steps from DocuSign.
    // Eg, SMS authentication
    viewRequest.authenticationMethod = 'none';

    // Recipient information must match embedded recipient info
    // we used to create the envelope.
    viewRequest.email = args.signerEmail;
    viewRequest.userName = args.signerName;
    viewRequest.clientUserId = args.signerClientId;

    // DocuSign recommends that you redirect to DocuSign for the
    // embedded signing. There are multiple ways to save state.
    // To maintain your application's session, use the pingUrl
    // parameter. It causes the DocuSign signing web page
    // (not the DocuSign server) to send pings via AJAX to your
    // app,
    viewRequest.pingFrequency = args.dsPingUrl ? 600 : undefined; // seconds
    // NOTE: The pings will only be sent if the pingUrl is an https address
    viewRequest.pingUrl = args.dsPingUrl; // optional setting

    return viewRequest;
}

export const generateEnvelopApi = (accessToken) => {
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
    return new docusign.EnvelopesApi(dsApiClient);
}

export const generateRecipientViewRequest = async (token, envelopeId, viewRequest) => {

    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + token);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    const results = await envelopesApi.createRecipientView(accountId, envelopeId, {
        recipientViewRequest: viewRequest,
    });

    return results;
}

export const initiateEmbeddedSigning = async (args) => {
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    let results = null;
    // Call the CreateRecipientView API
    // Exceptions will be caught by the calling function
    results = await envelopesApi.createRecipientView(accountId, args.envelopeId, {
        recipientViewRequest: args.viewRequest,
    });

    return { envelopeId: args.envelopeId, redirectUrl: results.url };
};

export const downloadDocument = async (token, envelopeId, documentId, fileName) => {



    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + token);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    let results = null;


    // Step 2. call Envelopes::create API method
    // Exceptions will be caught by the calling function
    results = await envelopesApi.getDocument(accountId, envelopeId, documentId);

    const outputPath = fileName;

    const signedDocumentPathToTempFile = path.resolve("public", "temp", fileName);

    fs.writeFileSync(signedDocumentPathToTempFile, Buffer.from(data, 'binary'));



    console.log('results : ', results);

    return results;
}