import nodemailer from "nodemailer";
import transportConfig from "../configs/nodemailer.js";

const transporter = nodemailer.createTransport(transportConfig);

export default transporter;
