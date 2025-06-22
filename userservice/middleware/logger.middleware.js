import expressWinston from "express-winston";
import logger from "../utils/logger.js";

export default expressWinston.logger({
  winstonInstance: logger,
  meta: false,                    // do not log meta data (headers, body, etc)
  msg: "{{req.method}} {{req.url}} → status {{res.statusCode}} {{res.responseTime}}ms",
  expressFormat: false,          // don’t use default colored format
  colorize: false,
  ignoreRoute: (req) => req.url.includes("/signin"),
});


////  Simple Filesystem Logger  ////////////

// import fs from 'fs';

// const fsPromise = fs.promises;

// async function log(logData) {
//   try {
//     logData = `\n ${new Date().toString()} - ${logData}\n`;
//     await fsPromise.appendFile(
//       'log.txt',
//       logData,

//     );
//   } catch (err) {
//     console.log(err);
//   }
// }

// const loggerMiddleware = async (
//   req,
//   res,
//   next
// ) => {
//   // 1. Log request body.
//   if (!req.url.includes('signin')) {
//     const logData = `${
//       req.url
//     } - ${JSON.stringify(req.body)}`;
//     await log(logData);
//   }
//   next();
// };

// export default loggerMiddleware;
