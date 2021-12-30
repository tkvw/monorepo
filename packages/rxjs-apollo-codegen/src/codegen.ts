import type { CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import {
  ClientSideBaseVisitor,
  LoadedFragment,
  RawClientSideBasePluginConfig
} from '@graphql-codegen/visitor-plugin-common';
import {
  concatAST,
  DocumentNode,
  FragmentDefinitionNode,
  Kind,
  OperationDefinitionNode,
  visit
} from 'graphql';
import { pascalCase } from 'pascal-case';

interface IImport {
  default?: string;
  from: string;
  libs: string[];
  types: string[];
}

function createImport(from: string, options?: Partial<IImport>): IImport {
  return {
    from,
    libs: [],
    types: [],
    ...options
  };
}

export interface IConfig extends Omit<RawClientSideBasePluginConfig, 'scalars'> {
  clientPath: string;
  queryOperationPrefix?: string;
  queryOperationSuffix?: string;
  mutationOperationPrefix?: string;
  mutationOperationSuffix?: string;

  subscriptionOperationPrefix?: string;
  subscriptionOperationSuffix?: string;

  queryOptionsPrefix?: string;
  queryOptionsSuffix?: string;

  mutationOptionsPrefix?: string;
  mutationOptionsSuffix?: string;

  subscribeOptionsPrefix?: string;
  subscribeOptionsSuffix?: string;
}

export const plugin: CodegenPlugin<IConfig>['plugin'] = async (
  schema,
  documents,
  {
    clientPath,
    externalFragments = [],
    queryOperationPrefix = '',
    queryOperationSuffix = '',
    mutationOperationPrefix = '',
    mutationOperationSuffix = '',
    subscriptionOperationPrefix = '',
    subscriptionOperationSuffix = '',
    documentVariablePrefix = '',
    documentVariableSuffix = 'Doc',
    queryOptionsPrefix = '',
    queryOptionsSuffix = 'Options',
    mutationOptionsPrefix = '',
    mutationOptionsSuffix = 'MutationOptions',
    subscribeOptionsPrefix = '',
    subscribeOptionsSuffix = 'SubscribeOptions',
    ...config
  },
  info
) => {
  const operationTypeFormats = {
    query: {
      prefix: queryOperationPrefix,
      suffix: queryOperationSuffix
    },
    mutation: {
      prefix: mutationOperationPrefix,
      suffix: mutationOperationSuffix
    },
    subscription: {
      prefix: subscriptionOperationPrefix,
      suffix: subscriptionOperationSuffix
    }
  };

  const ast = concatAST(documents.map((d) => d.document).filter((x) => x) as DocumentNode[]);
  const allFragments: LoadedFragment[] = [
    ...(ast.definitions.filter((d) => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(
      (fragmentDef) => ({
        node: fragmentDef,
        name: fragmentDef.name.value,
        onType: fragmentDef.typeCondition.name.value,
        isExternal: false
      })
    ),
    ...externalFragments
  ];
  const operations = ast.definitions.filter(
    (d) => d.kind === Kind.OPERATION_DEFINITION
  ) as OperationDefinitionNode[];

  const visitor = new ClientSideBaseVisitor(
    schema,
    allFragments,
    {},
    {
      ...config,
      externalFragments,
      documentVariablePrefix,
      documentVariableSuffix
    },
    documents
  );

  const visitorResult = visit(ast, visitor);

  const hasQuery = operations.some(({ operation }) => 'query' === operation);
  const hasMutation = operations.some(({ operation }) => 'mutation' === operation);
  const hasSubscription = operations.some(({ operation }) => 'subscription' === operation);

  if (!hasQuery && !hasMutation && !hasSubscription) {
    console.error('No documents with operations found');
    return {
      content: ''
    };
  }

  const client = createImport(clientPath, {
    default: 'client$'
  });
  const apollo = createImport('@apollo/client/core', {
    libs: ['gql']
  });
  const rxjs = createImport('rxjs', {
    libs: ['Observable', 'map', 'switchMap','Subject']
  });
  const rxjsApollo = createImport('@tkvw/rxjs-apollo');

  if (hasQuery) {
    rxjsApollo.libs.push('rxQuery');
    rxjsApollo.types.push(
      'IQueryOptions','IQueryResult','IRxQuery'
    );
  }
  if (hasMutation) {
    rxjsApollo.libs.push('rxMutation');
    rxjsApollo.types.push('IMutableResult','IMutationOptions');
    apollo.types.push('DefaultContext');
  }
  if (hasSubscription) {
    rxjsApollo.libs.push('rxSubscribe');
    rxjsApollo.types.push('ISubscribeResult','ISubscribeOptions');
  }

  const statements = [];
  if (hasQuery) {
    statements.push(`
export type IGeneratedQueryOptions<TVariables,TData> = Omit<IQueryOptions<TVariables,TData>,"query" | "client">;
`);
  }
  if (hasMutation) {
    statements.push(`
export type IGeneratedMutationOptions<TVariables,TData,TContext> = Omit<IMutationOptions<TData,TVariables,TContext>,"client" | "mutation">;
`);
  }
  if (hasSubscription) {
    statements.push(`
export type IGeneratedSubscribeOptions<TVariables,TData> = Omit<ISubscribeOptions<TVariables,TData>,"client" | "query">;
`);
  }
  let contents: string[] = [];
  if (visitor.fragments) {
    contents = [...contents, `/* Fragments */`, visitor.fragments];
  }
  const x = visitorResult.definitions.filter((t: unknown) => typeof t === 'string');
  if (x.length > 0) {
    contents = [...contents, `/* Other */`, x.join('\n')];
  }
  operations.reduce((acc, operation) => {
    if (!operation.name?.value || !operation.operation) return acc;
    const operationName = pascalCase(operation.name.value);
    const operationSuffix = pascalCase(visitor.getOperationSuffix(operation, operation.operation));

    const op = `${operationName}${operationSuffix}`;
    const opv = `${op}Variables`;
    const documentVariableName = `${documentVariablePrefix}${operationName}${documentVariableSuffix}`;
    const { prefix, suffix } = operationTypeFormats[operation.operation];
    const functionName = `${prefix}${operationName}${suffix}`;

    if ('query' === operation.operation) {
      const queryOptionsName = `${queryOptionsPrefix}${operationName}${queryOptionsSuffix}`;
      contents.push(`
export type ${queryOptionsName} = IGeneratedQueryOptions<${opv},${op}>;
export function ${functionName}(): [Subject<${queryOptionsName}>,IRxQuery<${opv},${op}>];
export function ${functionName}(options$: Observable<${queryOptionsName}>):IRxQuery<${opv},${op}>
export function ${functionName}(options$?: Observable<${queryOptionsName}>){
  if(!options$){
    const subject = new Subject<${queryOptionsName}>();
    return [subject,${functionName}(subject.asObservable())];
  }
  return rxQuery(client$.pipe(switchMap(client => 
    options$.pipe(
      map(options => ({
        ...options,
        client,
        query: ${documentVariableName}
      }))
    )
  ))) as IRxQuery<${opv},${op}>;
}
`);
    } else if ('mutation' === operation.operation) {
      const mutationOptionsName = `${mutationOptionsPrefix}${operationName}${mutationOptionsSuffix}`;
      contents.push(`
export type ${mutationOptionsName}<TContext = DefaultContext> = IGeneratedMutationOptions<${opv},${op},TContext>;
export function ${functionName}<TContext = DefaultContext>(): [Subject<${mutationOptionsName}<TContext>>,Observable<IMutableResult<${op},${opv},TContext>>];
export function ${functionName}<TContext = DefaultContext>(options$: Observable<${mutationOptionsName}<TContext>>):Observable<IMutableResult<${op},${opv},TContext>>
export function ${functionName}<TContext = DefaultContext>(options$?: Observable<${mutationOptionsName}<TContext>>): (Observable<IMutableResult<${op},${opv},TContext>> | [Subject<${mutationOptionsName}<TContext>>,Observable<IMutableResult<${op},${opv},TContext>>]){
  if(!options$){
    const subject = new Subject<${mutationOptionsName}<TContext>>();
    return [subject,${functionName}<TContext>(subject.asObservable())];
  }
  return rxMutation(client$.pipe(switchMap(client => 
    options$.pipe(
      map(options => ({
        ...options,
        client,
        mutation: ${documentVariableName}
      }))
    )
  ))) as Observable<IMutableResult<${op},${opv},TContext>>;
}
`);
    } else if ('subscription' === operation.operation) {
      const subscribeOptionsName = `${subscribeOptionsPrefix}${operationName}${subscribeOptionsSuffix}`;
      contents.push(`
export type ${subscribeOptionsName} = IGeneratedSubscribeOptions<${opv},${op}>;
export function ${functionName}(): [Subject<${subscribeOptionsName}>,Observable<ISubscribeResult<${op},${opv}>>];
export function ${functionName}(options$: Observable<${subscribeOptionsName}>):Observable<ISubscribeResult<${op},${opv}>>
export function ${functionName}(options$?: Observable<${subscribeOptionsName}>){
  if(!options$){
    const subject = new Subject<${subscribeOptionsName}>();
    return [subject,${functionName}(subject.asObservable())];
  }
  return rxSubscribe(client$.pipe(switchMap(client => 
    options$.pipe(
      map(options => ({
        ...options,
        client,
        query: ${documentVariableName}
      }))
    )
  ))) as Observable<ISubscribeResult<${op},${opv}>>;
}
`);
    }

    return acc;
  }, contents);

  const prepend: string[] = [apollo, rxjs, rxjsApollo, client].reduce<string[]>((acc, item) => {
    const libs = item.libs.length > 0 ? `{ ${item.libs.sort().join(', ')} }` : '';
    if (item.types.length > 0) {
      acc.push(`import type { ${item.types.sort().join(', ')} } from "${item.from}";`);
    }
    if (item.default && libs) {
      acc.push(`import ${item.default}, ${libs} from "${item.from}";`);
    } else if (libs) {
      acc.push(`import ${libs} from "${item.from}";`);
    } else {
      acc.push(`import ${item.default} from "${item.from}";`);
    }
    return acc;
  }, []);

  return {
    prepend,
    content: `

${statements.join('\n')}

${contents.join('\n')}
`
  };
};
