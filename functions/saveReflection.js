
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const reflection = {
      timestamp: body.timestamp,
      nodeId: body.nodeId,
      emotion: body.emotion,
      confidence: body.confidence,
      note: body.note,
      messages: body.messages
    };

    await db.collection("reflections").add(reflection);

    return {
      statusCode: 200,
      body: "Reflection stored in Firestore"
    };
  } catch (err) {
    console.error("Failed to store reflection:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
