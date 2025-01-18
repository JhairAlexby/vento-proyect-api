import { mongo } from "mongoose";

export const EnvConfigurations = () => ({
    environment: process.env.NODE_ENV || 'dev',
    mongodb: process.env.MONGODB,
    port: process.env.PORT || 3002,
    defaultLimit: process.env.DEFAULT_LIMIT || 10,
})