import * as functions from 'firebase-functions';

const admin = require("firebase-admin");

admin.initializeApp(functions.config().firebase);

const SENGRID_API_KEY = functions.config().sengrid.key;

const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(SENGRID_API_KEY);
exports.firebasestoreEmail = functions.firestore
    .document('orders/{id}/')
    .onCreate(event => {
        const orderId = event.get('id');

        const db = admin.firestore();

        return db.collection('users').doc(orderId.data().userId)
            .get()
            .then((docs : any) => {
                const users = docs.data();
                const msg = {
                    to : users.email,
                    from : 'hello@angularfirebase.com',
                    subject : 'New Order',
                    templateId : '86be5fb9-f22b-420c-992d-0a4f45e0ef59',
                    substitutionWrappers : ['{{','}}'],
                    substitution : {
                        username : users.email,
                        order_id : orderId
                    }
                };
                return sgMail.send(msg);
            })
            .then(() => {
                console.log("email sent");
            }).catch(() => {
                console.log("error");
            })

    })
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
