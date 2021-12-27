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

  fetchMoreOptionsPrefix?: string;
  fetchMoreOptionsSuffix?: string;

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
    fetchMoreOptionsPrefix = '',
    fetchMoreOptionsSuffix = 'FetchMoreOptions',
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
    default: 'client'
  });
  const apollo = createImport('@apollo/client/core', {
    libs: ['gql']
  });
  const rxjs = createImport('rxjs', {
    libs: ['Observable', 'map', 'NEVER']
  });
  const rxjsApollo = createImport('@tkvw/rxjs-apollo');

  if (hasQuery) {
    rxjsApollo.libs.push('connectQuery');
    rxjsApollo.types.push(
      'IQueryOptions as IQueryOptionsOriginal',
      'IFetchMoreOptions as IFetchMoreOptionsOriginal'
    );
    rxjs.libs.push('of');
  }
  if (hasMutation) {
    rxjsApollo.libs.push('connectMutation');
    apollo.types.push('FetchResult','MutationOptions', 'DefaultContext');
    rxjs.libs.push('Subject');
  }
  if (hasSubscription) {
    rxjsApollo.libs.push('connectSubscribe');
    apollo.types.push('SubscriptionOptions');
  }

  const statements = [];
  if (hasQuery) {
    statements.push(`
export const query = connectQuery(client);
export type IQueryOptions<TVariables,TData> = Omit<IQueryOptionsOriginal<TVariables,TData>,"query">;
export type IFetchMoreOptions<TVariables,TData> = Omit<IFetchMoreOptionsOriginal<TVariables,TData>,"query">;
`);
  }
  if (hasMutation) {
    statements.push(`
export const mutation = connectMutation(client);
export type IMutationOptions<TVariables,TData,TContext> = Omit<MutationOptions<TData,TVariables,TContext>,"mutation">;
`);
  }
  if (hasSubscription) {
    statements.push(`
export const subscribe = connectSubscribe(client);
export type ISubscribeOptions<TVariables,TData> = Omit<SubscriptionOptions<TVariables,TData>,"query">;
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
      const fetchMoreOptionsName = `${fetchMoreOptionsPrefix}${operationName}${fetchMoreOptionsSuffix}`;
      contents.push(`
export type ${queryOptionsName} = IQueryOptions<${opv},${op}>;
export type ${fetchMoreOptionsName} = IFetchMoreOptions<${opv},${op}>;
export function ${functionName}(options$?: Observable<${queryOptionsName}>, fetchMoreOptions$: Observable<${fetchMoreOptionsName}> = NEVER){
  options$ = options$ ?? of({});
  return query(options$.pipe(
    map(options => ({
      ...options,
      query: ${documentVariableName}
    }))
  ),fetchMoreOptions$.pipe(
    map(options => ({
      ...options,
      query: ${documentVariableName}
    }))
  ));
}
`);
    } else if ('mutation' === operation.operation) {
      const mutationOptionsName = `${mutationOptionsPrefix}${operationName}${mutationOptionsSuffix}`;
      contents.push(`
export type ${mutationOptionsName}<TContext = DefaultContext> = IMutationOptions<${opv},${op},TContext>;
export function ${functionName}<TContext = DefaultContext>(): [Subject<${mutationOptionsName}<TContext>>,Observable<FetchResult<${op},TContext>>];
export function ${functionName}<TContext = DefaultContext>(options$: Observable<${mutationOptionsName}<TContext>>):Observable<FetchResult<${op},TContext>>
export function ${functionName}<TContext = DefaultContext>(options$?: Observable<${mutationOptionsName}<TContext>>): (Observable<FetchResult<${op},TContext>> | [Subject<${mutationOptionsName}<TContext>>,Observable<FetchResult<${op},TContext>>]){
  if(options$) {
    return mutation(options$.pipe(
      map(options => ({
        ...options,
        mutation: ${documentVariableName}
      }))
    )) as Observable<FetchResult<${op},TContext>>;
  }
  const subject$ = new Subject<${mutationOptionsName}<TContext>>();
  return [subject$,mutation(subject$.pipe(
    map(options => ({
      ...options,
      mutation: ${documentVariableName}
    }))
  )) as Observable<FetchResult<${op},TContext>>];
}
`);
    } else if ('subscription' === operation.operation) {
      const subscribeOptionsName = `${subscribeOptionsPrefix}${operationName}${subscribeOptionsSuffix}`;
      contents.push(`
export type ${subscribeOptionsName} = ISubscribeOptions<${opv},${op}>;
export function ${functionName}(options$: Observable<${subscribeOptionsName}>){
  return subscribe(options$.pipe(
    map(options => ({
      ...options,
      query: ${documentVariableName}
    }))
  ));
}
`);
    }

    return acc;
  }, contents);

  const prepend: string[] = [apollo, rxjs, rxjsApollo, client].reduce<string[]>((acc, item) => {
    const libs = item.libs.length > 0 ? `{ ${item.libs.join(', ')} }` : '';
    if (item.default && libs) {
      acc.push(`import ${item.default}, ${libs} from "${item.from}";`);
    } else if (libs) {
      acc.push(`import ${libs} from "${item.from}";`);
    } else {
      acc.push(`import ${item.default} from "${item.from}";`);
    }
    if (item.types.length > 0) {
      acc.push(`import type { ${item.types.join(', ')} } from "${item.from}";`);
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
