"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = __importDefault(require("../../database/models/user.model"));
class UserService {
    async findUserById(userId) {
        const user = await user_model_1.default.findById(userId, { password: false });
        return user || null;
    }
}
exports.UserService = UserService;
