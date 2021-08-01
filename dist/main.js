"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({ credentials: true, origin: "http://localhost:3000" });
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    await app.listen(process.env.PORT || 3555);
}
bootstrap();
//# sourceMappingURL=main.js.map