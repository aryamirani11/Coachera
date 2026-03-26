require('dotenv').config({ path: '.env.local' });

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in process.env");
    return;
  }

  const fileContent = "This is a tiny test content simulating a video file chunk.";
  
  console.log("1. Uploading chunk to Gemini File API...");
  try {
      const uploadRes = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`, {
        method: "POST",
        headers: {
          "X-Goog-Upload-Protocol": "raw",
          "X-Goog-Upload-File-Name": "test_video.mp4",
          "Content-Type": "video/mp4",
        },
        body: fileContent,
      });

      const fileData = await uploadRes.json();
      console.log("Upload Response Payload:", JSON.stringify(fileData, null, 2));
      if (!uploadRes.ok) return;

      const fileName = fileData.file.name;
      console.log(`2. Polling status for ${fileName}...`);
      
      const statusRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`);
      const statusData = await statusRes.json();
      console.log("Status Polling Response:", JSON.stringify(statusData, null, 2));
      
      if (statusData.state === "ACTIVE") {
          console.log("\n3. Invoking Context to gemini-2.0-flash...");
          const genReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({
                  contents: [{
                      parts: [
                          {fileData: {mimeType: "video/mp4", fileUri: fileData.file.uri}},
                          {text: "Briefly analyze."}
                      ]
                  }]
              })
          });
          const genRes = await genReq.json();
          if(genRes.candidates?.[0]?.content?.parts?.[0]?.text) {
              console.log("✅ Analysis Result:", genRes.candidates[0].content.parts[0].text);
          } else {
              console.log("❌ Generation Failed:", JSON.stringify(genRes, null, 2));
          }
      } else {
          console.log(`❌ Generation blocked. File state is: ${statusData.state}`);
      }
  } catch (e) {
      console.error("Execution error:", e);
  }
}
run();
