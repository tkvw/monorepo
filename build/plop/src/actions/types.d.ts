import {CustomActionFunction} from "node-plop"
type CustomActionFunctionParams = Parameters<CustomActionFunction>;

export interface CustomActionOptionsFactory<Options> {
  (answers: CustomActionFunctionParams[0], plop: CustomActionFunctionParams[2]): Promise<Options>;
}
