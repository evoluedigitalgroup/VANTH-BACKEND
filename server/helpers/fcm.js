/**
 * Firebase Cloud Messaging (FCM) can be used to send messages to clients on iOS, Android and Web.
 *
 * This sample uses FCM to send two types of messages to clients that are subscribed to the `news`
 * topic. One type of message is a simple notification message (display message). The other is
 * a notification message (display notification) with platform specific customizations. For example,
 * a badge is added to messages that are sent to iOS devices.
 */
import https from "https";
import fs from "fs";

import config from "../config";
import { google } from "googleapis";
var PROJECT_ID = config.firebaseProjectId;
var HOST = "fcm.googleapis.com";
var PATH = "/v1/projects/" + PROJECT_ID + "/messages:send";
var MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
var SCOPES = [MESSAGING_SCOPE];

/**
 * Get a valid access token.
 */
// [START retrieve_access_token]
function getAccessToken() {
  return new Promise(function (resolve, reject) {
    // console.log("config.firebase.clientEmail : ", config.firebase.clientEmail);
    // console.log("config.firebase.privateKey : ", config.firebase.privateKey);
    const firebaseData = JSON.parse(
      fs.readFileSync(config.firebasePathToServiceAcc, {
        encoding: "utf8",
        flag: "r",
      }),
    );
    // console.log("\n\n\n\nfirebaseData : ", firebaseData);
    var jwtClient = new google.auth.JWT(
      firebaseData.client_email,
      null,
      firebaseData.private_key,
      SCOPES,
      null,
    );
    jwtClient.authorize(function (err, tokens) {
      console.log("ERR ::", err);
      if (err) {
        reject(err);
        return;
      }
      // console.log("ACCESS TOKEN :: ", tokens.access_token);
      resolve(tokens.access_token);
    });
  });
}
// [END retrieve_access_token]

/**
 * Send HTTP request to FCM with given message.
 *
 * @param {JSON} fcmMessage will make up the body of the request.
 */

function sendFcm(fcmToken, fcmMessage) {
  if (fcmToken) {
    const messageBody = {
      message: {
        token: fcmToken,
        notification: fcmMessage,
        android: {
          direct_boot_ok: true,
          notification: {
            sound: "default",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
            },
          },
        },
        data: {
          story_id: "story_12345",
        },
      },
    };
    getAccessToken().then(function (accessToken) {
      var options = {
        hostname: HOST,
        path: PATH,
        method: "POST",
        // [START use_access_token]
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      };

      var request = https.request(options, function (resp) {
        resp.setEncoding("utf8");
        resp.on("data", function (data) {
          console.log("Message sent to Firebase for delivery, response:");
          // console.log(data);
        });
      });

      request.on("error", function (err) {
        console.log("Unable to send message to Firebase");
        console.log(err);
      });

      request.write(JSON.stringify(messageBody));
      request.end();
    });
  }
}

export default sendFcm;
