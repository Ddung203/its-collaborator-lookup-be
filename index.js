import express from "express";
import cors from "cors";
import morgan from "morgan";
import options from "./src/configs/cors.js";
import query from "./src/services/db.js";
import transporter from "./src/services/transporter.js";
import handlebars from "handlebars";
import * as fs from "fs";
import path from "path";
import htmlToSend from "./src/services/htmlToSend.js";

const app = express();
const port = 8080;
const __dirname = path.resolve();

app.use(cors(options));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.status(200).json({ message: "ok" });
});

app.get("/student/", async (req, res) => {
  try {
    const results = await query(`SELECT * FROM Data`);

    return res.status(200).json({ status: "success", data: results });
  } catch (error) {
    return res.status(200).json({
      status: "error",
      data: null,
      message: "Could not connect to data store.",
    });
  }
});

app.get("/student/:msv", async (req, res) => {
  try {
    const { msv } = req.params;

    const results = await query(
      `SELECT * FROM Data WHERE msv='${msv}' LIMIT 1`
    );

    if (results.length === 0)
      return res.status(200).json({
        status: "success",
        data: {},
        message: "Không tồn tại!",
      });

    return res.status(200).json({ status: "success", data: results[0] });
  } catch (error) {
    return res.status(200).json({
      status: "error",
      data: null,
      message: "Could not connect to data store.",
    });
  }
});

app.post("/email", async (req, res) => {
  try {
    const { hoten, msv, lop, sdt, email } = req.body;

    await query(
      `INSERT INTO resend (hoten, msv, lop, sdt, email, messageId)
      VALUES ('${hoten}', '${msv}', '${lop}', '${sdt}', '${email}', NULL)
      `
    );

    const userData = await query(
      `SELECT * FROM Data WHERE msv='${msv}' AND status='pass' LIMIT 1`
    );

    if (userData.length === 0) {
      const user = await query(
        `SELECT * FROM resend WHERE msv='${msv}' LIMIT 1`
      );

      return res.status(200).json({
        status: "error",
        data: user,
        message: "Could not send.",
      });
    }

    const filePath = __dirname + "/src/views/index.html";
    const replacements = { hoten, msv, lop, sdt, email };
    const html = htmlToSend(filePath, replacements);

    const mailOptions = {
      from: "Send mail <cuoicuoi1000@gmail.com>",
      to: `${email}`,
      cc: "hanhn3579@gmail.com",
      bbc: "ddung203.contact@gmail.com",
      subject: "Message test",
      html,
      // text: `Dear ${msv}, 1130 I hope this message gets delivered!`,
    };

    transporter.sendMail(mailOptions, async (err, info) => {
      console.log(info.envelope);
      console.log(info.messageId);

      if (info.messageId) {
        await query(
          `UPDATE resend SET \`messageId\` = '${info.messageId}' WHERE msv = '${msv}'`
        );
      }
    });

    const user = await query(`SELECT * FROM resend WHERE msv='${msv}' LIMIT 1`);

    return res.status(200).json({ status: "success", data: user[0] });
  } catch (error) {
    return res.status(200).json({
      status: "error",
      data: error,
      message: "Could not connect.",
    });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
