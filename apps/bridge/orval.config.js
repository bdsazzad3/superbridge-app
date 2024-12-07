module.exports = {
  api: {
    output: {
      mode: "single",
      target: "codegen/index.ts",
      schemas: "codegen/model",
      client: "react-query",
      mock: false,
    },
    input: {
      target: "../../../superbridge-backend/apps/backend/bridge-swagger.yaml",
    },
  },
};
