const express = require("express");
const app = express();

const { processMessage } = require("./services/agent.service");

app.use(express.json());

app.post("/process-message", async (req, res) => {
  try {
    await processMessage(req.body);
    return res.status(200).json({ response: `Your request was processed` });
  } catch(e){
    console.error("Error processing message:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
})