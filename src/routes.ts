import Router from "koa-router";
const router = new Router();

import algorithmia from "algorithmia"
import fs from "fs";
let client: any = algorithmia("simaMBdCR9ijBkR18JRVfbT0BRF1");

var imageDirectory = client.dir("data://tevonsb/images")


router.post("/", async (ctx, next) => {
  try {
    console.log("Recieved request");
    const testFile = __dirname+"/reu.jpg";
    var testHostedFile = "data://tevonsb/images/" + "reu.jpg";
    console.log(ctx.request);
    console.log(ctx.request.body.image);
    client.file(testHostedFile).exists(function(exists: Boolean) {
        // Check if file exists, if it doesn't create it
        if (exists == false) {
            console.log(testFile);
            imageDirectory.putFile(testFile, function(response: any) {
                if (response.error) {
                    return console.log("Failed to upload file: " + response.error.message);
                } else {
                  console.log("File uploaded.");
                }
            });
        } else {
            console.log("Your file already exists.")
        }
  });

var input = {
  "images": [
    testHostedFile
  ]
};
client.algo("cv/CensorFace/0.1.3") // timeout is optional
  .pipe(input)
  .then(function(response: any) {
    console.log("Created it!");
    const resp: any = response.get();
    console.log(resp);
    client.file(resp.output[0]).exists(function(exists: Boolean) {
    console.log("Checking if it exists");
    if (exists == true) {
        // Download contents of file as a string
        console.log("Downloading blurred image");
        client.file(resp.output[0]).get(function(err, data) {
            console.log("getting image to download");
            if (err) {
                console.log("Failed to download file.");
                console.log(err);
            } else {
                console.log("Successfully downloaded data.")
                console.log(data);
                fs.writeFileSync(__dirname+"reu_test.png", data);
            }
        });
        console.log(client.file(resp.output[0]));
    }
});
  });
} catch(error){
  console.log(error);
}
  ctx.status = 200;
  await next();
});

export default router;
