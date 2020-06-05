import Router from "koa-router";
const router = new Router();

import algorithmia from "algorithmia"
import shortid from "shortid";
import fs from "fs";
const fsPromises = fs.promises;
let client: any = algorithmia("simaMBdCR9ijBkR18JRVfbT0BRF1");

var imageDirectory = client.dir("data://tevonsb/images")


const getImage = async (input: any, id) => {
  return new Promise(async (resolve, reject) => {
    console.log("File uploaded.");
    const response = await client.algo("cv/CensorFace/0.1.3").pipe(input)
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
                  fs.writeFileSync(`${__dirname}/processed_${id}.png`, data);
                  resolve(data.toString('base64'));
              }
          });
      } else {
        reject("The image does not exist");
      }
  });
  })
}

const setImage = async (hostedFile: string, fileName: string) => {
  return new Promise((resolve, reject) => {
    client.file(hostedFile).exists(function(exists: Boolean) {
        console.log("Getting into exists");
        // Check if file exists, if it doesn't create it
        if (exists == false) {
            imageDirectory.putFile(fileName, async (response: any) => {
                console.log("Getting into PUTFILE");
                if (response.error) {
                  reject("Failed to upload file: " + response.error.message);
                } else {
                  console.log("resolving promise");
                  resolve();
              };
            });
        } else {
            console.log("Your file already exists.")
        }
  });
  })
}

router.post("/", async (ctx, next) => {
  try {
    console.log("Recieved request");
    // const testFile = +"/reu.jpg";
    var base64Data = ctx.request.body.image[0].replace(/^data:image\/png;base64,/, "");
    const id = "id_"+shortid.generate();
    const hostedFile = `data://tevonsb/images/${id}.png`;
    const fileName = `${__dirname}/${id}.png`;

    await fsPromises.writeFile(fileName, base64Data, 'base64');
    console.log("About to set image");
    await setImage(hostedFile, fileName);
    console.log("After setting image");
    var input = {
      "images": [
        hostedFile
      ]
    };
  const data = await getImage(input, id);
  console.log("After getting image");
  ctx.status = 200;
  ctx.body = data;
} catch(error){
  console.log(error);
}
  await next();
});

export default router;
