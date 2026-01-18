"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const throttler_1 = require("@nestjs/throttler");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const pastes_module_1 = require("./pastes/pastes.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async () => ({
                    store: await (0, cache_manager_redis_yet_1.redisStore)({
                        socket: {
                            host: process.env.REDIS_HOST || 'localhost',
                            port: parseInt(process.env.REDIS_PORT) || 6379,
                        },
                    }),
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
            prisma_module_1.PrismaModule,
            pastes_module_1.PastesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map