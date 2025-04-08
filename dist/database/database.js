"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const app_config_1 = require("../config/app.config");
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(app_config_1.config.MONGO_URI);
        console.log('Connected to mongo database baby :>');
    }
    catch (error) {
        console.log('Something went wrong baby:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
