#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let typescript = true;
const folderName = process.argv[2]; // npx create-ur-ass folder
const language = process.argv[3];

// if(language == "typescript" || language == "ts") typescript = true
if(!folderName) {
    console.error('You Need a Project Name.');
    console.log('npx create-ur-ass blog');
    process.exit(1);
};
let targetPath;

if(folderName == ".") {
    targetPath = path.join(process.cwd()); 
};
targetPath = path.join(process.cwd(), folderName); 

if(fs.existsSync(targetPath) && folderName != ".") {
    console.error('The folder already exists')
    process.exit(1);
}


fs.mkdirSync(targetPath, { recursive: true });
console.log('%10');

async function index() {
    fs.writeFileSync(path.join(targetPath, `index.${typescript ? "ts" : "js"}`), 
    `import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 3000;

import { connectDB } from "./db/connect";
connectDB();

const limiter = rateLimit({
    windowMs: 2 * 1000,
    max:100,
    handler: function(req, res, next) {
        res.send('Rate-Limit!!!!');
        setTimeout(function() {
            next();
        }, 3000)
    }
});
app.use(cors());
app.use(limiter);
app.use(bodyParser.urlencoded({}));
app.use(bodyParser.json());
app.set('trust proxy', true)
app.use(morgan('dev'));


import homeRouter from "./modules/home/home.router";
app.use('/', homeRouter);


app.listen(PORT, process.env.host, () => {
    console.log(\`\${process.env.domain}:\${PORT} listining\`);
});
    `
)

    fs.writeFileSync(path.join(targetPath, `package.json`), 
    `{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.ts",
  "scripts": {
    "dev": "tsx --watch index.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@types/body-parser": "^1.19.6",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.3",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/morgan": "^1.9.10",
    "@types/multer": "^2.0.0",
    "axios": "^1.12.2",
    "bcryptjs": "^3.0.2",
    "body-parser": "^2.2.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.2",
    "express": "^5.1.0",
    "express-rate-limit": "^8.1.0",
    "express-slow-down": "^3.0.0",
    "express-validator": "^7.2.1",
    "jsonwebtoken": "^9.0.2",
    "moment": "^2.30.1",
    "mongoose": "^8.18.2",
    "morgan": "^1.10.1",
    "multer": "^2.0.2",
    "uuid": "^13.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.36.0",
    "eslint": "^9.36.0",
    "globals": "^16.4.0",
    "prettier": "3.6.2",
    "typescript-eslint": "^8.44.1"
  }
}
`
)
console.log('index installed.');
}
async function modules() {
    console.clear();
    fs.mkdirSync(path.join(targetPath, "modules"), { recursive: true });
    console.log('%20');
    fs.mkdirSync(path.join(targetPath, "modules", "home"), { recursive: true });
    console.clear();
    console.log('%30');
    
    fs.writeFileSync(path.join(targetPath, "modules", "home", `home.controller.${typescript ? "ts" : "js"}`),
    `import { Request, Response } from "express";
    
class homeController {
    
    async Index(req: Request, res:Response) {
        return res.status(200).send('ok')
    };
    
};

export default new homeController();
    `
);
console.clear();
console.log('45%');
    fs.writeFileSync(path.join(targetPath, "modules", "home", `home.router.${typescript ? "ts" : "js"}`),
    `import { Router } from "express";
import homeController from "./home.controller";
const router = new Router();

router.get('/', homeController.Index);

export default router;
    `
);
console.clear();
console.log('70%');
    fs.writeFileSync(path.join(targetPath, "modules", "home", `home.model.${typescript ? "ts" : "js"}`),
    `import { Schema, model } from "mongoose";
const schema = new Schema({

});

export default model('home', schema);
    `
);
console.clear();
console.log('100%');

console.log('Modules Installed.');
}
async function db() {
    fs.mkdirSync(path.join(targetPath, "db"), { recursive: true });

    fs.writeFileSync(path.join(targetPath, "db", `connect.${typescript ? "ts" : "js"}`),
    `import mongoose from "mongoose";
import settingsModel from "../modules/admin/admin.model";


export const connectDB = async () => {
    mongoose.connect(process.env.mongouri || '').then(async () => {
        console.log('Database Bağlandı');
    }).catch((err) => {
        console.log('Database Bağlanırken Sorun Oluştu Hata: ' + err);
    });
    mongoose.set('strictPopulate', false);
    if(!await settingsModel.findOne({ id:'DEFAULT' })) {
        new settingsModel({
            id:'DEFAULT',
            siteName:'DEFAULT'
        }).save()
        console.log('Default Ayarlar bulunamadı yenisi oluşturuldu')
    }
    return mongoose
}
    `
    
);
console.log('database installed.');
}
async function middleware() {
    fs.mkdirSync(path.join(targetPath, "middleware"), { recursive: true });

    fs.writeFileSync(path.join(targetPath, "middleware", `authentication.${typescript ? "ts" : "js"}`),
    `/*import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../modules/user/user.interface";
import userModel from "../modules/user/user.model";
export const authenticateToken = (req:Request, res:Response, next:NextFunction) => {
    const header = req.headers.authorization;
    // console.log(header)
    
    if(!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token Geçersiz'});
    }


    const token = header.split(" ")[1];
    try {
        const decoded:User = jwt.verify(token, process.env.SecretKey);
        req.user = {
            id:decoded.id,
            username:decoded.username,
            email: decoded.email
        };
        next();
    } catch (err) {
        return res.status(403);
    }
};
export const optionalAuthenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        // Token yoksa sadece req.user boş bırak ve devam et
        req.user = undefined;
        return next();
    }

    const token = header.split(" ")[1];

    try {
        const decoded: User = jwt.verify(token, process.env.SecretKey) as User;

        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
        };

        next();
    } catch (err) {
        // Token geçersiz olsa da req.user boş bırak ve devam et
        req.user = undefined;
        next();
    }
};

*/
    `
    
);
console.log('middleware installed.');
}


await index();
await modules();
await db();
await middleware();

console.log("\x1b[32m", "Thanks For Using the tool.", "\x1b[0m")