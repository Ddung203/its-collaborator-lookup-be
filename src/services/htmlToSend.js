import handlebars from "handlebars";
import * as fs from "fs";
import path from "path";

const htmlToSend = (filePath, replacements) => {
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  return template(replacements);
};

export default htmlToSend;
