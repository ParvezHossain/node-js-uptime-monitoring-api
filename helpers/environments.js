const environments = {};

environments.staging = {
    port: 3000,
    envName: "staging",
    secretKey: "staging",
    maxChecks: 5,
};

environments.production = {
    port: 4000,
    envName: "production",
    secretKey: "production",
    maxChecks: 5,
};

const currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

const environmentToExport = typeof (environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;