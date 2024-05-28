import { Readable } from "stream";
import fs from "node:fs";
import express from "express";
import requestIP from "request-ip";

import upload from "./utils/upload";
import tempMemory from "./utils/tempMemory";
import { fromBuffer } from "./index";
const app = express();
const a: Buffer[] = [];

app.use(requestIP.mw());
app.get("/image-api/thumbnail/:filename", async (req, res) => {
  res.set("Content-Disposition", `inline; filename="${req.params.filename}"`);
  const {width, height, quality, format} = req.query
  const formatString = ((format && ['png', 'jpeg', 'webp'].includes(format as string)) ? format : 'png')  as 'png' | 'jpeg' | 'webp'
  const percentage = (!(width && height)) ? 50 : undefined
  const qua = quality ? +quality : undefined
  console.log(qua, "--->", quality, req.query)
  const ip = req.clientIp || "";
  const filename = req.params.filename;
  const result = tempMemory.fetch(ip, filename);
  console.log(ip, filename, result);
  if (result) {
    const { data } = result;
    const { data: thumbnail, info } =
      (await fromBuffer(data, percentage, { width, height }, qua, formatString)) || {};
    const stream = thumbnail && Readable.from(thumbnail);
    stream && stream.pipe(res);
    return;
  }

  res.status(404);
  res.json({ code: 1, error: "NOT FOUND" });
});

app.post("/image-api/upload", upload.single("file"), function (req, res, next) {
  const ip = req.clientIp || "none";

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  if (req.file) {
    const { buffer, originalname, mimetype, size } = req.file;
    try {
      tempMemory.insert(ip, originalname, buffer);
      res.json({ mimetype, size });
      return;
    } catch (error: any) {
      res.json({
        code: 1,
        errorMsg: error.message,
      });
      return;
    }
  }

  // req.file?.buffer && a.push(req.file?.buffer)
  res.json({ code: 1, msg: "please provide a file" });
});

app.get("/image-api/test", function (req, res, next) {
  //   res.json({
  //     ip: req.clientIp,
  //   });
  const memoryUsageInfo: any = {};
  for (const [key, value] of Object.entries(process.memoryUsage())) {
    memoryUsageInfo[`Memory usage by ${key}`] = `${value / 1000000}MB`;
  }
  res.json({
    data: tempMemory.infos(),
    memoryUsageInfo,
    ip: req.clientIp,
  });
});

app.get("/image-api", function (req, res) {
  const content = fs.createReadStream(`${__dirname}/template/index.html`);
  res.setHeader("content-type", "text/html");

  content.pipe(res);
});

app.listen(process.env.PORT || 3324, () => {
  console.log(`Service started listening on ${process.env.PORT}`)
});
