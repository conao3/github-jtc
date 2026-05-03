/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
/** The possible states of an issue. */
export type IssueState =
  /** An issue that has been closed */
  | "CLOSED"
  /** An issue that is still open */
  | "OPEN";

/** The review status of a pull request. */
export type PullRequestReviewDecision =
  /** The pull request has received an approving review. */
  | "APPROVED"
  /** Changes have been requested on the pull request. */
  | "CHANGES_REQUESTED"
  /** A review is required before the pull request can be merged. */
  | "REVIEW_REQUIRED";

/** The access level to a repository */
export type RepositoryPermission =
  /**
   * Can read, clone, and push to this repository. Can also manage issues, pull
   * requests, and repository settings, including adding collaborators
   */
  | "ADMIN"
  /** Can read, clone, and push to this repository. They can also manage issues, pull requests, and some repository settings */
  | "MAINTAIN"
  /** Can read and clone this repository. Can also open and comment on issues and pull requests */
  | "READ"
  /** Can read and clone this repository. Can also manage issues and pull requests */
  | "TRIAGE"
  /** Can read, clone, and push to this repository. Can also manage issues and pull requests */
  | "WRITE";

/** The repository's visibility level. */
export type RepositoryVisibility =
  /** The repository is visible only to users in the same enterprise. */
  | "INTERNAL"
  /** The repository is visible only to those with explicit access. */
  | "PRIVATE"
  /** The repository is visible to everyone. */
  | "PUBLIC";

export type DashboardQueryVariables = Exact<{
  from: string;
  to: string;
  recentReposFirst: number;
  todoFirst: number;
  reviewRequestQuery: string;
  issueAssignmentQuery: string;
  authoredPrQuery: string;
}>;

export type DashboardQuery = {
  viewer: {
    id: string;
    login: string;
    name: string | null;
    company: string | null;
    repositories: {
      totalCount: number;
      nodes: Array<{
        id: string;
        name: string;
        nameWithOwner: string;
        url: string;
        updatedAt: string;
        pushedAt: string | null;
        isPrivate: boolean;
        primaryLanguage: { name: string; color: string | null } | null;
        issues: { totalCount: number };
        pullRequests: { totalCount: number };
      } | null> | null;
    };
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalIssueContributions: number;
      totalPullRequestReviewContributions: number;
    };
  };
  reviewRequests: {
    issueCount: number;
    nodes: Array<
      | { __typename: "App" }
      | { __typename: "Discussion" }
      | { __typename: "Issue" }
      | { __typename: "MarketplaceListing" }
      | { __typename: "Organization" }
      | {
          __typename: "PullRequest";
          id: string;
          number: number;
          title: string;
          url: string;
          updatedAt: string;
          reviewDecision: PullRequestReviewDecision | null;
          repository: { nameWithOwner: string; url: string };
          author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | null;
          comments: { totalCount: number };
        }
      | { __typename: "Repository" }
      | { __typename: "User" }
      | null
    > | null;
  };
  issueAssignments: {
    issueCount: number;
    nodes: Array<
      | { __typename: "App" }
      | { __typename: "Discussion" }
      | {
          __typename: "Issue";
          id: string;
          number: number;
          title: string;
          url: string;
          updatedAt: string;
          state: IssueState;
          repository: { nameWithOwner: string; url: string };
          comments: { totalCount: number };
        }
      | { __typename: "MarketplaceListing" }
      | { __typename: "Organization" }
      | { __typename: "PullRequest" }
      | { __typename: "Repository" }
      | { __typename: "User" }
      | null
    > | null;
  };
  authoredPullRequests: { issueCount: number };
};

export type RepositoryDetailQueryVariables = Exact<{
  owner: string;
  name: string;
  rootExpression: string;
  readmeExpression: string;
}>;

