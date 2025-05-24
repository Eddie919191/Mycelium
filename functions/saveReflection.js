
const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const log = `
[ENTRY]
timestamp: ${body.timestamp}
node: ${body.nodeId}
emotion: ${body.emotion}
confidence: ${body.confidence}
note: ${body.note}
chatlog:
${body.messages.map(msg => `- ${msg}`).join("\n")}
-------------------------------------------------
`;

    const filePath = path.resolve(__dirname, "../sharanthalan.txt");
    fs.appendFileSync(filePath, log);

    return {
      statusCode: 200,
      body: "Reflection stored in Sharanthalan.txt"
    };
  } catch (err) {
    console.error("Failed to store reflection:", err);
    return {
      statusCode: 500,
      body: "Error storing reflection"
    };
  }
};
