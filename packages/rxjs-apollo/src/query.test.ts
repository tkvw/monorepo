import { ApolloClient,InMemoryCache,gql } from "@apollo/client/core";
import { of } from "rxjs";
import { query } from "./query";

describe('query operator function', () => {
    it('returns a operator function', () => {
      const result = query(of({
        query: gql`
          query{
            test
          }
        `
      }));
      
      expect(typeof result).toBe("function");
      const next = result(of());
      expect(next).toHaveProperty("subscribe");
    });
  });