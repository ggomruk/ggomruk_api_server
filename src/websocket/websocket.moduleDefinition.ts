import { ConfigurableModuleBuilder } from "@nestjs/common";
import { IWebsocketConfig } from "./interfaces/websocketConfig.interface";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<IWebsocketConfig>().setClassMethodName('forRoot').build()