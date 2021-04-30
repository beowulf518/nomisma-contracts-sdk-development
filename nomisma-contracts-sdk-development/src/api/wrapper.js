
const defaultMiddleware = (
  apiFunc,
  ethereumApi
) => apiFunc(ethereumApi);

const defaultModulesMiddleware = modules => modules;

export const wrapWithEthereumApi = ethereumApi => ({
  apiModules,
  ethereumApiMiddleware = defaultMiddleware,
  modulesMiddleware = defaultModulesMiddleware,
}) => Object.entries(
  modulesMiddleware(
    apiModules
  )
)
  .reduce(
    (
      acc,
      [
        moduleName,
        moduleApiObject,
      ]
    ) => ({
      ...acc,
      [moduleName]: Object.entries(moduleApiObject)
        .reduce(
          (
            mappedModuleApiObject,
            [
              apiFuncName,
              apiFunc,
            ]
          ) => ({
            ...mappedModuleApiObject,
            [apiFuncName]: ethereumApiMiddleware(apiFunc, ethereumApi),
          }), {}),
    }), {});