export type RepositoryDetailQuery = {
  repository: {
    id: string;
    name: string;
    nameWithOwner: string;
    url: string;
    description: string | null;
    homepageUrl: string | null;
    createdAt: string;
    updatedAt: string;
    pushedAt: string | null;
    isPrivate: boolean;
    visibility: RepositoryVisibility;
    viewerPermission: RepositoryPermission | null;
    stargazerCount: number;
    forkCount: number;
    watchers: { totalCount: number };
    issues: { totalCount: number };
    pullRequests: { totalCount: number };
    primaryLanguage: { name: string; color: string | null } | null;
    languages: {
      edges: Array<{ size: number; node: { id: string; name: string; color: string | null } } | null> | null;
    } | null;
    owner:
      | { __typename: "Organization"; name: string | null; login: string }
      | { __typename: "User"; name: string | null; login: string };
    defaultBranchRef: {
      name: string;
      target:
        | { __typename: "Blob" }
        | {
            __typename: "Commit";
            committedDate: string;
            messageHeadline: string;
            history: { totalCount: number };
            author: {
              name: string | null;
              user: { login: string; avatarUrl: string; url: string } | null;
            } | null;
          }
        | { __typename: "Tag" }
        | { __typename: "Tree" }
        | null;
    } | null;
    refs: {
      totalCount: number;
      nodes: Array<{
        id: string;
        name: string;
        target:
          | { __typename: "Blob" }
          | {
              __typename: "Commit";
              committedDate: string;
              messageHeadline: string;
              author: { name: string | null; user: { login: string } | null } | null;
            }
          | { __typename: "Tag" }
          | { __typename: "Tree" }
          | null;
      } | null> | null;
    } | null;
    rootEntries:
      | { __typename: "Blob" }
      | { __typename: "Commit" }
      | { __typename: "Tag" }
      | {
          __typename: "Tree";
          entries: Array<{
            name: string;
            type: string;
            oid: string;
            mode: number;
            object:
              | { __typename: "Blob"; byteSize: number; isBinary: boolean | null }
              | { __typename: "Commit" }
              | { __typename: "Tag" }
              | { __typename: "Tree" }
              | null;
          }> | null;
        }
      | null;
    readme:
      | { __typename: "Blob"; byteSize: number; isBinary: boolean | null; text: string | null }
      | { __typename: "Commit" }
      | { __typename: "Tag" }
      | { __typename: "Tree" }
      | null;
  } | null;
};

export type ViewerQueryVariables = Exact<{ [key: string]: never }>;

export type ViewerQuery = {
  viewer: {
    id: string;
    login: string;
    name: string | null;
    avatarUrl: string;
    url: string;
    company: string | null;
  };
};

export type ViewerProfileQueryVariables = Exact<{
  from: string;
  to: string;
}>;

export type ViewerProfileQuery = {
  viewer: {
    id: string;
    login: string;
    name: string | null;
    avatarUrl: string;
    url: string;
    email: string;
    company: string | null;
    location: string | null;
    websiteUrl: string | null;
    bio: string | null;
    createdAt: string;
    followers: { totalCount: number };
    following: { totalCount: number };
    organizations: {
      totalCount: number;
      nodes: Array<{
        id: string;
        login: string;
        name: string | null;
        url: string;
        avatarUrl: string;
      } | null> | null;
    };
    repositories: {
      totalCount: number;
      nodes: Array<{
        id: string;
        name: string;
        nameWithOwner: string;
        url: string;
        viewerPermission: RepositoryPermission | null;
        updatedAt: string;
        isPrivate: boolean;
      } | null> | null;
    };
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalIssueContributions: number;
      totalPullRequestReviewContributions: number;
    };
  };
};

export type ViewerRepositoriesQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
}>;

export type ViewerRepositoriesQuery = {
  viewer: {
    repositories: {
      totalCount: number;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: Array<{
        id: string;
        name: string;
        nameWithOwner: string;
        url: string;
        description: string | null;
        isPrivate: boolean;
        visibility: RepositoryVisibility;
        pushedAt: string | null;
        updatedAt: string;
        viewerPermission: RepositoryPermission | null;
        stargazerCount: number;
        forkCount: number;
        primaryLanguage: { name: string; color: string | null } | null;
        owner:
          | { __typename: "Organization"; name: string | null; login: string; avatarUrl: string }
          | { __typename: "User"; name: string | null; login: string; avatarUrl: string };
        issues: { totalCount: number };
        pullRequests: { totalCount: number };
        defaultBranchRef: {
          name: string;
          target:
            | { __typename: "Blob" }
            | { __typename: "Commit"; history: { totalCount: number } }
            | { __typename: "Tag" }
            | { __typename: "Tree" }
            | null;
        } | null;
      } | null> | null;
    };
  };
};

