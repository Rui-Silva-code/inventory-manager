# Inventory Manager

Internal inventory management system designed to help companies **track, search, and manage stock** across physical locations.

This project is built with a **real-world mindset**, focusing on **clarity, scalability, and maintainability**, especially for environments with **large inventories** and **multiple users**.

---

## Purpose & Motivation

In many companies I worked for, inventory tracking is still handled using **spreadsheets or fragmented tools**.  
This often leads to:

- Slow or inefficient searches
- Inconsistent data
- Accidental edits or deletions
- Difficulty tracking where items physically exist

This project was created to **explore better approaches to inventory management**, while also serving as a **learning platform** to understand how **frontend and backend systems are structured in production-style applications**.

---

## Project Structure

The repository is organized as a **monorepo**, separating frontend and backend concerns:

```bash
inventory-manager/
├── frontend/ # Client-side application
├── backend/ # Server-side API
└── README.md
````

The structure is expected to evolve as new features and requirements are added.

---

## Technologies Used

### Frontend
- React
- JavaScript (ES6+)
- HTML / CSS

### Backend
- Node.js
- Express

### Data
- LocalStorage (current, for development)
- PostgreSQL (planned)

### Tooling
- Git & GitHub
- npm
- VS Code

---

## Current Status

- Frontend application implemented and functional
- API abstraction layer in place
- Backend server initialized
- Database integration planned
- Authentication and multi-user support planned

---

## Notes

This project is intentionally **iterative**.  
Features, structure, and implementation details will evolve as the project grows and new requirements are explored.

The focus is on:
- Writing maintainable code
- Making thoughtful architectural decisions
- Improving real-world problem-solving skills

---

## Future Work

Planned next steps include:
- Database persistence
- Multi-user support
- Access control
- Performance optimizations
- Deployment

Details will be expanded as the project matures.

