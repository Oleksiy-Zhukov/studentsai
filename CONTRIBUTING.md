# Contributing to StudentsAI

Thank you for your interest in contributing to StudentsAI! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- Git

### Development Setup

1. **Fork the repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/studentsai-mvp.git
   cd studentsai-mvp
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Oleksiy-Zhukov/studentsai-mvp.git
   ```

3. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

5. **Create a feature branch**
   ```bash
   git checkout dev
   git pull upstream dev
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Workflow

### Branch Naming Convention
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Message Format
Use conventional commits:
- `feat: add keyword extraction feature`
- `fix: resolve email service timeout`
- `docs: update README with setup instructions`
- `refactor: improve note similarity algorithm`
- `test: add unit tests for AI service`

### Pull Request Process

1. **Make your changes** on your feature branch
2. **Test thoroughly** - ensure your changes work as expected
3. **Update documentation** if needed
4. **Create a Pull Request** targeting the `dev` branch
5. **Fill out the PR template** completely
6. **Request review** from maintainers

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Manual Testing
- Test your changes in both light and dark themes
- Verify responsive design on different screen sizes
- Test with different user roles and permissions

## 📝 Code Style

### Python (Backend)
- Follow PEP 8 style guidelines
- Use type hints where possible
- Add docstrings for functions and classes
- Keep functions focused and small

### TypeScript/React (Frontend)
- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable and function names

## 🐛 Reporting Issues

### Bug Reports
Use the bug report template and include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests
Use the feature request template and include:
- Clear description of the feature
- Use case and benefits
- Implementation ideas if you have them
- Priority level

## 🔧 Project Structure

```
studentsai-mvp/
├── backend/                 # FastAPI backend
│   ├── app/                # Main application code
│   ├── alembic/            # Database migrations
│   └── tests/              # Backend tests
├── frontend/               # Next.js frontend
│   ├── src/                # Source code
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities and API client
│   └── public/             # Static assets
└── docs/                   # Documentation
```

## 🎯 Areas for Contribution

### High Priority
- Bug fixes and performance improvements
- UI/UX enhancements
- Test coverage improvements
- Documentation updates

### Medium Priority
- New AI features
- Advanced note organization
- Study analytics
- Mobile responsiveness

### Low Priority
- Advanced graph visualizations
- Export/import features
- Integration with external tools

## 📞 Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Use GitHub Issues for bugs and feature requests
- **Email**: Contact the maintainer for sensitive issues

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📄 License

By contributing to StudentsAI, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to StudentsAI! 🎉
