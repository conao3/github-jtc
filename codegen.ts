import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./graphql/github.schema.graphql",
  documents: ["src/**/*.graphql"],
  ignoreNoDocuments: false,
  generates: {
    "./src/gql/": {
      preset: "client",
      config: {
        useTypeImports: true,
        scalars: {
          DateTime: "string",
          GitObjectID: "string",
          URI: "string",
        },
      },
    },
  },
};

export default config;
