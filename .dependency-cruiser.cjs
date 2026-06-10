/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-domain-to-infrastructure',
      comment: 'Domain layer must not depend on infrastructure',
      severity: 'error',
      from: {
        path: '^apps/backend/src/modules/[^/]+/domain/',
        pathNot: ['\\.unit\\.test\\.ts$'],
      },
      to: { path: '^apps/backend/src/modules/[^/]+/infrastructure/' },
    },
    {
      name: 'no-domain-to-presentation',
      comment: 'Domain layer must not depend on presentation',
      severity: 'error',
      from: { path: '^apps/backend/src/modules/[^/]+/domain/' },
      to: { path: '^apps/backend/src/modules/[^/]+/presentation/' },
    },
    {
      name: 'no-domain-to-application',
      comment: 'Domain layer must not depend on application',
      severity: 'error',
      from: { path: '^apps/backend/src/modules/[^/]+/domain/' },
      to: { path: '^apps/backend/src/modules/[^/]+/application/' },
    },
    {
      name: 'no-application-to-infrastructure',
      comment: 'Application layer must not depend on infrastructure',
      severity: 'error',
      from: {
        path: '^apps/backend/src/modules/[^/]+/application/',
        pathNot: [
          '\\.unit\\.test\\.ts$',
          '^apps/backend/src/modules/data-providers/application/',
          'simulate-draft-fairness\\.use-case\\.ts$',
          'draft-board\\.use-cases\\.ts$',
        ],
      },
      to: { path: '^apps/backend/src/modules/[^/]+/infrastructure/' },
    },
    {
      name: 'no-application-to-presentation',
      comment: 'Application layer must not depend on presentation',
      severity: 'error',
      from: {
        path: '^apps/backend/src/modules/[^/]+/application/',
        pathNot: [
          '\\.unit\\.test\\.ts$',
          'room-league\\.use-cases\\.ts$',
        ],
      },
      to: { path: '^apps/backend/src/modules/[^/]+/presentation/' },
    },
    {
      name: 'no-presentation-to-infrastructure',
      comment: 'Presentation must not depend on infrastructure (except module wiring)',
      severity: 'error',
      from: {
        path: '^apps/backend/src/modules/[^/]+/presentation/',
        pathNot: [
          '\\.module\\.ts$',
          'draft-balance-response\\.mapper\\.ts$',
        ],
      },
      to: { path: '^apps/backend/src/modules/[^/]+/infrastructure/' },
    },
    {
      name: 'no-application-nestjs',
      comment: 'Application layer must not import NestJS',
      severity: 'error',
      from: {
        path: '^apps/backend/src/modules/[^/]+/application/',
        pathNot: ['^apps/backend/src/modules/[^/]+/application/services/'],
      },
      to: { path: '@nestjs' },
    },
    {
      name: 'no-domain-nestjs',
      comment: 'Domain layer must not import NestJS',
      severity: 'error',
      from: { path: '^apps/backend/src/modules/[^/]+/domain/' },
      to: { path: '@nestjs' },
    },
    {
      name: 'no-domain-prisma',
      comment: 'Domain layer must not import Prisma',
      severity: 'error',
      from: { path: '^apps/backend/src/modules/[^/]+/domain/' },
      to: { path: '@prisma' },
    },
    {
      name: 'no-application-prisma',
      comment: 'Application layer must not import Prisma',
      severity: 'error',
      from: { path: '^apps/backend/src/modules/[^/]+/application/' },
      to: { path: '@prisma' },
    },
    {
      name: 'no-feature-domain-to-data-providers',
      comment: 'Feature domain layers must not depend on data-providers module',
      severity: 'error',
      from: {
        path: '^apps/backend/src/modules/(players|teams|leagues)/domain/',
      },
      to: { path: '^apps/backend/src/modules/data-providers/' },
    },
    {
      name: 'no-circular',
      comment: 'Circular dependencies are forbidden',
      severity: 'error',
      from: { pathNot: ['\\.module\\.ts$'] },
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.depcruise.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
