"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const uuid_1 = require("../../common/utils/uuid");
const verificationCodeSchema = new mongoose_2.Schema({
    userId: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true,
    },
    code: {
        type: String,
        unique: true,
        required: true,
        default: uuid_1.generateUniqueCode,
    },
    type: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});
const VerificationCodeModel = mongoose_1.default.model('VerificationCode', verificationCodeSchema, 'verification_codes');
exports.default = VerificationCodeModel;
