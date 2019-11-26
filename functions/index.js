const functions = require("firebase-functions")
const admin = require("firebase-admin")

admin.initializeApp(functions.config().firebase)

exports.checkAdmin = functions.auth.user().onCreate(async (user) => {
  const whiteListRef = admin
    .firestore()
    .collection("admin")
    .doc(user.email)
  const snap = await whiteListRef.get()
  if (!snap.exists) {
    console.log(`user [${user.email}] not whitelisted!`)
    return
  }
  await admin.auth().setCustomUserClaims(user.uid, { admin: true })
  console.log(`created user=[${user.email}] set as admin`)
})
