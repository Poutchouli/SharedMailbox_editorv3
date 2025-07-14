# Shared Mailbox Manager

A web-based tool for managing Microsoft Exchange shared mailbox access permissions. This application allows administrators to easily view, add, and remove users from shared mailboxes while enforcing business rules and tracking changes.

## Features

- **CSV Import**: Upload shared mailbox data in CSV format
- **Interactive Management**: Add/remove users with an intuitive interface
- **User Limit Enforcement**: Prevents users from having more than 7 shared mailboxes
- **Autocomplete**: Smart suggestions when adding existing users
- **Change Tracking**: Downloads a CSV with all modifications for easy implementation
- **Search & Filter**: Quickly find specific mailboxes
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- CSV file with shared mailbox data
- For Docker deployment: Docker and Docker Compose

### Installation Options

#### Option 1: Docker (Recommended)

The easiest way to run the application is using Docker:

```bash
# Clone the repository
git clone https://github.com/Poutchouli/SharedMailbox_editorv3.git
cd SharedMailbox_editorv3

# Run with Docker Compose (easiest)
docker-compose up -d

# Or run the automated script
# On Linux/Mac:
chmod +x scripts/docker-run.sh
./scripts/docker-run.sh

# On Windows:
scripts\docker-run.bat
```

The application will be available at `http://localhost:17652`

#### Option 2: Manual Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/Poutchouli/SharedMailbox_editorv3.git
   ```

2. Navigate to the project directory:
   ```bash
   cd SharedMailbox_editorv3
   ```

3. Open `index.html` in your web browser or serve it using a local web server.

### Using a Local Web Server (Recommended)

For better development experience, use a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Usage

### CSV Format

The application expects a CSV file with the following format:

```csv
"Identity";"User";"AccessRights"
"Sales Team";"john.doe@company.com";"FullAccess"
"Sales Team";"jane.smith@company.com";"FullAccess"
"HR Department";"hr.admin@company.com";"FullAccess"
```

### Step-by-Step Guide

1. **Upload CSV**: Click "Choose file" and select your shared mailbox CSV
2. **Review Data**: The application will display all shared mailboxes and their users
3. **Make Changes**:
   - **Add Users**: Type an email in the "User email" field and click "Add"
   - **Remove Users**: Click the "×" button next to any user
   - **Search**: Use the search box to filter mailboxes
4. **Download Changes**: Click "Terminé (Download Changes)" to get a CSV with your modifications

### Business Rules

- **7 Mailbox Limit**: Users cannot be added to more than 7 shared mailboxes
- **Duplicate Prevention**: Users cannot be added to the same mailbox twice
- **Change Tracking**: All additions and removals are tracked for audit purposes

## File Structure

```
SharedMailbox_editorv3/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # Custom styles and Tailwind overrides
├── js/
│   ├── app.js          # Main application logic
│   ├── csv-parser.js   # CSV parsing functionality
│   └── ui-components.js # UI component creation (autocomplete, etc.)
├── docker/
│   └── nginx.conf      # Nginx configuration for Docker
├── scripts/
│   ├── docker-run.sh   # Docker setup script (Linux/Mac)
│   └── docker-run.bat  # Docker setup script (Windows)
├── Dockerfile          # Docker image configuration
├── docker-compose.yml  # Docker Compose configuration
├── .dockerignore       # Docker ignore rules
├── package.json        # Node.js project configuration
├── README.md           # This file
├── LICENSE             # MIT license
└── .gitignore          # Git ignore rules
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Styling with Tailwind CSS framework
- **Vanilla JavaScript**: No dependencies, pure JS
- **Tailwind CSS**: Utility-first CSS framework
- **Inter Font**: Modern typography

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

### Docker Development

For development with Docker:

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

### Local Development

For local development without Docker:

### Code Style

- Use meaningful variable and function names
- Add JSDoc comments for functions
- Follow consistent indentation (2 spaces)
- Use modern JavaScript features (ES6+)

### Testing

The application can be tested by:
1. Loading sample CSV files
2. Testing edge cases (empty files, malformed data)
3. Verifying business rules (7 mailbox limit)
4. Cross-browser testing

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0 (2025-01-14)
- Initial release
- CSV import/export functionality
- User management with 7 mailbox limit
- Autocomplete user suggestions
- Responsive design
- Change tracking

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/Poutchouli/SharedMailbox_editorv3/issues) page
2. Create a new issue with detailed information
3. Include browser version and CSV sample if applicable

## Docker Management

### Quick Start with Docker

```bash
# Clone and run (easiest method)
git clone https://github.com/Poutchouli/SharedMailbox_editorv3.git
cd SharedMailbox_editorv3
docker-compose up -d

# Access the application at http://localhost:17652
```

### NPM Scripts for Docker

```bash
npm run compose:up      # Start with Docker Compose
npm run compose:down    # Stop Docker Compose
npm run compose:logs    # View logs
npm run docker:build   # Build Docker image
npm run docker:run     # Run container
npm run docker:stop    # Stop container
npm run docker:logs    # View container logs
npm run docker:clean   # Clean up containers and images
```

### Manual Docker Commands

```bash
# Build the image
docker build -t shared-mailbox-manager .

# Run the container
docker run -d --name shared-mailbox-manager -p 17652:80 shared-mailbox-manager

# View logs
docker logs -f shared-mailbox-manager

# Stop the container
docker stop shared-mailbox-manager
```

### Production Deployment

For production deployment:

1. **SSL/TLS**: Use a reverse proxy (Nginx/Traefik) for SSL termination
2. **Security**: Review security headers in `docker/nginx.conf`
3. **Monitoring**: Implement logging and health checks
4. **Scaling**: Use Docker Swarm or Kubernetes for scaling

## Roadmap

- [ ] Dark mode support
- [ ] Bulk user operations
- [ ] Export to different formats (Excel, JSON)
- [ ] User role management
- [ ] Integration with Microsoft Graph API
- [ ] Audit log viewing
