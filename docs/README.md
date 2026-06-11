# PULSE Documentation

Welcome to the PULSE (Public Understanding and Local Service Evaluation) documentation.

## Quick Links

- [Main README](../README.md) - Project overview and getting started
- [AI Rules](AI_RULES.md) - Development guidelines and coding standards
- [System Overview](SYSTEM_OVERVIEW.md) - Architecture and system design
- [Project Structure](PROJECT_STRUCTURE.md) - Codebase organization

## Documentation Structure

### 📁 `/api-docs/`
API documentation and endpoint references
- API specifications
- Endpoint documentation
- Integration guides

### 📁 `/features/`
Feature-specific documentation
- CPAP Module
- CSIS Workflow
- Analytics Dashboard
- Survey Management
- Supervisor Assignments
- And more...

### 📁 `/testing/`
Testing documentation and reports
- Testing checklists
- Test results
- QA reports
- Accessibility testing
- Performance testing
- Cross-browser testing

### 📁 `/deployment/`
Deployment guides and procedures
- Railway deployment
- Environment setup
- Production deployment
- Rollback procedures

### 📁 `/migrations/`
Database migration documentation
- Migration guides
- Schema changes
- Rollback procedures
- Migration summaries

### 📁 `/root-docs/`
Documentation that was previously in the root directory
- User guides
- Quick start guides
- Implementation notes

### 📁 `/railway/`
Railway-specific deployment documentation

### 📁 `/archived-ml-algorithm-selection/`
Historical ML algorithm selection documentation

## Common Tasks

### For Developers
1. Read [AI_RULES.md](AI_RULES.md) for coding standards
2. Check [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) for architecture
3. Review feature docs in `/features/` before implementing changes
4. Run tests following guides in `/testing/`

### For Administrators
1. Review [User Manual](root-docs/USER_MANUAL.txt)
2. Check feature-specific guides in `/features/`
3. Follow deployment procedures in `/deployment/`

### For Testers
1. Use checklists in `/testing/`
2. Review feature documentation in `/features/`
3. Check accessibility and performance testing guides

## Finding Documentation

### By Feature
- **CPAP Module**: `/features/*CPAP*.md`
- **CSIS Workflow**: `/features/*CSIS*.md`
- **Analytics**: `/features/*ANALYTICS*.md`
- **Survey Management**: `/features/*SURVEY*.md`
- **Supervisor Assignments**: `/features/*SUPERVISOR*.md`

### By Task
- **Testing**: `/testing/*TESTING*.md`
- **Deployment**: `/deployment/*DEPLOYMENT*.md`
- **Migration**: `/migrations/*MIGRATION*.md`
- **API Integration**: `/api-docs/*API*.md`

## Recent Changes

For recent feature implementations and changes, see:
- [RECENT_FEATURES_INDEX.md](RECENT_FEATURES_INDEX.md)
- [RECENT_CHANGES_INDEX.md](RECENT_CHANGES_INDEX.md)

## Contributing

When adding new documentation:
1. Place it in the appropriate subdirectory
2. Use clear, descriptive filenames
3. Update this README if adding new categories
4. Follow the existing documentation format
5. Include code examples where applicable

## Support

For technical support or questions:
- Check relevant documentation first
- Review troubleshooting guides in feature docs
- Create an issue in the repository
- Contact the development team