export const DashboardDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Dashboard" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "from" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "to" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "recentReposFirst" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "Int" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "todoFirst" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "Int" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reviewRequestQuery" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "issueAssignmentQuery" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "authoredPrQuery" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "viewer" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "login" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "company" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "repositories" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: { kind: "Variable", name: { kind: "Name", value: "recentReposFirst" } },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "affiliations" },
                      value: {
                        kind: "ListValue",
                        values: [
                          { kind: "EnumValue", value: "OWNER" },
                          { kind: "EnumValue", value: "COLLABORATOR" },
                          { kind: "EnumValue", value: "ORGANIZATION_MEMBER" },
                        ],
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "orderBy" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "field" },
                            value: { kind: "EnumValue", value: "PUSHED_AT" },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "direction" },
                            value: { kind: "EnumValue", value: "DESC" },
                          },
                        ],
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "isFork" },
                      value: { kind: "BooleanValue", value: false },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nodes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "nameWithOwner" } },
                            { kind: "Field", name: { kind: "Name", value: "url" } },
                            { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                            { kind: "Field", name: { kind: "Name", value: "pushedAt" } },
                            { kind: "Field", name: { kind: "Name", value: "isPrivate" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "primaryLanguage" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  { kind: "Field", name: { kind: "Name", value: "color" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "issues" },
                              arguments: [
                                {
                                  kind: "Argument",
                                  name: { kind: "Name", value: "states" },
                                  value: { kind: "EnumValue", value: "OPEN" },
                                },
                              ],
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "pullRequests" },
                              arguments: [
                                {
                                  kind: "Argument",
                                  name: { kind: "Name", value: "states" },
                                  value: { kind: "EnumValue", value: "OPEN" },
                                },
                              ],
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "contributionsCollection" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "from" },
                      value: { kind: "Variable", name: { kind: "Name", value: "from" } },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "to" },
                      value: { kind: "Variable", name: { kind: "Name", value: "to" } },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "totalCommitContributions" } },
                      { kind: "Field", name: { kind: "Name", value: "totalPullRequestContributions" } },
                      { kind: "Field", name: { kind: "Name", value: "totalIssueContributions" } },
                      { kind: "Field", name: { kind: "Name", value: "totalPullRequestReviewContributions" } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            alias: { kind: "Name", value: "reviewRequests" },
            name: { kind: "Name", value: "search" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: { kind: "Variable", name: { kind: "Name", value: "reviewRequestQuery" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "type" },
                value: { kind: "EnumValue", value: "ISSUE" },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: { kind: "Variable", name: { kind: "Name", value: "todoFirst" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "issueCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nodes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "__typename" } },
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PullRequest" } },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "number" } },
                            { kind: "Field", name: { kind: "Name", value: "title" } },
                            { kind: "Field", name: { kind: "Name", value: "url" } },
                            { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                            { kind: "Field", name: { kind: "Name", value: "reviewDecision" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "repository" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "nameWithOwner" } },
                                  { kind: "Field", name: { kind: "Name", value: "url" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "author" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [{ kind: "Field", name: { kind: "Name", value: "login" } }],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "comments" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            alias: { kind: "Name", value: "issueAssignments" },
            name: { kind: "Name", value: "search" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: { kind: "Variable", name: { kind: "Name", value: "issueAssignmentQuery" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "type" },
                value: { kind: "EnumValue", value: "ISSUE" },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: { kind: "Variable", name: { kind: "Name", value: "todoFirst" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "issueCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nodes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "__typename" } },
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Issue" } },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "number" } },
                            { kind: "Field", name: { kind: "Name", value: "title" } },
                            { kind: "Field", name: { kind: "Name", value: "url" } },
                            { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                            { kind: "Field", name: { kind: "Name", value: "state" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "repository" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "nameWithOwner" } },
                                  { kind: "Field", name: { kind: "Name", value: "url" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "comments" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            alias: { kind: "Name", value: "authoredPullRequests" },
            name: { kind: "Name", value: "search" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: { kind: "Variable", name: { kind: "Name", value: "authoredPrQuery" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "type" },
                value: { kind: "EnumValue", value: "ISSUE" },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: { kind: "Variable", name: { kind: "Name", value: "todoFirst" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "issueCount" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DashboardQuery, DashboardQueryVariables>;
export const RepositoryDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "RepositoryDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "owner" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "rootExpression" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "readmeExpression" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "repository" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "owner" },
                value: { kind: "Variable", name: { kind: "Name", value: "owner" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: { kind: "Variable", name: { kind: "Name", value: "name" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "nameWithOwner" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "homepageUrl" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                { kind: "Field", name: { kind: "Name", value: "pushedAt" } },
                { kind: "Field", name: { kind: "Name", value: "isPrivate" } },
                { kind: "Field", name: { kind: "Name", value: "visibility" } },
                { kind: "Field", name: { kind: "Name", value: "viewerPermission" } },
                { kind: "Field", name: { kind: "Name", value: "stargazerCount" } },
                { kind: "Field", name: { kind: "Name", value: "forkCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "watchers" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "issues" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "states" },
                      value: { kind: "EnumValue", value: "OPEN" },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pullRequests" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "states" },
                      value: { kind: "EnumValue", value: "OPEN" },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "primaryLanguage" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "languages" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: { kind: "IntValue", value: "6" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "orderBy" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "field" },
                            value: { kind: "EnumValue", value: "SIZE" },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "direction" },
                            value: { kind: "EnumValue", value: "DESC" },
                          },
                        ],
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "edges" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "size" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "node" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  { kind: "Field", name: { kind: "Name", value: "color" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "owner" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "__typename" } },
                      { kind: "Field", name: { kind: "Name", value: "login" } },
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "name" } }],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Organization" } },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "name" } }],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "defaultBranchRef" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "target" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "__typename" } },
                            {
                              kind: "InlineFragment",
                              typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Commit" } },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "history" },
                                    arguments: [
                                      {
                                        kind: "Argument",
                                        name: { kind: "Name", value: "first" },
                                        value: { kind: "IntValue", value: "1" },
                                      },
                                    ],
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                                      ],
                                    },
                                  },
                                  { kind: "Field", name: { kind: "Name", value: "committedDate" } },
                                  { kind: "Field", name: { kind: "Name", value: "messageHeadline" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "author" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "user" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              { kind: "Field", name: { kind: "Name", value: "login" } },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "avatarUrl" },
                                                arguments: [
                                                  {
                                                    kind: "Argument",
                                                    name: { kind: "Name", value: "size" },
                                                    value: { kind: "IntValue", value: "40" },
                                                  },
                                                ],
                                              },
                                              { kind: "Field", name: { kind: "Name", value: "url" } },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "refs" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "refPrefix" },
                      value: { kind: "StringValue", value: "refs/heads/", block: false },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: { kind: "IntValue", value: "10" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "orderBy" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "field" },
                            value: { kind: "EnumValue", value: "ALPHABETICAL" },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "direction" },
                            value: { kind: "EnumValue", value: "ASC" },
                          },
                        ],
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nodes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "target" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "__typename" } },
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "Commit" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "committedDate" } },
                                        { kind: "Field", name: { kind: "Name", value: "messageHeadline" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "author" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              { kind: "Field", name: { kind: "Name", value: "name" } },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "user" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    { kind: "Field", name: { kind: "Name", value: "login" } },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "rootEntries" },
                  name: { kind: "Name", value: "object" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "expression" },
                      value: { kind: "Variable", name: { kind: "Name", value: "rootExpression" } },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "__typename" } },
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Tree" } },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "entries" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "oid" } },
                                  { kind: "Field", name: { kind: "Name", value: "mode" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "object" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "__typename" } },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "Blob" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              { kind: "Field", name: { kind: "Name", value: "byteSize" } },
                                              { kind: "Field", name: { kind: "Name", value: "isBinary" } },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "readme" },
                  name: { kind: "Name", value: "object" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "expression" },
                      value: { kind: "Variable", name: { kind: "Name", value: "readmeExpression" } },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "__typename" } },
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Blob" } },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "byteSize" } },
                            { kind: "Field", name: { kind: "Name", value: "isBinary" } },
                            { kind: "Field", name: { kind: "Name", value: "text" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RepositoryDetailQuery, RepositoryDetailQueryVariables>;
export const ViewerDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Viewer" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "viewer" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "login" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatarUrl" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "size" },
                      value: { kind: "IntValue", value: "80" },
                    },
                  ],
                },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "company" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ViewerQuery, ViewerQueryVariables>;
export const ViewerProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ViewerProfile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "from" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "to" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "DateTime" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "viewer" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "login" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatarUrl" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "size" },
                      value: { kind: "IntValue", value: "160" },
                    },
                  ],
                },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "company" } },
                { kind: "Field", name: { kind: "Name", value: "location" } },
                { kind: "Field", name: { kind: "Name", value: "websiteUrl" } },
                { kind: "Field", name: { kind: "Name", value: "bio" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "followers" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "following" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "organizations" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: { kind: "IntValue", value: "10" },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nodes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "login" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "url" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "avatarUrl" },
                              arguments: [
                                {
                                  kind: "Argument",
                                  name: { kind: "Name", value: "size" },
                                  value: { kind: "IntValue", value: "40" },
                                },
                              ],
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "repositories" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: { kind: "IntValue", value: "5" },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "affiliations" },
                      value: {
                        kind: "ListValue",
                        values: [
                          { kind: "EnumValue", value: "OWNER" },
                          { kind: "EnumValue", value: "COLLABORATOR" },
                          { kind: "EnumValue", value: "ORGANIZATION_MEMBER" },
                        ],
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "orderBy" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "field" },
                            value: { kind: "EnumValue", value: "PUSHED_AT" },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "direction" },
                            value: { kind: "EnumValue", value: "DESC" },
                          },
                        ],
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "isFork" },
                      value: { kind: "BooleanValue", value: false },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nodes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "nameWithOwner" } },
                            { kind: "Field", name: { kind: "Name", value: "url" } },
                            { kind: "Field", name: { kind: "Name", value: "viewerPermission" } },
                            { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                            { kind: "Field", name: { kind: "Name", value: "isPrivate" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "contributionsCollection" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "from" },
                      value: { kind: "Variable", name: { kind: "Name", value: "from" } },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "to" },
                      value: { kind: "Variable", name: { kind: "Name", value: "to" } },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "totalCommitContributions" } },
                      { kind: "Field", name: { kind: "Name", value: "totalPullRequestContributions" } },
                      { kind: "Field", name: { kind: "Name", value: "totalIssueContributions" } },
                      { kind: "Field", name: { kind: "Name", value: "totalPullRequestReviewContributions" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ViewerProfileQuery, ViewerProfileQueryVariables>;
export const ViewerRepositoriesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ViewerRepositories" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "first" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "Int" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "after" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "viewer" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "repositories" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "first" },
                      value: { kind: "Variable", name: { kind: "Name", value: "first" } },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "after" },
                      value: { kind: "Variable", name: { kind: "Name", value: "after" } },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "affiliations" },
                      value: {
                        kind: "ListValue",
                        values: [
                          { kind: "EnumValue", value: "OWNER" },
                          { kind: "EnumValue", value: "COLLABORATOR" },
                          { kind: "EnumValue", value: "ORGANIZATION_MEMBER" },
                        ],
                      },
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "orderBy" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "field" },
                            value: { kind: "EnumValue", value: "PUSHED_AT" },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "direction" },
                            value: { kind: "EnumValue", value: "DESC" },
                          },
                        ],
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pageInfo" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
                            { kind: "Field", name: { kind: "Name", value: "endCursor" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "nodes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "nameWithOwner" } },
                            { kind: "Field", name: { kind: "Name", value: "url" } },
                            { kind: "Field", name: { kind: "Name", value: "description" } },
                            { kind: "Field", name: { kind: "Name", value: "isPrivate" } },
                            { kind: "Field", name: { kind: "Name", value: "visibility" } },
                            { kind: "Field", name: { kind: "Name", value: "pushedAt" } },
                            { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                            { kind: "Field", name: { kind: "Name", value: "viewerPermission" } },
                            { kind: "Field", name: { kind: "Name", value: "stargazerCount" } },
                            { kind: "Field", name: { kind: "Name", value: "forkCount" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "primaryLanguage" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  { kind: "Field", name: { kind: "Name", value: "color" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "owner" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "__typename" } },
                                  { kind: "Field", name: { kind: "Name", value: "login" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "avatarUrl" },
                                    arguments: [
                                      {
                                        kind: "Argument",
                                        name: { kind: "Name", value: "size" },
                                        value: { kind: "IntValue", value: "40" },
                                      },
                                    ],
                                  },
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "Organization" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [{ kind: "Field", name: { kind: "Name", value: "name" } }],
                                    },
                                  },
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "User" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [{ kind: "Field", name: { kind: "Name", value: "name" } }],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "issues" },
                              arguments: [
                                {
                                  kind: "Argument",
                                  name: { kind: "Name", value: "states" },
                                  value: { kind: "EnumValue", value: "OPEN" },
                                },
                              ],
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "pullRequests" },
                              arguments: [
                                {
                                  kind: "Argument",
                                  name: { kind: "Name", value: "states" },
                                  value: { kind: "EnumValue", value: "OPEN" },
                                },
                              ],
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [{ kind: "Field", name: { kind: "Name", value: "totalCount" } }],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "defaultBranchRef" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "target" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "__typename" } },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "Commit" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "history" },
                                                arguments: [
                                                  {
                                                    kind: "Argument",
                                                    name: { kind: "Name", value: "first" },
                                                    value: { kind: "IntValue", value: "1" },
                                                  },
                                                ],
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "totalCount" },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ViewerRepositoriesQuery, ViewerRepositoriesQueryVariables>;
