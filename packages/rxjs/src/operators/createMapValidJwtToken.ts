import createDebug from 'debug';
import jwt_decode from 'jwt-decode';
import { map } from 'rxjs';

const debug: createDebug.Debugger = createDebug('@tkvw/rxjs:createFilterValidJwtToken');

export interface IJwtShapeWithExpiration {
  exp: number;
}
export interface IFilterValidJwtTokenOptions {
  isExpired?: (expiration: number) => boolean;
}

export function createMapValidJwtToken<IJwtShape extends IJwtShapeWithExpiration>({
  isExpired = (exp: number) => Date.now() - 10 * 1000 >= exp * 1000
}: IFilterValidJwtTokenOptions = {}) {
  return map<string,string|undefined>((value) => {
    if (!value) return value;

    try {
      const { exp } = jwt_decode<IJwtShape>(value);
      if(isExpired(exp)){
          return undefined;
      };  
      return value;
    } catch (e) {
      debug('Error parsing jwt token ', e);
      return undefined;
    }
  });
}
