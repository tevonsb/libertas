import Router from "koa-router";
const router = new Router();

import algorithmia from "algorithmia"
import shortid from "shortid";
import fs from "fs";
const fsPromises = fs.promises;
let client: any = algorithmia("simaMBdCR9ijBkR18JRVfbT0BRF1");

var imageDirectory = client.dir("data://tevonsb/images")


router.post("/", async (ctx, next) => {
  try {
    console.log("Recieved request");
    // const testFile = +"/reu.jpg";

    var base64Data = ctx.request.body.image.replace(/^data:image\/png;base64,/, "");
    const id = shortid.generate();
    const hostedFile = `data://tevonsb/images/${id}`;
    const fileName = `${__dirname}/${id}.png`;

    await fsPromises.writeFile(fileName, base64Data, 'base64');

    client.file(hostedFile).exists(function(exists: Boolean) {
        // Check if file exists, if it doesn't create it
        if (exists == false) {
            imageDirectory.putFile(fileName, function(response: any) {
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
    hostedFile
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
            typeof(data);
            console.log("getting image to download");
            if (err) {
                console.log("Failed to download file.");
                console.log(err);
            } else {
                console.log("Successfully downloaded data.")
                fs.writeFileSync(__dirname+"reu_test.png", data);
                ctx.body = { image: data.toString('base64') }
            }
        });
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
