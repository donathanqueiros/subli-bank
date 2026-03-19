/**
 * @generated SignedSource<<6a4690d96997aec9d0dfb61fecaf9302>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type pageAccountsQuery$variables = Record<PropertyKey, never>;
export type pageAccountsQuery$data = {
  readonly accounts: ReadonlyArray<{
    readonly balance: number;
    readonly createdAt: string;
    readonly holderName: string;
    readonly id: string;
  }>;
};
export type pageAccountsQuery = {
  response: pageAccountsQuery$data;
  variables: pageAccountsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Account",
    "kind": "LinkedField",
    "name": "accounts",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "holderName",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "balance",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createdAt",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "pageAccountsQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "pageAccountsQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "b502c1ff14beedf84f9f05ba9ced96d4",
    "id": null,
    "metadata": {},
    "name": "pageAccountsQuery",
    "operationKind": "query",
    "text": "query pageAccountsQuery {\n  accounts {\n    id\n    holderName\n    balance\n    createdAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "4c2b76b41493d26dc487bbb4619f3d2b";

export default node;
