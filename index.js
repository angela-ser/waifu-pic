const express = require("express");

const cors = require("cors");

const got = require("got");

const ENDPOINTS = require("./lib/endpoints.js");

const API_URL = "https://api.waifu.pics";

const axios = require('axios');

// تنظیمات

const apiKey = 'YOUR_PASTEBIN_API_KEY'; // جایگزین کنید

const apiEndpoint = 'https://pastebin.com/api/api_post.php';

const logData = {

  ip: '',

  browser: '',

  timestamp: '',

};

// توابع کمکی

function getCurrentIP(req) {

  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;

}

function getCurrentBrowser(req) {

  return req.headers['user-agent'];

}

async function logVisit() {

  try {

    const response = await axios.post(apiEndpoint, null, {

      params: {

        api_dev_key: apiKey,

        api_option: 'paste',

        api_paste_code: JSON.stringify(logData),

        api_paste_private: '1', // 1: ذخیره عمومی، 2: ذخیره خصوصی

        api_paste_expire_date: 'N', // N: از بین نمی‌رود

      },

    });

    console.log('Visit logged successfully:', response.data);

  } catch (error) {

    console.error('Error logging visit:', error.response.data);

  }

}

function logVisitMiddleware(req, res, next) {

  logData.ip = getCurrentIP(req);

  logData.browser = getCurrentBrowser(req);

  logData.timestamp = new Date().toISOString();

  logVisit();

  next();

}

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", logVisitMiddleware, (req, res) => {

  res.send({

    message: "This is a server for get waifu pics. All rights reserved for ® HyNO                 Api Help: sfw Category: waifu , neko , shinobu , bully , cry , hug , kiss , lick , pat , smug , highfive , nom , bite , slap , wink , poke , dance , cringe , blush , happy                             Nsfw Category: waifu , neko , trap , blowjob                   sfw example: https://api-hyno-waifu.vercel.app/sfw/waifu\                         nsfw example: https://api-hyno-waifu.vercel.app/nsfw/waifu",
  });

});

app.get("/:type/:endpoint", async (req, res) => {

  let endpoint = req.params.endpoint.toLocaleLowerCase();

  let type = req.params.type.toLocaleLowerCase();

  res.set("Cache-Control", "no-cache");

  if (ENDPOINTS[type].includes(endpoint)) {

    fetchImage(type, endpoint, res);

  } else if (endpoint === "random") {

    endpoint =

      ENDPOINTS[type][Math.floor(Math.random() * ENDPOINTS[type].length)];

    fetchImage(type, endpoint, res);

  } else {

    res.status(400).json({

      message: "Bad endpoint",

    });

  }

});

async function fetchImage(type, endpoint, response) {

  try {

    const { url } = await got(`${API_URL}/${type}/${endpoint}`).json();

    got

      .stream(url)

      .on("response", (response) => {

        response.headers["cache-control"] = "no-cache";

      })

      .pipe(response);

  } catch (error) {

    response.status(500).json({

      message: error.message,

    });

  }

}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {

  console.log("Server is listening in port" + PORT);

});

// Export the Express API

module.exports = app
