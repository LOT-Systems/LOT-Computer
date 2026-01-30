# Repository Organization Plan

## Current Issues

1. **75+ markdown files** scattered in root directory
2. **Multiple config files** (tsconfig.*, *.yaml)
3. **Test files** scattered in root
4. **Shell scripts** in multiple locations
5. **Backup files** not cleaned up
6. **Compiled code** in `server/` directory

## Proposed Structure

```
LOT-Computer/
├── README.md                    # Main readme (keep)
├── package.json                 # Dependencies (keep)
├── tsconfig.json                # Main TS config (keep)
├── tsconfig.server.json         # Server TS config (keep)
├── .gitignore                   # Git ignore (keep)
├── .npmrc                       # NPM config (keep)
│
├── docs/                        # All documentation
│   ├── README.md                # Documentation index
│   ├── technical/               # Technical documentation
│   │   ├── AI-ENGINE-GUIDE.md
│   │   ├── AI-ENGINE-SWITCHING-TEST.md
│   │   ├── MEMORY-ENGINE-*.md (all memory engine docs)
│   │   ├── PSYCHOLOGICAL-DEPTH-ANALYSIS.md
│   │   ├── QUANTUM-INTENT-ENGINE.md
│   │   └── ...
│   ├── deployment/              # Deployment guides
│   │   ├── DEPLOY-TO-DIGITAL-OCEAN.md
│   │   ├── DEPLOYMENT-*.md (all deployment docs)
│   │   ├── PRODUCTION-*.md
│   │   └── ...
│   ├── setup/                   # Setup guides
│   │   ├── RESEND-SETUP.md
│   │   ├── DB-ADMIN-README.md
│   │   ├── MEMORY-ENGINE-SETUP.md
│   │   └── ...
│   ├── releases/                # Release notes
│   │   ├── RELEASE-NOTES-*.md
│   │   ├── VERSION-*.md
│   │   ├── STABLE-*.md
│   │   └── ...
│   ├── badges/                  # Badge documentation
│   │   ├── BADGE_*.md (all badge docs)
│   │   └── ...
│   ├── diagnostics/             # Diagnostic docs
│   │   ├── DEBUG-*.md
│   │   ├── PROFILE-*.md
│   │   ├── SITE-LOADING-*.md
│   │   └── ...
│   └── security/                # Security docs
│       ├── SECURITY-FIXES.md
│       └── REPO-ISSUES-SUMMARY.md
│
├── scripts/                     # All scripts
│   ├── db/                      # Database scripts (existing)
│   ├── build/                   # Build scripts (existing)
│   ├── monitoring/              # Monitoring scripts (existing)
│   ├── tests/                   # Test scripts (NEW)
│   │   ├── test-cold-start.ts
│   │   ├── test-db.ts
│   │   ├── test-email.ts
│   │   ├── test-env.ts
│   │   ├── test-env-simple.ts
│   │   ├── test-production.js
│   │   └── test-resend.*
│   ├── deployment/              # Deployment scripts (NEW)
│   │   ├── APPLY-NEW-SPEC.sh
│   │   ├── CHECK-DEPLOYMENT-STATUS.sh
│   │   └── remove-sensitive-files.sh
│   └── utils/                   # Utility scripts (NEW)
│       ├── cleanup-backup-files.sh
│       └── cron-backup-example.sh
│
├── config/                      # Configuration files
│   ├── app.yaml.example         # Deployment config template
│   ├── digital-ocean-app-spec.yaml.example
│   └── ...
│
├── src/                         # Source code (existing)
├── public/                      # Public assets (existing)
├── migrations/                  # Database migrations (existing)
├── templates/                   # EJS templates (existing)
└── prisma/                      # Prisma schema (existing)
```

## Organization Rules

### Documentation Categories

**Technical** (`docs/technical/`):
- AI engine guides
- Memory engine documentation
- Psychological analysis docs
- Quantum intent engine
- Core system architecture

**Deployment** (`docs/deployment/`):
- Deployment guides
- Production setup
- Digital Ocean configs
- Health checks
- Status pages

**Setup** (`docs/setup/`):
- Initial setup guides
- Service configuration (Resend, DB, etc.)
- Admin guides
- API key setup

**Releases** (`docs/releases/`):
- Release notes
- Version history
- Stable version docs
- Changelogs

**Badges** (`docs/badges/`):
- Badge design docs
- Badge implementation guides
- Badge progression docs

**Diagnostics** (`docs/diagnostics/`):
- Debug guides
- Profile diagnostics
- Site loading issues
- Memory engine diagnostics

**Security** (`docs/security/`):
- Security fixes
- Repository issues
- Security best practices

### Script Organization

**Tests** (`scripts/tests/`):
- All `test-*.ts` and `test-*.js` files

**Deployment** (`scripts/deployment/`):
- Deployment-related shell scripts
- Status check scripts

**Utils** (`scripts/utils/`):
- General utility scripts
- Cleanup scripts
- Backup scripts

## Files to Keep in Root

- `README.md` - Main project readme
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `tsconfig.server.json` - Server TypeScript config
- `.gitignore` - Git ignore rules
- `.npmrc` - NPM configuration
- `nodemon.json` - Nodemon config
- `postcss.config.cjs` - PostCSS config
- `tailwind.config.js` - Tailwind config
- `esbuild.config.js` - ESBuild config
- `Dockerfile` - Docker configuration
- `Procfile` - Process file for deployment
- `yarn.lock` - Lock file (keep only one)

## Files to Remove

- `yarn 2.lock` - Malformed filename
- `package.json.backup` - Backup file
- `package.json.working` - Working file
- `package.json.working-backup` - Backup file
- `postcss.config.js.working-backup` - Backup file
- `server/` directory - Compiled output (should be in dist/)

## Migration Steps

1. Create directory structure
2. Move documentation files to appropriate subdirectories
3. Move test files to `scripts/tests/`
4. Move deployment scripts to `scripts/deployment/`
5. Move utility scripts to `scripts/utils/`
6. Move config examples to `config/`
7. Update any references in code/docs
8. Clean up root directory
9. Update README with new structure
