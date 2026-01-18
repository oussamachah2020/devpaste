"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PastesController = void 0;
const common_1 = require("@nestjs/common");
const pastes_service_1 = require("./pastes.service");
const create_paste_dto_1 = require("./dto/create-paste.dto");
const swagger_1 = require("@nestjs/swagger");
let PastesController = class PastesController {
    pastesService;
    constructor(pastesService) {
        this.pastesService = pastesService;
    }
    create(createPasteDto) {
        return this.pastesService.create(createPasteDto);
    }
    findAll(limit) {
        return this.pastesService.findAll(limit ? parseInt(limit) : 20);
    }
    findOne(id) {
        return this.pastesService.findOne(id);
    }
    delete(id) {
        return this.pastesService.delete(id);
    }
};
exports.PastesController = PastesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new paste' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_paste_dto_1.CreatePasteDto]),
    __metadata("design:returntype", void 0)
], PastesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent public pastes' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PastesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a paste by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PastesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a paste' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PastesController.prototype, "delete", null);
exports.PastesController = PastesController = __decorate([
    (0, swagger_1.ApiTags)('pastes'),
    (0, common_1.Controller)('pastes'),
    __metadata("design:paramtypes", [pastes_service_1.PastesService])
], PastesController);
//# sourceMappingURL=pastes.controller.js.map